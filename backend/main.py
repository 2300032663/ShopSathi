from typing import Any, Dict, List, Optional
from datetime import date

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import Base, engine, SessionLocal
from models import Product, Action, Sale, Delivery
from services.ai_parser import parse_text


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="ShopSathi API",
    description="Multilingual AI Shop Assistant Backend",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# REQUEST MODELS
# ============================================================

class ParseRequest(BaseModel):
    text: str
    language: Optional[str] = "auto"


class ParseResponse(BaseModel):
    original_text: str
    detected_language: str
    language_scores: Dict[str, float]
    response: str
    actions: List[Dict[str, Any]]
    needs_confirmation: bool


class ConfirmActionsRequest(BaseModel):
    actions: List[Dict[str, Any]]
    original_text: Optional[str] = ""
    language: Optional[str] = "auto"


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "ShopSathi backend is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# ============================================================
# AI PARSE ACTION
# ============================================================

@app.post(
    "/api/parse-action",
    response_model=ParseResponse
)
def parse_action(request: ParseRequest):

    try:

        (
            detected_language,
            language_scores,
            actions,
            ai_response,
        ) = parse_text(request.text)

        return ParseResponse(
            original_text=request.text,
            detected_language=detected_language,
            language_scores=language_scores,
            response=ai_response,
            actions=actions,
            needs_confirmation=len(actions) > 0,
        )

    except Exception as error:

        print("====================================")
        print("PARSE ACTION ERROR")
        print(repr(error))
        print("====================================")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@app.get("/api/products/")
def get_products():

    db = SessionLocal()

    try:

        products = (
            db.query(Product)
            .order_by(Product.id)
            .all()
        )

        result = []

        for product in products:

            result.append({
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "stock": product.stock,
                "unit": product.unit,
                "reorder_level": product.reorder_level,
                "max_level": product.max_level,
                "expiry_date": (
                    product.expiry_date.isoformat()
                    if product.expiry_date
                    else None
                ),
                "price": product.price,
            })

        return result

    finally:

        db.close()


# ============================================================
# GET ONE PRODUCT
# ============================================================

@app.get("/api/products/{product_id}")
def get_product(product_id: int):

    db = SessionLocal()

    try:

        product = (
            db.query(Product)
            .filter(Product.id == product_id)
            .first()
        )

        if not product:

            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        return {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "stock": product.stock,
            "unit": product.unit,
            "reorder_level": product.reorder_level,
            "max_level": product.max_level,
            "expiry_date": (
                product.expiry_date.isoformat()
                if product.expiry_date
                else None
            ),
            "price": product.price,
        }

    finally:

        db.close()


# ============================================================
# CONFIRM ACTIONS
# THIS IS THE IMPORTANT INVENTORY UPDATE ENDPOINT
# ============================================================

