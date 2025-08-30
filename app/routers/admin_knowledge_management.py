from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.admin.admin_auth import (
    get_current_admin, 
    require_super_admin, 
    require_knowledge_admin,
    AdminPermission,
    admin_auth_manager
)
from app.admin.knowledge_workflow import KnowledgeUploadWorkflow
from app.training.knowledge_management import AdvancedKnowledgeImporter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio

router = APIRouter()

# Initialize systems
knowledge_workflow = KnowledgeUploadWorkflow()
knowledge_importer = AdvancedKnowledgeImporter()

class AdminLoginRequest(BaseModel):
    username: str
    password: str
    totp_code: str

class KnowledgeUploadRequest(BaseModel):
    knowledge_domain: str
    description: str
    priority: str = "medium"

class ReviewRequest(BaseModel):
    upload_id: str
    approval: bool
    comments: str

@router.post("/admin/login")
async def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """Secure admin login with multi-factor authentication"""
    try:
        auth_result = await admin_auth_manager.authenticate_admin(
            request.username,
            request.password,
            request.totp_code,
            db
        )
        
        if not auth_result:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials or TOTP code"
            )
        
        return {
            'success': True,
            'admin_info': auth_result,
            'message': 'Admin login successful'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/admin/knowledge/upload")
async def upload_knowledge_secure(
    files: List[UploadFile] = File(...),
    knowledge_domain: str = Form(...),
    description: str = Form(...),
    priority: str = Form("medium"),
    admin_info: dict = Depends(require_knowledge_admin),
    db: Session = Depends(get_db)
):
    """Secure knowledge upload with approval workflow"""
    
    # Check specific permission
    if AdminPermission.UPLOAD_KNOWLEDGE.value not in admin_info['permissions']:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions for knowledge upload"
        )
    
    try:
        # Submit to approval workflow
        workflow_result = await knowledge_workflow.submit_knowledge_upload(
            admin_user_id=admin_info['user_id'],
            knowledge_domain=knowledge_domain,
            files=files,
            description=description,
            priority=priority,
            db=db
        )
        
        return {
            'success': True,
            'workflow_result': workflow_result,
            'message': f'Knowledge upload submitted for review. Upload ID: {workflow_result["upload_id"]}'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge upload failed: {str(e)}")

@router.post("/admin/knowledge/review")
async def review_knowledge_upload(
    request: ReviewRequest,
    admin_info: dict = Depends(require_knowledge_admin),
    db: Session = Depends(get_db)
):
    """Review and approve/reject knowledge uploads"""
    
    # Check specific permission
    if AdminPermission.APPROVE_KNOWLEDGE.value not in admin_info['permissions']:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions for knowledge review"
        )
    
    try:
        review_result = await knowledge_workflow.review_knowledge_upload(
            upload_id=request.upload_id,
            reviewer_admin_id=admin_info['user_id'],
            approval=request.approval,
            comments=request.comments,
            db=db
        )
        
        return {
            'success': True,
            'review_result': review_result,
            'message': f'Knowledge upload review recorded for {request.upload_id}'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge review failed: {str(e)}")

@router.get("/admin/knowledge/pending-reviews")
async def get_pending_reviews(
    admin_info: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get pending knowledge upload reviews"""
    try:
        # Get pending uploads that need review
        pending_uploads = db.query(KnowledgeUploadRequest).filter(
            KnowledgeUploadRequest.status.in_(['pending', 'under_review'])
        ).all()
        
        pending_reviews = []
        for upload in pending_uploads:
            pending_reviews.append({
                'upload_id': upload.id,
                'knowledge_domain': upload.knowledge_domain,
                'description': upload.description,
                'priority': upload.priority,
                'submitted_at': upload.submitted_at,
                'submitted_by': upload.admin_user.username,
                'files_count': upload.files_count,
                'current_reviews': len(upload.reviews)
            })
        
        return {
            'success': True,
            'pending_reviews': pending_reviews,
            'total_pending': len(pending_reviews)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get pending reviews: {str(e)}")

@router.post("/admin/system/optimize-pipeline")
async def optimize_training_pipeline_secure(
    admin_info: dict = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Optimize training pipeline - Super Admin only"""
    
    if AdminPermission.MODIFY_TRAINING_PIPELINE.value not in admin_info['permissions']:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions for training pipeline modification"
        )
    
    try:
        optimization_result = await knowledge_importer.optimize_agent_training_pipeline()
        
        # Log the system modification
        await admin_auth_manager._log_admin_action(
            admin_info['user_id'],
            'training_pipeline_optimized',
            {'optimization_result': optimization_result},
            db
        )
        
        return {
            'success': True,
            'optimization_result': optimization_result,
            'message': 'Training pipeline optimized successfully'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline optimization failed: {str(e)}")

@router.get("/admin/audit/logs")
async def get_audit_logs(
    limit: int = 100,
    admin_info: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get audit logs - Admin access required"""
    
    if AdminPermission.VIEW_AUDIT_LOGS.value not in admin_info['permissions']:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions for audit log access"
        )
    
    try:
        audit_logs = db.query(AdminAuditLog).order_by(
            AdminAuditLog.created_at.desc()
        ).limit(limit).all()
        
        logs = []
        for log in audit_logs:
            logs.append({
                'id': log.id,
                'admin_user': log.admin_user.username,
                'action': log.action,
                'details': log.details,
                'ip_address': log.ip_address,
                'created_at': log.created_at
            })
        
        return {
            'success': True,
            'audit_logs': logs,
            'total_logs': len(logs)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get audit logs: {str(e)}")

@router.delete("/admin/knowledge/rollback/{upload_id}")
async def rollback_knowledge_deployment(
    upload_id: str,
    admin_info: dict = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Emergency rollback of knowledge deployment - Super Admin only"""
    
    if AdminPermission.EMERGENCY_CONTROLS.value not in admin_info['permissions']:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions for emergency controls"
        )
    
    try:
        # Implement rollback logic
        rollback_result = await knowledge_importer.rollback_knowledge_deployment(upload_id)
        
        # Log the emergency action
        await admin_auth_manager._log_admin_action(
            admin_info['user_id'],
            'knowledge_deployment_rollback',
            {'upload_id': upload_id, 'rollback_result': rollback_result},
            db
        )
        
        return {
            'success': True,
            'rollback_result': rollback_result,
            'message': f'Knowledge deployment {upload_id} rolled back successfully'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rollback failed: {str(e)}")
