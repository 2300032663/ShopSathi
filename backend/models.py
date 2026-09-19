from sqlalchemy import Column, Integer, String, Float, Date
from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False, index=True)

    category = Column(String, nullable=True)

    stock = Column(Float, default=0)

    unit = Column(String, default="pieces")

    reorder_level = Column(Float, default=10)

    max_level = Column(Float, default=100)

    expiry_date = Column(Date, nullable=True)

    price = Column(Float, default=0)


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    phone = Column(String, nullable=True)


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, nullable=False)

    quantity = Column(Float, nullable=False)

    sale_date = Column(Date, nullable=False)


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, nullable=False)

    supplier_id = Column(Integer, nullable=True)

    quantity = Column(Float, nullable=False)

    delivery_date = Column(Date, nullable=False)


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, nullable=False)

    customer_name = Column(String, nullable=False)

    quantity = Column(Float, nullable=False)

    reservation_date = Column(Date, nullable=False)


class Action(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)

    action_type = Column(String, nullable=False)

    description = Column(String, nullable=False)

    language = Column(String, nullable=True)

    confidence = Column(Float, nullable=True)

    created_at = Column(String, nullable=False)