import sys
import types

# if sys.platform == 'win32':
#     sys.modules['pwd'] = types.ModuleType('pwd')

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from datetime import datetime, timedelta
import shutil

# from app.database import SessionLocal, engine
# from app.models import models
from app.routers import materials, purchase_orders, labour, reports, ai_predictions
from app.auth import authenticate_user, create_access_token, get_current_user
from app.models.schemas import Token, User
from app.routers import agent
from app.routers import agentic_system
# from app.routers import admin_knowledge_management
# from app.training import knowledge_management

app = FastAPI(
    title="Construction Site AI Management",
    description="AI-powered construction site management application",
    version="1.0.0"
)

# Include routers
# app.include_router(knowledge_management.router, prefix="/api/knowledge", tags=["Knowledge Management"])
# app.include_router(admin_knowledge_management.router, prefix="/api/admin", tags=["Admin Knowledge Management"])
app.include_router(agentic_system.router, prefix="/api/agentic", tags=["Agentic AI System"])
# app.include_router(materials.router, prefix="/api/materials", tags=["Materials"])
# app.include_router(purchase_orders.router, prefix="/api/purchase-orders", tags=["Purchase Orders"])
# app.include_router(labour.router, prefix="/api/labour", tags=["Labour"])
# app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
# app.include_router(ai_predictions.router, prefix="/api/ai", tags=["AI Predictions"])
# app.include_router(agent.router, prefix="/api/ai", tags=["AI Agent"])

# # Create database tables with error handling to ignore existing indexes
# from sqlalchemy.exc import OperationalError

# try:
#     models.Base.metadata.create_all(bind=engine)
# except OperationalError as e:
#     print(f"Warning during DB schema creation: {e}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Create upload directory and mount static files
# os.makedirs("uploads", exist_ok=True)
# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# # Dependency to get DB session
# # def get_db():
# #     db = SessionLocal()
# #     try:
# #         yield db
# #     finally:
# #         db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication endpoint
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# File upload endpoint
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    upload_folder = f"uploads/{datetime.now().strftime('%Y-%m-%d')}"
    os.makedirs(upload_folder, exist_ok=True)

    file_location = f"{upload_folder}/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    return {"filename": file.filename, "location": file_location}

# Include routers again (if duplication is needed, else remove)
app.include_router(materials.router, prefix="/api/materials", tags=["materials"])
app.include_router(purchase_orders.router, prefix="/api/purchase-orders", tags=["purchase_orders"])
app.include_router(labour.router, prefix="/api/labour", tags=["labour"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(ai_predictions.router, prefix="/api/ai", tags=["ai_predictions"])

@app.get("/")
async def root():
    return {"message": "Construction Site AI Management API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
