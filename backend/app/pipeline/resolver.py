"""
SKU Resolution — Pure deterministic code, ZERO Bedrock calls.

Matches extracted items to real products in the catalog using:
1. Exact name match (case-insensitive)
2. Keyword overlap score
3. Category fallback (highest rated in category)

Then calculates quantities via unit normalization and handles budget optimization.
"""

from __future__ import annotations

import logging
import math
from typing import Optional

from app.models import ExtractedItem, CartItem, UnavailableItem, UnavailableReason
from app.unit_conversions import normalize_to_base_unit
from app.db.dynamo import get_all_products
from app.db.s3 import store_failed_match_log

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# SKU Matching
# ---------------------------------------------------------------------------
def _tokenize(text: str) -> set[str]:
    """Split text into lowercase word tokens for matching."""
    return set(text.lower().replace("-", " ").replace("_", " ").split())


def _exact_match(item_name: str, products: list[dict]) -> Optional[dict]:
    """Try exact case-insensitive match on product name."""
    name_lower = item_name.lower().strip()
    for p in products:
        if p["name"].lower() == name_lower:
            if p.get("in_stock", True):
                return p
    return None


STOP_WORDS = {
    "fresh", "organic", "large", "small", "medium", "raw", "whole", "pure", "natural", 
    "best", "good", "with", "and", "or", "of", "for", "in", "to", "a", "an", "the"
}

def _keyword_overlap_match(item_name: str, products: list[dict], category: Optional[str] = None) -> Optional[dict]:
    """
    Find the product with the highest keyword overlap with the item name.
    Requires a minimum matching threshold to avoid false positives.
    """
    item_tokens = _tokenize(item_name) - STOP_WORDS
    if not item_tokens:
        item_tokens = _tokenize(item_name)  # fallback if all are stop words
        
    best_product = None
    best_score = 0

    for p in products:
        if not p.get("in_stock", True):
            continue

        # Build keyword set
        product_keywords = set()
        kw_raw = p.get("keywords", [])
        if isinstance(kw_raw, (set, list)):
            for kw in kw_raw:
                product_keywords.update(_tokenize(str(kw)))
        elif isinstance(kw_raw, str):
            product_keywords.update(_tokenize(kw_raw))

        product_keywords.update(_tokenize(p.get("name", "")))
        product_keywords = product_keywords - STOP_WORDS

        # Count overlapping words
        overlap_tokens = item_tokens & product_keywords
        overlap = len(overlap_tokens)

        # Bonus: if categories match, boost the score slightly
        category_boost = 0.0
        if category and p.get("category", "").lower() == category.lower():
            category_boost = 0.5

        score = overlap + category_boost

        if overlap > 0 and score > best_score:
            # Additionally verify match percentage for multi-word requests to filter noise
            if len(item_tokens) > 1:
                ratio = overlap / len(item_tokens)
                if overlap < 2 and ratio < 0.4:
                    continue
            best_score = score
            best_product = p

    return best_product



def _category_fallback(category: str, products: list[dict]) -> Optional[dict]:
    """Pick the highest-rated in-stock product in the given category."""
    candidates = [
        p for p in products
        if p.get("category", "").lower() == category.lower()
        and p.get("in_stock", True)
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.get("rating", 0))


def _match_product(item: ExtractedItem, products: list[dict]) -> Optional[dict]:
    """
    Three-tier matching strategy with safeguards:
    1. Exact name match
    2. Keyword overlap score
    3. Category fallback (only if some token similarity or name association exists)
    """
    # 1. Exact match
    match = _exact_match(item.name, products)
    if match:
        logger.debug(f"Exact match: '{item.name}' -> {match['sku']}")
        return match

    # 2. Keyword overlap
    match = _keyword_overlap_match(item.name, products, item.category)
    if match:
        logger.debug(f"Keyword match: '{item.name}' -> {match['sku']} (keywords)")
        return match

    # 3. Category fallback with safety overlap guard
    match = _category_fallback(item.category, products)
    if match:
        item_tokens = _tokenize(item.name)
        prod_tokens = _tokenize(match.get("name", "")) | set(match.get("keywords", []))
        # Only allow fallback if there is at least 1 matching token or category keyword is in the name
        if (item_tokens & prod_tokens) or (item.category.lower() in item.name.lower()):
            logger.debug(f"Category fallback: '{item.name}' -> {match['sku']} (category: {item.category})")
            return match
        else:
            logger.warning(f"Category fallback for '{item.name}' to '{match['name']}' rejected due to zero token overlap.")

    logger.warning(f"No match found for: '{item.name}' (category: {item.category})")
    return None



