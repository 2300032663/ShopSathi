from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


# ============================================================
# PRODUCT SCHEMAS
# ============================================================

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    stock: float = 0
    unit: str = "pieces"
    reorder_level: float = 10
    max_level: float = 100
    expiry_date: Optional[date] = None
    price: float = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[float] = None
    unit: Optional[str] = None
    reorder_level: Optional[float] = None
    max_level: Optional[float] = None
    expiry_date: Optional[date] = None
    price: Optional[float] = None


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True


# ============================================================
# SUPPLIER SCHEMAS
# ============================================================

class SupplierCreate(BaseModel):
    name: str
    phone: Optional[str] = None


class SupplierResponse(SupplierCreate):
    id: int

    class Config:
        from_attributes = True


# ============================================================
# AI ACTION SCHEMAS
# ============================================================

class ParsedAction(BaseModel):
    action_type: str
    product: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    customer: Optional[str] = None

    # Change in available stock.
    # Example:
    # Delivery received 20 bags -> +20
    # Reservation 5 bags -> -5
    stock_delta: float = 0

    description: str
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class ParseRequest(BaseModel):
    text: str
    language: str = "auto"


class ParseResponse(BaseModel):
    original_text: str
    detected_language: str
    language_scores: dict[str, float] = {}
    response: str = ""
    actions: list[ParsedAction]
    needs_confirmation: bool = True


# ============================================================
# CONFIRMATION SCHEMAS
# ============================================================

class ConfirmActionsRequest(BaseModel):
    actions: list[ParsedAction]
    original_text: Optional[str] = None
    language: Optional[str] = "auto"


class ConfirmActionsResponse(BaseModel):
    success: bool
    message: str
    updated_products: list[ProductResponse] = []


# ============================================================
# ASK ASSISTANT SCHEMAS
# ============================================================

class AskRequest(BaseModel):
    question: str
    language: str = "auto"


class AskResponse(BaseModel):
    question: str
    answer: str
    language: str


# ============================================================
# ACTION HISTORY SCHEMAS
# ============================================================

class ActionResponse(BaseModel):
    id: int
    action_type: str
    description: str
    language: Optional[str] = None
    confidence: Optional[float] = None
    created_at: str

    class Config:
        from_attributes = True