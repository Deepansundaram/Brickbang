from fastapi import APIRouter, Depends, HTTPException, status
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
    """Get all purchase orders with optional filtering"""
    query = db.query(models.PurchaseOrder)
    if status:
        query = query.filter(models.PurchaseOrder.status == status)

    orders = query.offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=schemas.PurchaseOrder)
async def get_purchase_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific purchase order by ID"""
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
    """Create a new purchase order with items"""
    try:
        # Create purchase order
        db_order = models.PurchaseOrder(
            order_number=generate_order_number(),
            supplier_name=order.supplier_name,
            supplier_contact=order.supplier_contact,
            expected_delivery_date=order.expected_delivery_date,
            notes=order.notes,
            status=models.OrderStatus.PENDING
        )
        db.add(db_order)
        db.flush()  # Get the ID without committing

        # Create order items and calculate total
        total_amount = 0
        for item_data in order.items:
            # Verify material exists
            material = db.query(models.Material).filter(models.Material.id == item_data.material_id).first()
            if not material:
                raise HTTPException(status_code=400, detail=f"Material with ID {item_data.material_id} not found")

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

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating purchase order: {str(e)}")

@router.put("/{order_id}", response_model=schemas.PurchaseOrder)
async def update_purchase_order(
    order_id: int,
    order_update: schemas.PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an existing purchase order"""
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    # Update fields that were provided
    for field, value in order_update.dict(exclude_unset=True).items():
        if hasattr(order, field):
            setattr(order, field, value)

    try:
        db.commit()
        db.refresh(order)
        return order
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating purchase order: {str(e)}")

@router.post("/{order_id}/approve")
async def approve_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Approve a purchase order"""
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    if order.status != models.OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="Only pending orders can be approved")

    order.status = models.OrderStatus.APPROVED
    db.commit()

    return {"message": f"Purchase order {order.order_number} approved successfully", "status": "approved"}

@router.post("/{order_id}/receive")
async def receive_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Mark order as received and update material stock"""
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    if order.status == models.OrderStatus.DELIVERED:
        raise HTTPException(status_code=400, detail="Order already marked as delivered")

    try:
        # Update order status and delivery date
        order.status = models.OrderStatus.DELIVERED
        order.actual_delivery_date = datetime.now()

        # Update material stock levels
        stock_updates = []
        for item in order.items:
            material = db.query(models.Material).filter(models.Material.id == item.material_id).first()
            if material:
                old_stock = material.current_stock
                material.current_stock += item.quantity
                stock_updates.append({
                    "material_name": material.name,
                    "quantity_received": item.quantity,
                    "old_stock": old_stock,
                    "new_stock": material.current_stock
                })

        db.commit()

        return {
            "message": f"Order {order.order_number} received successfully",
            "order_number": order.order_number,
            "delivery_date": order.actual_delivery_date.isoformat(),
            "stock_updates": stock_updates
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error receiving order: {str(e)}")

@router.delete("/{order_id}")
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Cancel a purchase order (only if not delivered)"""
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    if order.status == models.OrderStatus.DELIVERED:
        raise HTTPException(status_code=400, detail="Cannot cancel delivered orders")

    try:
        order.status = models.OrderStatus.CANCELLED
        db.commit()

        return {"message": f"Purchase order {order.order_number} cancelled successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error cancelling order: {str(e)}")

@router.get("/{order_id}/items", response_model=List[schemas.PurchaseOrderItem])
async def get_order_items(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all items in a purchase order"""
    order = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    return order.items

@router.get("/supplier/{supplier_name}")
async def get_orders_by_supplier(
    supplier_name: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all orders from a specific supplier"""
    orders = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.supplier_name.ilike(f"%{supplier_name}%")
    ).offset(skip).limit(limit).all()

    return orders

@router.get("/status/{status}")
async def get_orders_by_status(
    status: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all orders with a specific status"""
    try:
        # Validate status
        order_status = models.OrderStatus(status.lower())

        orders = db.query(models.PurchaseOrder).filter(
            models.PurchaseOrder.status == order_status
        ).all()

        return {
            "status": status,
            "count": len(orders),
            "orders": orders
        }

    except ValueError:
        valid_statuses = [status.value for status in models.OrderStatus]
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Valid options: {valid_statuses}"
        )
