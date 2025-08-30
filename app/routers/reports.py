from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
import pandas as pd
import io
from app.database import SessionLocal
from app.models import models
from app.auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Materials stats
    total_materials = db.query(func.count(models.Material.id)).scalar()
    low_stock_count = db.query(func.count(models.Material.id)).filter(
        models.Material.current_stock <= models.Material.minimum_stock
    ).scalar()

    # Purchase orders stats
    pending_orders = db.query(func.count(models.PurchaseOrder.id)).filter(
        models.PurchaseOrder.status.in_([models.OrderStatus.PENDING, models.OrderStatus.APPROVED, models.OrderStatus.ORDERED])
    ).scalar()

    # Labour stats
    active_workers = db.query(func.count(models.Worker.id)).filter(
        models.Worker.is_active == True
    ).scalar()

    total_tasks = db.query(func.count(models.Task.id)).scalar()
    completed_tasks = db.query(func.count(models.Task.id)).filter(
        models.Task.status == models.TaskStatus.COMPLETED
    ).scalar()

    # Current delay risk (from latest prediction)
    latest_prediction = db.query(models.DelayPrediction).order_by(
        models.DelayPrediction.prediction_date.desc()
    ).first()
    current_delay_risk = latest_prediction.delay_risk_score if latest_prediction else 0.0

    return {
        "total_materials": total_materials,
        "low_stock_count": low_stock_count,
        "pending_orders": pending_orders,
        "active_workers": active_workers,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "task_completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "current_delay_risk": current_delay_risk
    }

@router.get("/materials-report")
async def generate_materials_report(
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    materials = db.query(models.Material).all()

    data = []
    for material in materials:
        data.append({
            "name": material.name,
            "category": material.category,
            "current_stock": material.current_stock,
            "minimum_stock": material.minimum_stock,
            "unit": material.unit,
            "unit_price": material.unit_price,
            "supplier": material.supplier_name,
            "lead_time_days": material.lead_time_days,
            "stock_status": "Low" if material.current_stock <= material.minimum_stock else "Normal"
        })

    if format.lower() == "csv":
        df = pd.DataFrame(data)
        output = io.StringIO()
        df.to_csv(output, index=False)
        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=materials_report.csv"}
        )

    return {"data": data, "total_records": len(data)}

@router.get("/labour-report")
async def generate_labour_report(
    days_back: int = 30,
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    # Get labour data with productivity metrics
    workers = db.query(models.Worker).filter(models.Worker.is_active == True).all()
    data = []

    for worker in workers:
        # Get hours worked
        total_hours = db.query(func.sum(models.TimeLog.hours_worked)).filter(
            models.TimeLog.worker_id == worker.id,
            models.TimeLog.date >= start_date
        ).scalar() or 0

        # Get completed tasks
        completed_tasks = db.query(func.count(models.Task.id)).filter(
            models.Task.worker_id == worker.id,
            models.Task.status == models.TaskStatus.COMPLETED,
            models.Task.updated_at >= start_date
        ).scalar() or 0

        data.append({
            "worker_name": worker.name,
            "skill_category": worker.skill_category,
            "hourly_rate": worker.hourly_rate,
            "total_hours": total_hours,
            "completed_tasks": completed_tasks,
            "productivity_score": (completed_tasks / total_hours) if total_hours > 0 else 0,
            "estimated_cost": total_hours * worker.hourly_rate
        })

    if format.lower() == "csv":
        df = pd.DataFrame(data)
        output = io.StringIO()
        df.to_csv(output, index=False)
        csv_content = output.getvalue()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=labour_report.csv"}
        )

    return {
        "data": data, 
        "period_days": days_back,
        "total_records": len(data),
        "total_cost": sum([record["estimated_cost"] for record in data])
    }

@router.get("/financial-report")
async def generate_financial_report(
    days_back: int = 30,
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    # Purchase orders costs
    orders = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.order_date >= start_date
    ).all()

    material_costs = sum([order.total_amount for order in orders])

    # Labour costs
    time_logs = db.query(models.TimeLog).join(models.Worker).filter(
        models.TimeLog.date >= start_date
    ).all()

    labour_costs = sum([log.hours_worked * log.worker.hourly_rate for log in time_logs])

    total_costs = material_costs + labour_costs

    data = {
        "period_days": days_back,
        "material_costs": material_costs,
        "labour_costs": labour_costs,
        "total_costs": total_costs,
        "cost_breakdown": {
            "materials_percentage": (material_costs / total_costs * 100) if total_costs > 0 else 0,
            "labour_percentage": (labour_costs / total_costs * 100) if total_costs > 0 else 0
        },
        "purchase_orders_count": len(orders),
        "average_order_value": material_costs / len(orders) if orders else 0
    }

    return data
