from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

# Material schemas
class MaterialBase(BaseModel):
    name: str
    category: str
    unit: str
    current_stock: float
    minimum_stock: float
    unit_price: float
    supplier_name: str
    supplier_contact: str
    lead_time_days: int

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    current_stock: Optional[float] = None
    minimum_stock: Optional[float] = None
    unit_price: Optional[float] = None
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    lead_time_days: Optional[int] = None

class Material(MaterialBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Purchase Order schemas
class PurchaseOrderItemBase(BaseModel):
    material_id: int
    quantity: float
    unit_price: float

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase):
    id: int
    purchase_order_id: int
    total_price: float
    material: Optional[Material] = None

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    supplier_name: str
    supplier_contact: str
    expected_delivery_date: datetime
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderUpdate(BaseModel):
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    status: Optional[str] = None
    expected_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    notes: Optional[str] = None

class PurchaseOrder(PurchaseOrderBase):
    id: int
    order_number: str
    status: str
    total_amount: float
    order_date: datetime
    actual_delivery_date: Optional[datetime] = None
    items: List[PurchaseOrderItem] = []

    class Config:
        from_attributes = True

# Worker schemas
class WorkerBase(BaseModel):
    name: str
    skill_category: str
    hourly_rate: float
    contact_number: str

class WorkerCreate(WorkerBase):
    pass

class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    skill_category: Optional[str] = None
    hourly_rate: Optional[float] = None
    contact_number: Optional[str] = None
    is_active: Optional[bool] = None

class Worker(WorkerBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: str
    worker_id: int
    estimated_hours: float
    start_date: datetime
    end_date: datetime
    priority: str = "medium"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    worker_id: Optional[int] = None
    status: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    priority: Optional[str] = None

class Task(TaskBase):
    id: int
    status: str
    actual_hours: float
    worker: Optional[Worker] = None

    class Config:
        from_attributes = True

# Time Log schemas
class TimeLogBase(BaseModel):
    worker_id: int
    task_id: int
    date: datetime
    hours_worked: float
    description: str

class TimeLogCreate(TimeLogBase):
    pass

class TimeLog(TimeLogBase):
    id: int
    worker: Optional[Worker] = None
    task: Optional[Task] = None

    class Config:
        from_attributes = True

# AI Prediction schemas
class DelayPredictionCreate(BaseModel):
    weather_data: Optional[dict] = None
    current_materials: Optional[List[dict]] = None
    current_tasks: Optional[List[dict]] = None

class DelayPrediction(BaseModel):
    id: int
    prediction_date: datetime
    delay_risk_score: float
    contributing_factors: str
    weather_impact: float
    material_impact: float
    labour_impact: float
    recommended_actions: str

    class Config:
        from_attributes = True

# File upload schemas
class ProjectFileBase(BaseModel):
    filename: str
    original_filename: str
    file_type: str
    description: Optional[str] = None

class ProjectFile(ProjectFileBase):
    id: int
    file_path: str
    file_size: int
    upload_date: datetime
    uploaded_by: str

    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    total_materials: int
    low_stock_count: int
    pending_orders: int
    active_workers: int
    total_tasks: int
    completed_tasks: int
    current_delay_risk: float
