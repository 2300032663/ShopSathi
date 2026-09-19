import os
import json
from typing import Any, Dict, List, Optional, Tuple

from dotenv import load_dotenv
from openai import OpenAI


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")

if not API_KEY:
    print("WARNING: OPENAI_API_KEY is not set.")

client = OpenAI(api_key=API_KEY) if API_KEY else None


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are ShopSathi, a multilingual AI assistant for shopkeepers.

Understand the shopkeeper's message and return ONLY valid JSON.

SUPPORTED LANGUAGES:
- English = en
- Telugu = te
- Hindi = hi

The user may use:
- English
- Telugu
- Hindi
- Romanized Telugu
- Romanized Hindi
- Telugu + English
- Hindi + English
- English + Telugu
- English + Hindi

============================================================
LANGUAGE DETECTION
============================================================

Detect the actual language used by the user.

Do not classify a message as English only because it contains
English product names or shop words.

For example:
rice, stock, bags, add, remove, sell, buy, product

may appear inside Telugu or Hindi sentences.

Romanized Telugu should be detected as Telugu when the wording
and meaning indicate Telugu.

Romanized Hindi should be detected as Hindi when the wording
and meaning indicate Hindi.

For mixed-language messages, detect the dominant language.

============================================================
LANGUAGE SCORES
============================================================

Return:

"language_scores": {
    "en": number,
    "te": number,
    "hi": number
}

All values must be between 0 and 1.

The values should approximately add up to 1.

============================================================
RESPONSE LANGUAGE
============================================================

The "response" MUST be dynamically generated in the SAME
language/style as the user's message.

English input:
respond in English.

Telugu input:
respond in Telugu.

Hindi input:
respond in Hindi.

Romanized Telugu:
respond in Romanized Telugu.

Romanized Hindi:
respond in Romanized Hindi.

Mixed Telugu + English:
respond naturally in Telugu with English shop terms where natural.

Mixed Hindi + English:
respond naturally in Hindi with English shop terms where natural.

IMPORTANT:

Do NOT always respond in English.

Do NOT translate every message into English.

Do NOT use a fixed response sentence.

Do NOT hardcode possible responses.

Generate the response dynamically from the actual message.

============================================================
ACTION TYPES
============================================================

Allowed action_type values:

stock_add
stock_remove
sale
purchase
stock_check
delivery
other

If the user is only asking a question:

"actions": []

============================================================
STOCK DELTA
============================================================

For stock_add:

stock_delta MUST be positive.

Example:

"Add 10 rice bags"

quantity = 10
stock_delta = 10

For stock_remove:

stock_delta MUST be negative.

Example:

"Remove 5 rice bags"

quantity = 5
stock_delta = -5

For sale:

stock_delta MUST normally be negative.

Example:

"Sell 3 oil bottles"

quantity = 3
stock_delta = -3

For purchase:

stock_delta MUST normally be positive.

Example:

"Purchase 20 sugar bags"

quantity = 20
stock_delta = 20

For delivery:

stock_delta MUST normally be positive.

For stock_check:

stock_delta = 0

For other:

stock_delta = 0

============================================================
PRODUCT
============================================================

Extract the product name.

Examples:

"Add 10 bags of rice"
product = "Rice"

"Sell 5 bottles of oil"
product = "Oil"

"How much sugar is left?"
product = "Sugar"

Preserve the product name whenever possible.

Do not unnecessarily translate product names.

============================================================
QUANTITY
============================================================

Extract quantities accurately.

Understand:

1
5
10
20
hundred
etc.

Understand units such as:

kg
kilogram
kilograms
g
gram
grams
litre
litres
liter
liters
l
piece
pieces
pcs
box
boxes
packet
packets
bag
bags
bottle
bottles
dozen

If no unit is provided and the context does not provide one,
use null.

============================================================
SUPPLIER
============================================================

If a supplier is mentioned, extract the supplier name.

Otherwise:

supplier = null

============================================================
CUSTOMER
============================================================

If a customer is mentioned, extract the customer name.

Otherwise:

customer = null

============================================================
DESCRIPTION
============================================================

Create a useful description of the action.

The description should use the same language as the user when
practical.

Do not invent information.

============================================================
CONFIDENCE
============================================================

confidence must be between 0 and 1.

Use a high value when the request is clear.

Use a lower value when information is uncertain.

============================================================
QUESTIONS
============================================================

If the user asks about stock or products but does not request
a change:

actions = []

Answer naturally in the user's language.

============================================================
AMBIGUOUS REQUESTS
============================================================

If important information is missing:

- Do not invent it.
- Explain what information is missing.
- Respond in the user's language.
- Return actions = [] when an action cannot safely be created.

============================================================
JSON FORMAT
============================================================

Return exactly this type of JSON:

