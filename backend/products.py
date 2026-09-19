from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Product
from schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse
)


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


# ============================================================
# HELPER: GET PRODUCT STATUS
# ============================================================

def get_product_status(product: Product):
    """
    Determine the current stock status of a product.
    """

    # Expiry check
    if product.expiry_date:
        today = date.today()
        days_until_expiry = (product.expiry_date - today).days

        if days_until_expiry < 0:
            return "Expired"

        if days_until_expiry <= 7:
            return "Expiring Soon"

    # Stock level checks
    if product.stock <= 0:
        return "Critical"

    if product.stock <= product.reorder_level:
        return "Low"

    if product.stock >= product.max_level:
        return "Excess"

    return "Normal"


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@router.get("/", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):

    products = db.query(Product).all()

    return products


# ============================================================
# GET SINGLE PRODUCT
# ============================================================

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

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

    return product


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=201
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):

    product = Product(
        name=product_data.name,
        category=product_data.category,
        stock=product_data.stock,
        unit=product_data.unit,
        reorder_level=product_data.reorder_level,
        max_level=product_data.max_level,
        expiry_date=product_data.expiry_date,
        price=product_data.price
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# ============================================================
# UPDATE PRODUCT
# ============================================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):

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

    update_data = product_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


# ============================================================
# DELETE PRODUCT
# ============================================================

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):

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

    db.delete(product)
    db.commit()

    return {
        "success": True,
        "message": "Product deleted successfully"
    }


# ============================================================
# GET PRODUCT STOCK STATUS
# ============================================================

@router.get("/{product_id}/status")
def get_product_stock_status(
    product_id: int,
    db: Session = Depends(get_db)
):

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

    status = get_product_status(product)

    return {
        "product_id": product.id,
        "product": product.name,
        "stock": product.stock,
        "unit": product.unit,
        "status": status
    }