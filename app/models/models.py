from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base
from app.models.enums import AdminLevel
from datetime import datetime
import enum
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship


class OrderStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ORDERED = "ordered"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class TaskStatus(enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    unit = Column(String)  # kg, pieces, liters, etc.
    current_stock = Column(Float, default=0.0)
    minimum_stock = Column(Float, default=0.0)
    unit_price = Column(Float)
    supplier_name = Column(String)
    supplier_contact = Column(String)
    lead_time_days = Column(Integer, default=7)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="material")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True)
    supplier_name = Column(String)
    supplier_contact = Column(String)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    total_amount = Column(Float, default=0.0)
    order_date = Column(DateTime(timezone=True), server_default=func.now())
    expected_delivery_date = Column(DateTime(timezone=True))
    actual_delivery_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")
class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    totp_secret = Column(String)
    admin_level = Column(Enum(AdminLevel))
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    is_active = Column(Boolean, default=True)
    sessions = relationship("AdminSession", back_populates="user", cascade="all, delete-orphan")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    material_id = Column(Integer, ForeignKey("materials.id"))
    quantity = Column(Float)
    unit_price = Column(Float)
    total_price = Column(Float)

    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="items")
    material = relationship("Material", back_populates="purchase_order_items")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    skill_category = Column(String)  # Electrician, Plumber, Mason, etc.
    hourly_rate = Column(Float)
    contact_number = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    tasks = relationship("Task", back_populates="worker")
    time_logs = relationship("TimeLog", back_populates="worker")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    status = Column(Enum(TaskStatus), default=TaskStatus.NOT_STARTED)
    estimated_hours = Column(Float)
    actual_hours = Column(Float, default=0.0)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    priority = Column(String, default="medium")  # low, medium, high, urgent
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    worker = relationship("Worker", back_populates="tasks")
    time_logs = relationship("TimeLog", back_populates="task")

class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    task_id = Column(Integer, ForeignKey("tasks.id"))
    date = Column(DateTime(timezone=True))
    hours_worked = Column(Float)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    worker = relationship("Worker", back_populates="time_logs")
    task = relationship("Task", back_populates="time_logs")

class DelayPrediction(Base):
    __tablename__ = "delay_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_date = Column(DateTime(timezone=True), server_default=func.now())
    delay_risk_score = Column(Float)  # 0-1 scale
    contributing_factors = Column(Text)  # JSON string
    weather_impact = Column(Float)
    material_impact = Column(Float)
    labour_impact = Column(Float)
    recommended_actions = Column(Text)

class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    original_filename = Column(String)
    file_path = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(String)
    description = Column(Text)


# class AdminUser(Base):
#     __tablename__ = "admin_users"
#     __table_args__ = {'extend_existing': True}
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, index=True)
#     password_hash = Column(String)
#     totp_secret = Column(String)
#     admin_level = Column(String)  # Adjust as per your enums or models
#     failed_login_attempts = Column(Integer, default=0)
#     locked_until = Column(DateTime, nullable=True)
#     last_login = Column(DateTime, nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow)
#     is_active = Column(Boolean, default=True)
#     sessions = relationship("AdminSession", back_populates="user")

class AdminSession(Base):
    __tablename__ = "admin_sessions"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("admin_users.id"))
    session_token = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    user = relationship("AdminUser", back_populates="sessions")