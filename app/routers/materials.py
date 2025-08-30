from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
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

@router.get("/", response_model=List[schemas.Material])
async def get_materials(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    materials = db.query(models.Material).offset(skip).limit(limit).all()
    return materials

@router.get("/low-stock", response_model=List[schemas.Material])
async def get_low_stock_materials(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    materials = db.query(models.Material).filter(
        models.Material.current_stock <= models.Material.minimum_stock
    ).all()
    return materials

@router.get("/{material_id}", response_model=schemas.Material)
async def get_material(
    material_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@router.post("/", response_model=schemas.Material)
async def create_material(
    material: schemas.MaterialCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_material = models.Material(**material.dict())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@router.put("/{material_id}", response_model=schemas.Material)
async def update_material(
    material_id: int,
    material_update: schemas.MaterialUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    for field, value in material_update.dict(exclude_unset=True).items():
        setattr(material, field, value)

    db.commit()
    db.refresh(material)
    return material

@router.delete("/{material_id}")
async def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}

@router.post("/{material_id}/reorder")
async def reorder_material(
    material_id: int,
    quantity: float,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    material = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    # Logic to create automatic reorder (could integrate with purchase order system)
    return {
        "message": f"Reorder request created for {quantity} units of {material.name}",
        "material_name": material.name,
        "quantity": quantity,
        "supplier": material.supplier_name
    }
