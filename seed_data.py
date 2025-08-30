from sqlalchemy.orm import Session
from database import SessionLocal, engine
from app.models import models
from datetime import datetime, timedelta
import random

models.Base.metadata.create_all(bind=engine)
def seed_database():
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(models.TimeLog).delete()
        db.query(models.Task).delete()
        db.query(models.Worker).delete()
        db.query(models.PurchaseOrderItem).delete()
        db.query(models.PurchaseOrder).delete()
        db.query(models.Material).delete()
        db.query(models.DelayPrediction).delete()
        db.query(models.ProjectFile).delete()

        # Seed materials
        materials_data = [
            {"name": "Cement", "category": "Building Materials", "unit": "bags", "current_stock": 150, "minimum_stock": 50, "unit_price": 8.50, "supplier_name": "BuildCorp Supplies", "supplier_contact": "+1-555-0101", "lead_time_days": 3},
            {"name": "Steel Rebar", "category": "Steel", "unit": "tons", "current_stock": 25, "minimum_stock": 10, "unit_price": 850.00, "supplier_name": "Steel Solutions", "supplier_contact": "+1-555-0102", "lead_time_days": 7},
            {"name": "Concrete Blocks", "category": "Building Materials", "unit": "pieces", "current_stock": 800, "minimum_stock": 200, "unit_price": 3.25, "supplier_name": "Block Masters", "supplier_contact": "+1-555-0103", "lead_time_days": 5},
            {"name": "Electrical Wire", "category": "Electrical", "unit": "meters", "current_stock": 500, "minimum_stock": 100, "unit_price": 2.50, "supplier_name": "ElectriCorp", "supplier_contact": "+1-555-0104", "lead_time_days": 4},
            {"name": "PVC Pipes", "category": "Plumbing", "unit": "pieces", "current_stock": 80, "minimum_stock": 30, "unit_price": 15.75, "supplier_name": "Pipe Pro", "supplier_contact": "+1-555-0105", "lead_time_days": 6},
            {"name": "Paint", "category": "Finishing", "unit": "gallons", "current_stock": 40, "minimum_stock": 20, "unit_price": 35.00, "supplier_name": "Color Works", "supplier_contact": "+1-555-0106", "lead_time_days": 2},
            {"name": "Insulation", "category": "Thermal", "unit": "rolls", "current_stock": 15, "minimum_stock": 25, "unit_price": 22.50, "supplier_name": "Thermal Systems", "supplier_contact": "+1-555-0107", "lead_time_days": 8},
            {"name": "Roofing Tiles", "category": "Roofing", "unit": "pieces", "current_stock": 180, "minimum_stock": 100, "unit_price": 4.80, "supplier_name": "Roof Masters", "supplier_contact": "+1-555-0108", "lead_time_days": 10}
        ]

        for material_data in materials_data:
            material = models.Material(**material_data)
            db.add(material)

        db.commit()

        # Seed workers
        workers_data = [
            {"name": "John Smith", "skill_category": "Mason", "hourly_rate": 25.00, "contact_number": "+1-555-1001"},
            {"name": "Maria Garcia", "skill_category": "Electrician", "hourly_rate": 30.00, "contact_number": "+1-555-1002"},
            {"name": "Robert Johnson", "skill_category": "Plumber", "hourly_rate": 28.00, "contact_number": "+1-555-1003"},
            {"name": "Sarah Wilson", "skill_category": "Carpenter", "hourly_rate": 26.00, "contact_number": "+1-555-1004"},
            {"name": "Mike Davis", "skill_category": "General", "hourly_rate": 20.00, "contact_number": "+1-555-1005"},
            {"name": "Lisa Brown", "skill_category": "Painter", "hourly_rate": 22.00, "contact_number": "+1-555-1006"},
            {"name": "Tom Wilson", "skill_category": "Roofer", "hourly_rate": 27.00, "contact_number": "+1-555-1007"},
            {"name": "Anna Lee", "skill_category": "Mason", "hourly_rate": 24.00, "contact_number": "+1-555-1008"}
        ]

        for worker_data in workers_data:
            worker = models.Worker(**worker_data)
            db.add(worker)

        db.commit()

        # Get worker IDs for task assignment
        workers = db.query(models.Worker).all()

        # Seed tasks
        tasks_data = [
            {"title": "Foundation Excavation", "description": "Excavate area for building foundation", "worker_id": workers[4].id, "status": models.TaskStatus.COMPLETED, "estimated_hours": 40, "actual_hours": 38, "start_date": datetime.now() - timedelta(days=10), "end_date": datetime.now() - timedelta(days=7), "priority": "high"},
            {"title": "Foundation Concrete Pour", "description": "Pour concrete for foundation", "worker_id": workers[0].id, "status": models.TaskStatus.IN_PROGRESS, "estimated_hours": 32, "actual_hours": 20, "start_date": datetime.now() - timedelta(days=5), "end_date": datetime.now() + timedelta(days=2), "priority": "high"},
            {"title": "Electrical Rough-in", "description": "Install electrical wiring and outlets", "worker_id": workers[1].id, "status": models.TaskStatus.NOT_STARTED, "estimated_hours": 48, "actual_hours": 0, "start_date": datetime.now() + timedelta(days=3), "end_date": datetime.now() + timedelta(days=8), "priority": "medium"},
            {"title": "Plumbing Installation", "description": "Install water and sewage pipes", "worker_id": workers[2].id, "status": models.TaskStatus.NOT_STARTED, "estimated_hours": 36, "actual_hours": 0, "start_date": datetime.now() + timedelta(days=5), "end_date": datetime.now() + timedelta(days=9), "priority": "medium"},
            {"title": "Framing", "description": "Construct building frame", "worker_id": workers[3].id, "status": models.TaskStatus.IN_PROGRESS, "estimated_hours": 60, "actual_hours": 25, "start_date": datetime.now() - timedelta(days=2), "end_date": datetime.now() + timedelta(days=5), "priority": "high"},
            {"title": "Roofing", "description": "Install roofing system", "worker_id": workers[6].id, "status": models.TaskStatus.NOT_STARTED, "estimated_hours": 44, "actual_hours": 0, "start_date": datetime.now() + timedelta(days=12), "end_date": datetime.now() + timedelta(days=17), "priority": "medium"}
        ]

        for task_data in tasks_data:
            task = models.Task(**task_data)
            db.add(task)

        db.commit()

        # Get task IDs for time logs
        tasks = db.query(models.Task).all()

        # Seed time logs
        for task in tasks:
            if task.actual_hours > 0:
                # Create multiple time log entries for completed/in-progress tasks
                remaining_hours = task.actual_hours
                days_worked = max(1, int(task.actual_hours / 8))

                for day in range(days_worked):
                    hours_today = min(8, remaining_hours)
                    if hours_today > 0:
                        time_log = models.TimeLog(
                            worker_id=task.worker_id,
                            task_id=task.id,
                            date=task.start_date + timedelta(days=day),
                            hours_worked=hours_today,
                            description=f"Work on {task.title} - Day {day + 1}"
                        )
                        db.add(time_log)
                        remaining_hours -= hours_today

        db.commit()
        print("✅ Database seeded successfully with demo data!")
        print("📊 Added: 8 materials, 8 workers, 6 tasks, and time logs")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
