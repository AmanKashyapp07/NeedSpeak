"""
WhatsApp text preprocessor — Member 2, Feature 2.
Cleans up WhatsApp forwarded messages before feeding them into the
extraction pipeline.

Handles:
- "Forwarded" / "Forwarded many times" headers
- Timestamps in various WhatsApp formats
- Sender name attributions ("~ Name" or "Name:")
- Multi-line collapsed blank lines
- Group chat noise
"""

import re
import logging

logger = logging.getLogger(__name__)


def parse_whatsapp_forward(text: str) -> str:
    """
    Clean WhatsApp forwarded message text.
    Removes timestamps, sender names, 'Forwarded' headers, and other
    WhatsApp-specific formatting artifacts.

    Returns clean text ready for the extraction pipeline.

    Args:
        text: Raw WhatsApp forwarded message text.

    Returns:
        Cleaned text with WhatsApp artifacts removed.

    Raises:
        ValueError: If text is empty or only whitespace after cleaning.
    """
    if not text or not text.strip():
        raise ValueError("Empty WhatsApp message — nothing to process.")

    original_text = text

    # 1. Remove "Forwarded" / "Forwarded many times" header lines
    #    These appear at the top of forwarded messages
    text = re.sub(
        r'^\s*🔁?\s*Forwarded\s*(many\s+times?)?\s*$',
        '',
        text,
        flags=re.IGNORECASE | re.MULTILINE,
    )

    # 2. Remove WhatsApp timestamps in various formats:
    #    [12/06/25, 10:30 AM]   — bracket style
    #    (12/06/25, 10:30)      — parenthesis style
    #    12/06/25, 10:30 AM -   — dash-separated style
    #    [12-Jun-25 10:30:45]   — verbose date style
    text = re.sub(
        r'[\[\(]?\d{1,2}[\\/\-]\d{1,2}[\\/\-]\d{2,4}'  # date part
        r'[,\s]*\d{1,2}:\d{2}(?::\d{2})?'               # time part
        r'(?:\s*[AaPp][Mm])?'                             # optional AM/PM
        r'[\]\)]?\s*[\-–—]?\s*',                         # closing bracket + dash
        '',
        text,
    )

    # 3. Remove "~ Name" attribution lines (WhatsApp shows these for forwarded msgs)
    text = re.sub(r'^\s*~\s*.+$', '', text, flags=re.MULTILINE)

    # 4. Remove "Name:" prefixes at start of lines (sender names in group chats)
    #    Be careful: only strip if the name part is short (≤30 chars) and
    #    followed by actual content. Skip lines that look like "Ingredients:" etc.
    #    We use a negative lookahead for common food/recipe heading words
    text = re.sub(
        r'^(?!(?:Ingredient|Recipe|Method|Step|Direction|Instruction|Note|Serving|Total|Price|Cost|Budget|Item|Quantity))[A-Za-z\s]{1,30}:\s',
        '',
        text,
        flags=re.MULTILINE,
    )

    # 5. Remove WhatsApp emoji reactions ("👍 1", "❤️ 3", etc.) on their own lines
    text = re.sub(r'^\s*[\U0001F44D\U0001F44E❤️😂🔥👏🙏😍💯🎉✅]+\s*\d*\s*$', '', text, flags=re.MULTILINE)

    # 6. Remove "This message was deleted" / "You deleted this message" lines
    text = re.sub(
        r'^\s*(This message was deleted|You deleted this message|<Media omitted>)\s*$',
        '',
        text,
        flags=re.IGNORECASE | re.MULTILINE,
    )

    # 7. Remove "Sent from" footers
    text = re.sub(
        r'^\s*Sent from (my )?(iPhone|Android|WhatsApp).*$',
        '',
        text,
        flags=re.IGNORECASE | re.MULTILINE,
    )

    # 8. Collapse 3+ blank lines into 2
    text = re.sub(r'\n{3,}', '\n\n', text)

    cleaned = text.strip()

    if not cleaned:
        raise ValueError(
            "No usable content found in the WhatsApp message after cleaning. "
            "The message may contain only media, deleted messages, or reactions."
        )

    logger.info(
        f"[whatsapp_input] Cleaned WhatsApp text: "
        f"{len(original_text)} chars → {len(cleaned)} chars"
    )

    return cleaned
