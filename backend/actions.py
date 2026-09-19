from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Product, Supplier, Delivery, Reservation, Action
from schemas import (
    ConfirmActionsRequest,
    ConfirmActionsResponse,
    ProductResponse
)


router = APIRouter(
    prefix="/api/actions",
    tags=["Actions"]
)


# ============================================================
# FIND PRODUCT
# ============================================================

def find_product(db: Session, product_name: str):

    if not product_name:
        return None

    product = (
        db.query(Product)
        .filter(Product.name.ilike(product_name))
        .first()
    )

    # If exact match wasn't found, try partial match
    if not product:

        product = (
            db.query(Product)
            .filter(Product.name.ilike(f"%{product_name}%"))
            .first()
        )

    return product


# ============================================================
# FIND OR CREATE SUPPLIER
# ============================================================

def find_or_create_supplier(
    db: Session,
    supplier_name: str
):

    if not supplier_name:
        return None

    supplier = (
        db.query(Supplier)
        .filter(Supplier.name.ilike(supplier_name))
        .first()
    )

    if not supplier:

        supplier = Supplier(
            name=supplier_name
        )

        db.add(supplier)
        db.commit()
        db.refresh(supplier)

    return supplier


# ============================================================
# CONFIRM AI ACTIONS
# ============================================================

@router.post(
    "/confirm",
    response_model=ConfirmActionsResponse
)
def confirm_actions(
    request: ConfirmActionsRequest,
    db: Session = Depends(get_db)
):

    updated_products = []

    try:

        for action in request.actions:

            # ------------------------------------------------
            # CHECK PRODUCT
            # ------------------------------------------------

            if not action.product:
                continue

            product = find_product(
                db,
                action.product
            )

            if not product:

                raise HTTPException(
                    status_code=404,
                    detail=f"Product '{action.product}' not found"
                )

            # ------------------------------------------------
            # DELIVERY RECEIVED
            # ------------------------------------------------

            if action.action_type == "delivery_received":

                quantity = action.quantity or 0

                # Increase stock
                product.stock += quantity

                # Supplier
                supplier = find_or_create_supplier(
                    db,
                    action.supplier
                )

                # Record delivery
                delivery = Delivery(
                    product_id=product.id,
                    supplier_id=supplier.id if supplier else None,
                    quantity=quantity,
                    delivery_date=date.today()
                )

                db.add(delivery)

            # ------------------------------------------------
            # RESERVATION
            # ------------------------------------------------

            elif action.action_type == "reservation":

                quantity = action.quantity or 0

                # Make sure enough stock exists
                if product.stock < quantity:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Not enough {product.name} in stock. "
                            f"Available: {product.stock} "
                            f"{product.unit}"
                        )
                    )

                # Reduce available stock
                product.stock -= quantity

                # Record reservation
                reservation = Reservation(
                    product_id=product.id,
                    customer_name=action.customer or "Unknown",
                    quantity=quantity,
                    reservation_date=date.today()
                )

                db.add(reservation)

            # ------------------------------------------------
            # STOCK ADDITION
            # ------------------------------------------------

            elif action.action_type == "stock_add":

                quantity = action.quantity or 0

                product.stock += quantity

            # ------------------------------------------------
            # STOCK REDUCTION
            # ------------------------------------------------

            elif action.action_type == "stock_remove":

                quantity = action.quantity or 0

                if product.stock < quantity:

                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Not enough {product.name} in stock"
                        )
                    )

                product.stock -= quantity

            # ------------------------------------------------
            # ACTION HISTORY
            # ------------------------------------------------

            history = Action(
                action_type=action.action_type,
                description=action.description,
                language=request.language,
                confidence=action.confidence,
                created_at=datetime.now().isoformat()
            )

            db.add(history)

            updated_products.append(product)

        db.commit()

        # Refresh products
        for product in updated_products:
            db.refresh(product)

        return ConfirmActionsResponse(
            success=True,
            message="Actions confirmed successfully",
            updated_products=updated_products
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# GET ACTION HISTORY
# ============================================================

@router.get("/history")
def get_action_history(
    db: Session = Depends(get_db)
):

    actions = (
        db.query(Action)
        .order_by(Action.id.desc())
        .all()
    )

    return actions