@app.post("/api/actions/confirm")
def confirm_actions(request: ConfirmActionsRequest):

    if not request.actions:

        raise HTTPException(
            status_code=400,
            detail="No actions were provided."
        )

    db = SessionLocal()

    updated_products = []
    completed_actions = []

    try:

        for action in request.actions:

            print("\n====================================")
            print("PROCESSING AI ACTION")
            print(action)
            print("====================================")

            action_type = (
                action.get("action_type")
                or "other"
            )

            product_name = action.get("product")

            quantity = action.get("quantity")

            stock_delta = action.get("stock_delta")

            confidence = action.get("confidence")

            description = (
                action.get("description")
                or ""
            )

            # ------------------------------------------------
            # STOCK CHECK
            # ------------------------------------------------

            if action_type == "stock_check":

                completed_actions.append({
                    "action_type": "stock_check",
                    "product": product_name,
                    "status": "completed",
                })

                continue

            # ------------------------------------------------
            # OTHER ACTION
            # ------------------------------------------------

            if action_type == "other":

                completed_actions.append({
                    "action_type": "other",
                    "product": product_name,
                    "status": "completed",
                })

                continue

            # ------------------------------------------------
            # PRODUCT REQUIRED
            # ------------------------------------------------

            if not product_name:

                raise HTTPException(
                    status_code=400,
                    detail="Product name is missing."
                )

            # ------------------------------------------------
            # FIND PRODUCT
            # ------------------------------------------------

            product = (
                db.query(Product)
                .filter(
                    Product.name.ilike(
                        product_name.strip()
                    )
                )
                .first()
            )

            # ------------------------------------------------
            # FALLBACK PRODUCT SEARCH
            # ------------------------------------------------

            if not product:

                all_products = (
                    db.query(Product).all()
                )

                requested_name = (
                    product_name
                    .strip()
                    .lower()
                )

                for existing_product in all_products:

                    existing_name = (
                        existing_product.name
                        .strip()
                        .lower()
                    )

                    if existing_name == requested_name:

                        product = existing_product

                        break

            # ------------------------------------------------
            # PRODUCT NOT FOUND
            # ------------------------------------------------

            if not product:

                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Product '{product_name}' "
                        "was not found in inventory."
                    )
                )

            # ------------------------------------------------
            # DETERMINE STOCK DELTA
            # ------------------------------------------------

            if stock_delta is None:

                if quantity is None:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Quantity is missing for "
                            f"{product.name}."
                        )
                    )

                try:

                    quantity = float(quantity)

                except (TypeError, ValueError):

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Invalid quantity for "
                            f"{product.name}."
                        )
                    )

                if action_type in [
                    "stock_add",
                    "purchase",
                    "delivery",
                ]:

                    stock_delta = quantity

                elif action_type in [
                    "stock_remove",
                    "sale",
                ]:

                    stock_delta = -quantity

                else:

                    stock_delta = 0

            else:

                try:

                    stock_delta = float(stock_delta)

                except (TypeError, ValueError):

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Invalid stock change for "
                            f"{product.name}."
                        )
                    )

            # ------------------------------------------------
            # CURRENT STOCK
            # ------------------------------------------------

            old_stock = float(
                product.stock or 0
            )

            # ------------------------------------------------
            # CALCULATE NEW STOCK
            # ------------------------------------------------

            new_stock = (
                old_stock + stock_delta
            )

            # ------------------------------------------------
            # DON'T ALLOW NEGATIVE STOCK
            # ------------------------------------------------

            if new_stock < 0:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Not enough stock for "
                        f"{product.name}. "
                        f"Current stock is "
                        f"{old_stock:g} "
                        f"{product.unit}."
                    )
                )

            # ------------------------------------------------
            # UPDATE PRODUCT STOCK
            # ------------------------------------------------

            product.stock = new_stock

            db.add(product)

            # ------------------------------------------------
            # SAVE ACTION HISTORY
            # ------------------------------------------------

            action_record = Action(
                action_type=action_type,
                description=(
                    description
                    or (
                        f"{action_type}: "
                        f"{product.name}"
                    )
                ),
                language=request.language,
                confidence=(
                    float(confidence)
                    if confidence is not None
                    else None
                ),
                created_at=(
                    date.today().isoformat()
                ),
            )

            db.add(action_record)

            # ------------------------------------------------
            # SAVE SALE RECORD
            # ------------------------------------------------

            if action_type == "sale":

                sale_quantity = (
                    abs(stock_delta)
                )

                sale = Sale(
                    product_id=product.id,
                    quantity=sale_quantity,
                    sale_date=date.today(),
                )

                db.add(sale)

            # ------------------------------------------------
            # SAVE DELIVERY RECORD
            # ------------------------------------------------

            if action_type in [
                "delivery",
                "purchase",
            ]:

                delivery_quantity = (
                    abs(stock_delta)
                )

                delivery = Delivery(
                    product_id=product.id,
                    supplier_id=None,
                    quantity=delivery_quantity,
                    delivery_date=date.today(),
                )

                db.add(delivery)

            # ------------------------------------------------
            # ADD TO RESPONSE
            # ------------------------------------------------

            updated_products.append({
                "id": product.id,
                "name": product.name,
                "old_stock": old_stock,
                "stock_delta": stock_delta,
                "new_stock": new_stock,
                "unit": product.unit,
            })

            completed_actions.append({
                "action_type": action_type,
                "product": product.name,
                "quantity": quantity,
                "stock_delta": stock_delta,
                "new_stock": new_stock,
                "unit": product.unit,
                "status": "completed",
            })

        # ====================================================
        # COMMIT DATABASE
        # ====================================================

        db.commit()

        print("\n====================================")
        print("INVENTORY UPDATE SUCCESSFUL")
        print("====================================")

        for product in updated_products:

            print(
                f"{product['name']}: "
                f"{product['old_stock']} "
                f"-> "
                f"{product['new_stock']} "
                f"{product['unit']}"
            )

        print("====================================\n")

        return {
            "success": True,
            "message": "Inventory updated successfully.",
            "updated_products": updated_products,
            "completed_actions": completed_actions,
        }

    except HTTPException:

        db.rollback()

        raise

    except Exception as error:

        db.rollback()

        print("\n====================================")
        print("CONFIRM ACTION ERROR")
        print(repr(error))
        print("====================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:

        db.close()