{
  "detected_language": "en",
  "language_scores": {
    "en": 1.0,
    "te": 0.0,
    "hi": 0.0
  },
  "response": "Dynamically generated response.",
  "actions": [
    {
      "action_type": "stock_add",
      "product": "Rice",
      "quantity": 10,
      "unit": "bags",
      "supplier": null,
      "customer": null,
      "stock_delta": 10,
      "description": "Add 10 bags of Rice to stock",
      "confidence": 0.98
    }
  ]
}

Return ONLY JSON.

Do not return Markdown.

Do not use ```json.

Do not put explanations outside the JSON.
"""


# ============================================================
# NORMALIZE LANGUAGE
# ============================================================

def normalize_language(language: Optional[str]) -> str:

    if not language:
        return "en"

    value = str(language).strip().lower()

    if value.startswith("te") or "telugu" in value:
        return "te"

    if value.startswith("hi") or "hindi" in value:
        return "hi"

    return "en"


# ============================================================
# SAFE FLOAT
# ============================================================

def safe_float(
    value: Any,
    default: float = 0.0
) -> float:

    try:

        number = float(value)

        if number < 0:
            return 0.0

        if number > 1:
            return 1.0

        return number

    except (TypeError, ValueError):

        return default


# ============================================================
# SAFE QUANTITY
# ============================================================

def safe_quantity(
    value: Any
) -> Optional[float]:

    if value is None:
        return None

    try:

        number = float(value)

        if number.is_integer():
            return int(number)

        return number

    except (TypeError, ValueError):

        return None


# ============================================================
# CALCULATE STOCK DELTA
# ============================================================

def calculate_stock_delta(
    action_type: str,
    quantity: Optional[float],
    provided_delta: Any
) -> float:

    """
    Make sure inventory actions always have a correct
    stock_delta.

    stock_add  -> positive
    purchase   -> positive
    delivery   -> positive

    stock_remove -> negative
    sale         -> negative

    stock_check -> 0
    other      -> 0
    """

    # --------------------------------------------------------
    # No quantity
    # --------------------------------------------------------

    if quantity is None:

        if action_type in {
            "stock_check",
            "other"
        }:
            return 0

        return 0

    quantity = abs(float(quantity))

    # --------------------------------------------------------
    # Force correct direction based on action type
    # --------------------------------------------------------

    if action_type in {
        "stock_add",
        "purchase",
        "delivery"
    }:

        return quantity

    if action_type in {
        "stock_remove",
        "sale"
    }:

        return -quantity

    if action_type in {
        "stock_check",
        "other"
    }:

        return 0

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    try:

        return float(provided_delta or 0)

    except (TypeError, ValueError):

        return 0


# ============================================================
# CLEAN LANGUAGE SCORES
# ============================================================

def clean_language_scores(
    scores: Optional[Dict[str, Any]],
    detected_language: str
) -> Dict[str, float]:

    result = {
        "en": 0.0,
        "te": 0.0,
        "hi": 0.0,
    }

    if isinstance(scores, dict):

        for key in result:

            result[key] = safe_float(
                scores.get(key),
                0.0
            )

    # If no useful scores were returned
    if sum(result.values()) <= 0:

        result[detected_language] = 1.0

    total = sum(result.values())

    if total > 0:

        result = {
            key: round(
                value / total,
                4
            )

            for key, value in result.items()
        }

    return result


# ============================================================
# CLEAN ACTION
# ============================================================

def clean_action(
    action: Dict[str, Any]
) -> Dict[str, Any]:

    if not isinstance(action, dict):
        return {}

    # --------------------------------------------------------
    # Action type
    # --------------------------------------------------------

    action_type = (
        action.get("action_type")
        or "other"
    )

    allowed_action_types = {
        "stock_add",
        "stock_remove",
        "sale",
        "purchase",
        "stock_check",
        "delivery",
        "other",
    }

    if action_type not in allowed_action_types:

        action_type = "other"

    # --------------------------------------------------------
    # Product
    # --------------------------------------------------------

    product = action.get("product")

    if product is not None:

        product = str(product).strip()

        if not product:
            product = None

    # --------------------------------------------------------
    # Quantity
    # --------------------------------------------------------

    quantity = safe_quantity(
        action.get("quantity")
    )

    # --------------------------------------------------------
    # Unit
    # --------------------------------------------------------

    unit = action.get("unit")

    if unit is not None:

        unit = str(unit).strip()

        if not unit:
            unit = None

    # --------------------------------------------------------
    # Supplier
    # --------------------------------------------------------

    supplier = action.get("supplier")

    if supplier is not None:

        supplier = str(
            supplier
        ).strip()

        if not supplier:
            supplier = None

    # --------------------------------------------------------
    # Customer
    # --------------------------------------------------------

    customer = action.get("customer")

    if customer is not None:

        customer = str(
            customer
        ).strip()

        if not customer:
            customer = None

    # --------------------------------------------------------
    # Stock delta
    # --------------------------------------------------------

    stock_delta = calculate_stock_delta(
        action_type=action_type,
        quantity=quantity,
        provided_delta=action.get(
            "stock_delta"
        )
    )

    if float(stock_delta).is_integer():

        stock_delta = int(stock_delta)

    # --------------------------------------------------------
    # Description
    # --------------------------------------------------------

    description = (
        action.get("description")
        or ""
    )

    description = str(
        description
    ).strip()

    # --------------------------------------------------------
    # Confidence
    # --------------------------------------------------------

    confidence = safe_float(
        action.get("confidence"),
        0.5
    )

    return {
        "action_type": action_type,
        "product": product,
        "quantity": quantity,
        "unit": unit,
        "supplier": supplier,
        "customer": customer,
        "stock_delta": stock_delta,
        "description": description,
        "confidence": confidence,
    }


# ============================================================
# CLEAN AI RESULT
# ============================================================

def clean_ai_result(
    data: Dict[str, Any]
) -> Tuple[
    str,
    Dict[str, float],
    List[Dict[str, Any]],
    str
]:

    detected_language = normalize_language(
        data.get("detected_language")
    )

    language_scores = clean_language_scores(
        data.get("language_scores"),
        detected_language
    )

    raw_actions = data.get(
        "actions",
        []
    )

    if not isinstance(
        raw_actions,
        list
    ):
        raw_actions = []

    actions = []

    for action in raw_actions:

        cleaned = clean_action(
            action
        )

        if cleaned:
            actions.append(cleaned)

    ai_response = data.get(
        "response"
    )

    if ai_response is None:
        ai_response = ""

    ai_response = str(
        ai_response
    ).strip()

    return (
        detected_language,
        language_scores,
        actions,
        ai_response,
    )


# ============================================================
# PARSE TEXT
# ============================================================

def parse_text(
    text: str,
) -> Tuple[
    str,
    Dict[str, float],
    List[Dict[str, Any]],
    str
]:

    if not text or not text.strip():

        raise ValueError(
            "Input text cannot be empty."
        )

    if client is None:

        raise RuntimeError(
            "OPENAI_API_KEY is not configured. "
            "Please add OPENAI_API_KEY to the backend .env file."
        )

    user_prompt = f"""
Understand this shopkeeper message.

IMPORTANT:

1. Detect the actual language.
2. Understand the actual shopkeeper intent.
3. Extract the product.
4. Extract the quantity.
5. Extract the unit.
6. Determine the correct action_type.
7. Calculate the correct stock_delta.
8. Generate a natural response.
9. Respond in exactly the same language/style as the user.
10. Do not use a fixed response sentence.
11. Do not automatically respond in English.

SHOPKEEPER MESSAGE:

{text}
"""

    try:

        # ----------------------------------------------------
        # CALL OPENAI
        # ----------------------------------------------------

        response = client.responses.create(

            model="gpt-5.6-luna",

            input=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
        )

        # ----------------------------------------------------
        # GET OUTPUT
        # ----------------------------------------------------

        raw_output = (
            response.output_text
            or ""
        ).strip()

        if not raw_output:

            raise RuntimeError(
                "The AI returned an empty response."
            )

        print(
            "\n========== AI RAW OUTPUT =========="
        )

        print(raw_output)

        print(
            "===================================\n"
        )

        # ----------------------------------------------------
        # REMOVE CODE FENCES IF PRESENT
        # ----------------------------------------------------

        if raw_output.startswith("```"):

            raw_output = raw_output.strip()

            if raw_output.startswith(
                "```json"
            ):

                raw_output = raw_output[
                    7:
                ]

            else:

                raw_output = raw_output[
                    3:
                ]

            if raw_output.endswith(
                "```"
            ):

                raw_output = raw_output[
                    :-3
                ]

            raw_output = raw_output.strip()

        # ----------------------------------------------------
        # PARSE JSON
        # ----------------------------------------------------

        try:

            data = json.loads(
                raw_output
            )

        except json.JSONDecodeError as error:

            print(
                "AI returned invalid JSON:"
            )

            print(raw_output)

            raise RuntimeError(
                f"AI returned invalid JSON: {error}"
            )

        if not isinstance(
            data,
            dict
        ):

            raise RuntimeError(
                "AI response is not a JSON object."
            )

        # ----------------------------------------------------
        # CLEAN RESULT
        # ----------------------------------------------------

        (
            detected_language,
            language_scores,
            actions,
            ai_response,
        ) = clean_ai_result(data)

        # ----------------------------------------------------
        # PRINT CLEAN ACTIONS
        # ----------------------------------------------------

        print(
            "\n========== CLEAN ACTIONS =========="
        )

        print(
            json.dumps(
                actions,
                indent=2,
                ensure_ascii=False
            )
        )

        print(
            "===================================\n"
        )

        # ----------------------------------------------------
        # VALIDATE RESPONSE
        # ----------------------------------------------------

        if not ai_response:

            raise RuntimeError(
                "AI response did not contain a response message."
            )

        return (
            detected_language,
            language_scores,
            actions,
            ai_response,
        )

    except Exception as error:

        print(
            "AI parser failed:",
            repr(error)
        )

        raise