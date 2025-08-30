from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
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

# Worker management
@router.get("/workers", response_model=List[schemas.Worker])
async def get_workers(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(models.Worker)
    if active_only:
        query = query.filter(models.Worker.is_active == True)
    return query.offset(skip).limit(limit).all()

@router.post("/workers", response_model=schemas.Worker)
async def create_worker(
    worker: schemas.WorkerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_worker = models.Worker(**worker.dict())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.put("/workers/{worker_id}", response_model=schemas.Worker)
async def update_worker(
    worker_id: int,
    worker_update: schemas.WorkerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    for field, value in worker_update.dict(exclude_unset=True).items():
        setattr(worker, field, value)

    db.commit()
    db.refresh(worker)
    return worker

# Task management
@router.get("/tasks", response_model=List[schemas.Task])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    worker_id: int = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(models.Task)
    if status:
        query = query.filter(models.Task.status == status)
    if worker_id:
        query = query.filter(models.Task.worker_id == worker_id)
    return query.offset(skip).limit(limit).all()

@router.post("/tasks", response_model=schemas.Task)
async def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_task = models.Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/tasks/{task_id}", response_model=schemas.Task)
async def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task

# Time logging
@router.get("/time-logs", response_model=List[schemas.TimeLog])
async def get_time_logs(
    skip: int = 0,
    limit: int = 100,
    worker_id: int = None,
    task_id: int = None,
    date_from: datetime = None,
    date_to: datetime = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(models.TimeLog)
    if worker_id:
        query = query.filter(models.TimeLog.worker_id == worker_id)
    if task_id:
        query = query.filter(models.TimeLog.task_id == task_id)
    if date_from:
        query = query.filter(models.TimeLog.date >= date_from)
    if date_to:
        query = query.filter(models.TimeLog.date <= date_to)
    return query.offset(skip).limit(limit).all()

@router.post("/time-logs", response_model=schemas.TimeLog)
async def create_time_log(
    time_log: schemas.TimeLogCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_time_log = models.TimeLog(**time_log.dict())
    db.add(db_time_log)

    # Update task actual hours
    task = db.query(models.Task).filter(models.Task.id == time_log.task_id).first()
    if task:
        task.actual_hours = task.actual_hours + time_log.hours_worked

    db.commit()
    db.refresh(db_time_log)
    return db_time_log

# Productivity analytics
@router.get("/productivity/{worker_id}")
async def get_worker_productivity(
    worker_id: int,
    days_back: int = 7,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    # Get total hours worked
    total_hours = db.query(func.sum(models.TimeLog.hours_worked)).filter(
        models.TimeLog.worker_id == worker_id,
        models.TimeLog.date >= start_date,
        models.TimeLog.date <= end_date
    ).scalar() or 0

    # Get completed tasks
    completed_tasks = db.query(func.count(models.Task.id)).filter(
        models.Task.worker_id == worker_id,
        models.Task.status == models.TaskStatus.COMPLETED,
        models.Task.updated_at >= start_date
    ).scalar() or 0

    worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    return {
        "worker_name": worker.name,
        "period_days": days_back,
        "total_hours": total_hours,
        "completed_tasks": completed_tasks,
        "avg_hours_per_day": total_hours / days_back if days_back > 0 else 0,
        "tasks_per_hour": completed_tasks / total_hours if total_hours > 0 else 0
    }