# ---------------------------------------------------------------------------
# Quantity Calculation
# ---------------------------------------------------------------------------
def _calculate_quantity_units(
    recipe_quantity: float,
    recipe_unit: str,
    product_unit: str,
    product_unit_quantity: float,
    item_name: str = "",
) -> int:
    """
    Calculate how many product units to purchase.

    Example: recipe needs 300g, product is 1000g bag -> ceil(300/1000) = 1 bag
    Example: recipe needs 2.5L, product is 1000ml bottle -> ceil(2500/1000) = 3 bottles
    """
    # Normalize recipe quantity to base unit
    recipe_base_amount, recipe_base_unit = normalize_to_base_unit(
        recipe_quantity, recipe_unit, item_name
    )

    # If units are compatible (both g, both ml, etc.)
    product_base_unit = product_unit.lower().strip()

    # Direct comparison if same base unit
    if recipe_base_unit == product_base_unit:
        return max(1, math.ceil(recipe_base_amount / product_unit_quantity))

    # Handle ml <-> g cross-conversion (approximately 1:1 for most food items)
    # e.g., "1 cup yogurt" -> 240ml, but product is sold in grams
    if (recipe_base_unit == "ml" and product_base_unit == "g") or \
       (recipe_base_unit == "g" and product_base_unit == "ml"):
        return max(1, math.ceil(recipe_base_amount / product_unit_quantity))

    # Handle piece/pack — just use the quantity directly
    if recipe_base_unit in ("piece", "pack") or product_base_unit in ("piece", "pack"):
        return max(1, math.ceil(recipe_quantity))

    # Cross-unit — can't reliably convert, default to 1
    logger.warning(
        f"Cannot convert {recipe_quantity}{recipe_unit} ({recipe_base_unit}) "
        f"to product unit {product_unit} for '{item_name}'. Defaulting to 1."
    )
    return 1


# ---------------------------------------------------------------------------
# Budget Optimization
# ---------------------------------------------------------------------------
def _optimize_for_budget(
    cart_items: list[CartItem],
    products: list[dict],
    budget_inr: int,
) -> tuple[list[CartItem], bool]:
    """
    Greedy budget optimization:
    1. Check if total exceeds budget
    2. For each item over its category average price, find cheaper alternative
    3. If still over budget, flag most expensive non-essential items
    """
    total = sum(item.total_price_inr for item in cart_items)
    if total <= budget_inr:
        return cart_items, False

    logger.info(f"Cart total Rs.{total} exceeds budget Rs.{budget_inr}. Optimizing...")

    # Group products by category for alternative lookup
    category_products: dict[str, list[dict]] = {}
    for p in products:
        cat = p.get("category", "")
        if cat not in category_products:
            category_products[cat] = []
        category_products[cat].append(p)

    optimized = []
    for item in cart_items:
        if item.optional:
            optimized.append(item)
            continue

        # Find the product this item was matched to
        current_product = None
        for p in products:
            if p["sku"] == item.sku:
                current_product = p
                break

        if not current_product:
            optimized.append(item)
            continue

        category = current_product.get("category", "")
        alternatives = [
            p for p in category_products.get(category, [])
            if p["sku"] != item.sku
            and p.get("in_stock", True)
            and p.get("price_inr", float("inf")) < current_product.get("price_inr", 0)
        ]

        if alternatives:
            cheapest = min(alternatives, key=lambda p: p.get("price_inr", float("inf")))
            new_price = cheapest["price_inr"]

            # Recalculate quantity units based on the substitute's packaging size
            needed_amount = item.quantity_units * item.unit_quantity
            cheapest_unit_qty = float(cheapest.get("unit_quantity", 1))
            new_quantity_units = max(1, math.ceil(needed_amount / cheapest_unit_qty))
            new_total = new_price * new_quantity_units

            # Attach as a pending suggestion instead of auto-swapping
            savings = item.total_price_inr - float(new_total)
            updated_item = item.model_copy(update={
                "pending_substitution": {
                    "name": cheapest["name"],
                    "sku": cheapest["sku"],
                    "brand": cheapest.get("brand", ""),
                    "price_per_unit_inr": float(new_price),
                    "quantity_units": new_quantity_units,
                    "unit": cheapest.get("unit", item.unit),
                    "unit_quantity": cheapest_unit_qty,
                    "total_price_inr": float(new_total),
                    "reason": f"Save ₹{savings:.0f}",
                },
                "substituted": False,  # don't auto-swap anymore
            })
            optimized.append(updated_item)
            logger.info(f"Pending substitution for '{item.name}' -> '{cheapest['name']}' (potential saving ₹{savings:.0f})")
        else:
            optimized.append(item)

    new_total = sum(i.total_price_inr for i in optimized)
    budget_exceeded = new_total > budget_inr

    return optimized, budget_exceeded


