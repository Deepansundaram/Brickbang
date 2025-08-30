from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json
from app.database import SessionLocal
from app.models import models, schemas
from app.auth import get_current_user
from app.ml.delay_predictor import DelayPredictor
from app.ml.recommendation_engine import RecommendationEngine

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize AI models
delay_predictor = DelayPredictor()
recommendation_engine = RecommendationEngine()

@router.post("/predict-delay", response_model=schemas.DelayPrediction)
async def predict_delay(
    prediction_request: schemas.DelayPredictionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Gather current project data if not provided
    if not prediction_request.current_materials:
        materials = db.query(models.Material).all()
        materials_data = [
            {
                "name": m.name,
                "current_stock": m.current_stock,
                "minimum_stock": m.minimum_stock,
                "lead_time": m.lead_time_days
            }
            for m in materials
        ]
    else:
        materials_data = prediction_request.current_materials

    if not prediction_request.current_tasks:
        tasks = db.query(models.Task).filter(
            models.Task.status.in_([models.TaskStatus.NOT_STARTED, models.TaskStatus.IN_PROGRESS])
        ).all()
        tasks_data = [
            {
                "title": t.title,
                "status": t.status.value,
                "estimated_hours": t.estimated_hours,
                "actual_hours": t.actual_hours,
                "progress": min(t.actual_hours / t.estimated_hours, 1.0) if t.estimated_hours > 0 else 0
            }
            for t in tasks
        ]
    else:
        tasks_data = prediction_request.current_tasks

    # Get weather data (mock data for demo)
    weather_data = prediction_request.weather_data or {
        "temperature": 25.0,
        "humidity": 60.0,
        "precipitation_chance": 20.0,
        "wind_speed": 10.0
    }

    # Run AI prediction
    prediction_result = delay_predictor.predict_delay(
        materials_data=materials_data,
        tasks_data=tasks_data,
        weather_data=weather_data
    )

    # Save prediction to database
    db_prediction = models.DelayPrediction(
        delay_risk_score=prediction_result["delay_risk_score"],
        contributing_factors=json.dumps(prediction_result["contributing_factors"]),
        weather_impact=prediction_result["weather_impact"],
        material_impact=prediction_result["material_impact"],
        labour_impact=prediction_result["labour_impact"],
        recommended_actions=json.dumps(prediction_result["recommended_actions"])
    )

    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return db_prediction

@router.get("/predictions", response_model=List[schemas.DelayPrediction])
async def get_predictions(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    predictions = db.query(models.DelayPrediction).order_by(
        models.DelayPrediction.prediction_date.desc()
    ).offset(skip).limit(limit).all()
    return predictions

@router.get("/recommendations/suppliers")
async def get_supplier_recommendations(
    material_id: int,
    quantity: float,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Get historical purchase orders for this material
    historical_orders = db.query(models.PurchaseOrderItem).join(models.PurchaseOrder).filter(
        models.PurchaseOrderItem.material_id == material_id
    ).all()

    # Run recommendation engine
    recommendations = recommendation_engine.recommend_suppliers(
        material_info={
            "name": material.name,
            "category": material.category,
            "current_supplier": material.supplier_name,
            "current_price": material.unit_price,
            "lead_time": material.lead_time_days
        },
        historical_orders=[
            {
                "supplier": order.purchase_order.supplier_name,
                "price": order.unit_price,
                "quantity": order.quantity,
                "delivery_performance": "on_time" if order.purchase_order.actual_delivery_date <= order.purchase_order.expected_delivery_date else "delayed"
            }
            for order in historical_orders if order.purchase_order.actual_delivery_date
        ],
        required_quantity=quantity
    )

    return {"material_name": material.name, "recommendations": recommendations}

@router.get("/recommendations/manpower")
async def get_manpower_recommendations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Get current tasks and worker assignments
    pending_tasks = db.query(models.Task).filter(
        models.Task.status.in_([models.TaskStatus.NOT_STARTED, models.TaskStatus.IN_PROGRESS])
    ).all()

    workers = db.query(models.Worker).filter(models.Worker.is_active == True).all()

    # Calculate current workload for each worker
    worker_workloads = []
    for worker in workers:
        current_tasks = [t for t in pending_tasks if t.worker_id == worker.id]
        total_remaining_hours = sum([
            max(0, t.estimated_hours - t.actual_hours) for t in current_tasks
        ])

        worker_workloads.append({
            "worker_id": worker.id,
            "name": worker.name,
            "skill_category": worker.skill_category,
            "current_hours": total_remaining_hours,
            "task_count": len(current_tasks)
        })

    # Run recommendation engine
    recommendations = recommendation_engine.optimize_manpower_allocation(
        workers=worker_workloads,
        unassigned_tasks=[
            {
                "task_id": t.id,
                "title": t.title,
                "estimated_hours": t.estimated_hours,
                "required_skill": "general",  # Could be enhanced with skill matching
                "priority": t.priority
            }
            for t in pending_tasks if t.worker_id is None
        ]
    )

    return {"recommendations": recommendations}

@router.get("/material-demand-forecast/{material_id}")
async def forecast_material_demand(
    material_id: int,
    days_ahead: int = 30,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Get historical consumption data
    historical_orders = db.query(models.PurchaseOrderItem).filter(
        models.PurchaseOrderItem.material_id == material_id
    ).all()

    # Run demand forecasting
    forecast = recommendation_engine.forecast_material_demand(
        material_info={
            "name": material.name,
            "current_stock": material.current_stock,
            "minimum_stock": material.minimum_stock,
            "average_consumption": 10.0  # This would be calculated from historical data
        },
        historical_consumption=[
            {
                "date": order.purchase_order.order_date.isoformat(),
                "quantity": order.quantity
            }
            for order in historical_orders
        ],
        forecast_days=days_ahead
    )

    return {
        "material_name": material.name,
        "current_stock": material.current_stock,
        "forecast_days": days_ahead,
        "forecast": forecast
    }
