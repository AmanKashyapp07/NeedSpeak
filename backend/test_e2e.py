import requests
import json

url = "http://localhost:8000/api/parse"
headers = {"X-Mock-Mode": "1", "Content-Type": "application/json"}

# Test 1: Biryani recipe
print("=" * 60)
print("TEST 1: Chicken Biryani Recipe")
print("=" * 60)
payload = {
    "input_type": "text",
    "content": (
        "Chicken Biryani Recipe for 4 people:\n\n"
        "Ingredients:\n"
        "- 500g basmati rice\n"
        "- 750g chicken (bone-in pieces)\n"
        "- 3 large onions, thinly sliced\n"
        "- 2 tomatoes, chopped\n"
        "- 1 cup yogurt\n"
        "- 4 tbsp oil or ghee\n"
        "- 2 tbsp ginger-garlic paste\n"
        "- 1 tsp turmeric powder\n"
        "- 2 tsp red chili powder\n"
        "- 1 tbsp biryani masala\n"
        "- 1 tsp garam masala\n"
        "- Salt to taste\n"
        "- Fresh mint leaves\n"
        "- Fresh coriander leaves"
    ),
}

r = requests.post(url, json=payload, headers=headers, timeout=35)
data = r.json()
print(f"Status: {r.status_code}")
if r.status_code == 200:
    print(f"Intent: {data.get('intent_type')}")
    print(f"Cart items: {len(data.get('cart', []))}")
    print(f"Unavailable: {len(data.get('unavailable_items', []))}")
    print(f"Total: Rs.{data.get('total_price_inr', 0)}")
    print(f"Summary: {data.get('summary', '')[:120]}...")
    for item in data.get("cart", []):
        print(f"  - {item['name']} x{item['quantity_units']} @ Rs.{item['price_per_unit_inr']}  (matched: {item.get('matched_from', [])})")
    for item in data.get("unavailable_items", []):
        print(f"  [!] {item['name']} — {item['reason']}")
else:
    print(f"ERROR: {json.dumps(data, indent=2)}")

# Test 2: Party snacks with budget
print("\n" + "=" * 60)
print("TEST 2: Party Snacks (budget Rs.400)")
print("=" * 60)
payload2 = {
    "input_type": "text",
    "content": "bhai kal party hai, chips, cold drinks, popcorn le aana for 6 people roughly 400 rupay mein",
    "budget_inr": 400,
}
r2 = requests.post(url, json=payload2, headers=headers, timeout=35)
data2 = r2.json()
print(f"Status: {r2.status_code}")
if r2.status_code == 200:
    print(f"Intent: {data2.get('intent_type')}")
    print(f"Cart items: {len(data2.get('cart', []))}")
    print(f"Total: Rs.{data2.get('total_price_inr', 0)}")
    print(f"Budget exceeded: {data2.get('budget_exceeded')}")
    for item in data2.get("cart", []):
        sub = " [SUBSTITUTED]" if item.get("substituted") else ""
        print(f"  - {item['name']} x{item['quantity_units']} @ Rs.{item['price_per_unit_inr']}{sub}")
else:
    print(f"ERROR: {json.dumps(data2, indent=2)}")

# Test 3: School supplies
print("\n" + "=" * 60)
print("TEST 3: School Supplies")
print("=" * 60)
payload3 = {
    "input_type": "text",
    "content": (
        "School supplies list:\n"
        "- 5 notebooks (ruled, 180 pages)\n"
        "- 1 pack of blue pens\n"
    ),
}
r3 = requests.post(url, json=payload3, headers=headers, timeout=35)
data3 = r3.json()
print(f"Status: {r3.status_code}")
if r3.status_code == 200:
    print(f"Intent: {data3.get('intent_type')}")
    print(f"Cart items: {len(data3.get('cart', []))}")
    for item in data3.get("cart", []):
        print(f"  - {item['name']} x{item['quantity_units']}")
else:
    print(f"ERROR: {json.dumps(data3, indent=2)}")

# Test 4: Health check
print("\n" + "=" * 60)
print("TEST 4: Health Check")
print("=" * 60)
r4 = requests.get("http://localhost:8000/api/health", headers={"X-Mock-Mode": "1"}, timeout=5)
print(f"Status: {r4.status_code}")
print(f"Response: {r4.json()}")

print("\n[SUCCESS] All tests completed!")