# ---------------------------------------------------------------------------
# Main Resolution Entry Point
# ---------------------------------------------------------------------------
def resolve_cart(
    items: list[ExtractedItem],
    budget_inr: Optional[int] = None,
    session_id: str = "",
    mock_mode: bool = False,
) -> tuple[list[CartItem], list[UnavailableItem], float, bool]:
    """
    Resolve extracted items to real products in the catalog.

    Returns:
        (cart_items, unavailable_items, total_price, budget_exceeded)
    """
    products = get_all_products(mock_mode=mock_mode)
    cart_items: list[CartItem] = []
    unavailable_items: list[UnavailableItem] = []

    for item in items:
        product = _match_product(item, products)

        if product is None:
            unavailable_items.append(UnavailableItem(
                name=item.name,
                reason=UnavailableReason.NOT_IN_CATALOG,
            ))
            # Log failed match for catalog improvement
            store_failed_match_log(item.name, session_id)
            continue

        if not product.get("in_stock", True):
            unavailable_items.append(UnavailableItem(
                name=item.name,
                reason=UnavailableReason.OUT_OF_STOCK,
            ))
            continue

        # Calculate how many product units needed
        quantity_units = _calculate_quantity_units(
            recipe_quantity=item.quantity,
            recipe_unit=item.unit,
            product_unit=product.get("unit", "piece"),
            product_unit_quantity=float(product.get("unit_quantity", 1)),
            item_name=item.name,
        )

        price_per_unit = float(product.get("price_inr", 0))
        total_price = price_per_unit * quantity_units

        cart_items.append(CartItem(
            sku=product["sku"],
            name=product["name"],
            brand=product.get("brand", ""),
            quantity_units=quantity_units,
            unit=product.get("unit", "piece"),
            unit_quantity=float(product.get("unit_quantity", 1)),
            price_per_unit_inr=price_per_unit,
            total_price_inr=total_price,
            optional=item.optional,
            substituted=False,
            substitution_reason=None,
            matched_from=[f"{item.name} ({item.quantity} {item.unit})"],
        ))

    # Fix 1: SKU Deduplication & Quantity Merging
    merged_items: dict[str, CartItem] = {}
    for item in cart_items:
        if item.sku in merged_items:
            existing = merged_items[item.sku]
            merged_qty = existing.quantity_units + item.quantity_units
            merged_items[item.sku] = existing.model_copy(update={
                "quantity_units": merged_qty,
                "total_price_inr": existing.price_per_unit_inr * merged_qty,
                "optional": existing.optional and item.optional,  # required if either is required
                "matched_from": existing.matched_from + item.matched_from
            })
        else:
            merged_items[item.sku] = item
    cart_items = list(merged_items.values())

    # Budget optimization
    budget_exceeded = False
    if budget_inr and cart_items:
        cart_items, budget_exceeded = _optimize_for_budget(cart_items, products, budget_inr)

    total_price = sum(item.total_price_inr for item in cart_items)

    logger.info(
        f"Resolution complete: {len(cart_items)} items in cart, "
        f"{len(unavailable_items)} unavailable, total Rs.{total_price:.0f}"
    )

    return cart_items, unavailable_items, total_price, budget_exceeded
