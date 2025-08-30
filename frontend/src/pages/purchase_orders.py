from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
from app.database import SessionLocal
from app.models import models, schemas
from app.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_order_number():
    return f"PO-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

@router.get("/", response_model=List[schemas.PurchaseOrder])
async def get_purchase_orders(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(models.PurchaseOrder)
    if status:
        query = query.filter(models.PurchaseOrder.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{order_id}", response_model=schemas.PurchaseOrder)
async def get_purchase_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return order

@router.post("/", response_model=schemas.PurchaseOrder)
async def create_purchase_order(
    order: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Create purchase order
    db_order = models.PurchaseOrder(
        order_number=generate_order_number(),
        supplier_name=order.supplier_name,
        supplier_contact=order.supplier_contact,
        expected_delivery_date=order.expected_delivery_date,
        notes=order.notes
    )
    db.add(db_order)
    db.flush()  # Get the ID

    # Create order items and calculate total
    total_amount = 0
    for item_data in order.items:
        total_price = item_data.quantity * item_data.unit_price
        db_item = models.PurchaseOrderItem(
            purchase_order_id=db_order.id,
            material_id=item_data.material_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=total_price
        )
        db.add(db_item)
        total_amount += total_price

    db_order.total_amount = total_amount
    db.commit()
    db.refresh(db_order)
    return db_order

@router.put("/{order_id}", response_model=schemas.PurchaseOrder)
async def update_purchase_order(
    order_id: int,
    order_update: schemas.PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    for field, value in order_update.dict(exclude_unset=True).items():
        setattr(order, field, value)

    db.commit()
    db.refresh(order)
    return order

@router.post("/{order_id}/receive")
async def receive_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    # Update order status and delivery date
    order.status = models.OrderStatus.DELIVERED
    order.actual_delivery_date = datetime.now()

    # Update material stock levels
    for item in order.items:
        material = db.query(models.Material).filter(models.Material.id == item.material_id).first()
        if material:
            material.current_stock += item.quantity

    db.commit()
    return {"message": "Order received and stock updated", "order_number": order.order_number}
