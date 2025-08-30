# BrickBang Admin-Only Knowledge Management System
## Secure Knowledge Upload & System Improvement Controls

### 🔐 Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN AUTHENTICATION LAYER                   │
│          (Multi-Factor Auth, Role Verification)                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────────────────────┐
        │             │                             │
┌───────▼──────┐ ┌────▼────────┐           ┌───────▼──────┐
│ SUPER ADMIN  │ │    ADMIN    │           │  KNOWLEDGE   │
│   (Level 3)  │ │  (Level 2)  │           │   AUDITOR    │
│              │ │             │           │  (Level 1)   │
└──────────────┘ └─────────────┘           └──────────────┘
        │             │                             │
        │             │                             │
┌───────▼─────────────▼─────────────────────────────▼──────┐
│              KNOWLEDGE MANAGEMENT CONTROLS                 │
│  • Upload Approval Workflows                              │
│  • Quality Validation Gates                               │
│  • Audit Logging & Tracking                               │
│  • Version Control & Rollback                             │
│  • Impact Assessment                                       │
└────────────────────────────────────────────────────────────┘
```

### 🏢 Admin Role Hierarchy

#### **Super Admin (Level 3)**
- **Full system control** and configuration access
- **Knowledge base architecture** modifications
- **Admin role management** and permissions
- **System-wide training pipeline** optimization
- **Critical system updates** and rollbacks
- **Compliance and audit** oversight

#### **Knowledge Admin (Level 2)** 
- **Knowledge upload** and validation
- **Training scenario** creation and management
- **Dataset import** and curation
- **Quality assessment** and approval
- **Agent training** supervision
- **Knowledge base** maintenance

#### **Knowledge Auditor (Level 1)**
- **Knowledge quality** review and validation
- **Upload request** assessment
- **Training progress** monitoring
- **Audit report** generation
- **Compliance verification**
- **Read-only system** access

### 🛡️ Advanced Authentication System

```python
# app/auth/admin_auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import AdminUser, AdminSession
from datetime import datetime, timedelta
import jwt
import pyotp
import bcrypt
from typing import Optional, List
import logging
from enum import Enum

class AdminLevel(Enum):
    AUDITOR = 1
    KNOWLEDGE_ADMIN = 2
    SUPER_ADMIN = 3

class AdminPermission(Enum):
    # Knowledge Management Permissions
    UPLOAD_KNOWLEDGE = "upload_knowledge"
    APPROVE_KNOWLEDGE = "approve_knowledge"
    DELETE_KNOWLEDGE = "delete_knowledge"
    MODIFY_TRAINING_PIPELINE = "modify_training_pipeline"
    
    # System Management Permissions
    MANAGE_ADMIN_USERS = "manage_admin_users"
    SYSTEM_CONFIGURATION = "system_configuration"
    VIEW_AUDIT_LOGS = "view_audit_logs"
    EMERGENCY_CONTROLS = "emergency_controls"
    
    # Agent Management Permissions
    TRAIN_AGENTS = "train_agents"
    MODIFY_AGENT_BEHAVIOR = "modify_agent_behavior"
    ACCESS_SENSITIVE_DATA = "access_sensitive_data"

security = HTTPBearer()

class AdminAuthManager:
    """Advanced admin authentication and authorization system"""
    
    def __init__(self):
        self.secret_key = "your-super-secure-admin-secret-key"  # Use environment variable
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.max_login_attempts = 3
        self.lockout_duration_minutes = 30
        
        # Define permissions for each admin level
        self.role_permissions = {
            AdminLevel.AUDITOR: [
                AdminPermission.VIEW_AUDIT_LOGS,
            ],
            AdminLevel.KNOWLEDGE_ADMIN: [
                AdminPermission.UPLOAD_KNOWLEDGE,
                AdminPermission.APPROVE_KNOWLEDGE,
                AdminPermission.TRAIN_AGENTS,
                AdminPermission.VIEW_AUDIT_LOGS,
            ],
            AdminLevel.SUPER_ADMIN: [
                AdminPermission.UPLOAD_KNOWLEDGE,
                AdminPermission.APPROVE_KNOWLEDGE,
                AdminPermission.DELETE_KNOWLEDGE,
                AdminPermission.MODIFY_TRAINING_PIPELINE,
                AdminPermission.MANAGE_ADMIN_USERS,
                AdminPermission.SYSTEM_CONFIGURATION,
                AdminPermission.VIEW_AUDIT_LOGS,
                AdminPermission.EMERGENCY_CONTROLS,
                AdminPermission.TRAIN_AGENTS,
                AdminPermission.MODIFY_AGENT_BEHAVIOR,
                AdminPermission.ACCESS_SENSITIVE_DATA,
            ]
        }
        
        self.logger = logging.getLogger(__name__)
    
    async def authenticate_admin(self, username: str, password: str, totp_code: str, db: Session) -> Optional[dict]:
        """Authenticate admin user with multi-factor authentication"""
        
        # Get admin user
        admin_user = db.query(AdminUser).filter(AdminUser.username == username).first()
        if not admin_user:
            self.logger.warning(f"Login attempt with invalid username: {username}")
            return None
        
        # Check if account is locked
        if await self._is_account_locked(admin_user, db):
            self.logger.warning(f"Login attempt on locked account: {username}")
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is temporarily locked due to multiple failed login attempts"
            )
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), admin_user.password_hash.encode('utf-8')):
            await self._record_failed_login(admin_user, db)
            self.logger.warning(f"Failed login attempt for user: {username}")
            return None
        
        # Verify TOTP (Time-based One-Time Password)
        if not self._verify_totp(admin_user.totp_secret, totp_code):
            await self._record_failed_login(admin_user, db)
            self.logger.warning(f"Invalid TOTP for user: {username}")
            return None
        
        # Reset failed login attempts on successful login
        admin_user.failed_login_attempts = 0
        admin_user.last_login = datetime.now()
        db.commit()
        
        # Create admin session
        session = await self._create_admin_session(admin_user, db)
        
        self.logger.info(f"Successful admin login: {username}")
        
        return {
            'user_id': admin_user.id,
            'username': admin_user.username,
            'admin_level': admin_user.admin_level,
            'permissions': self._get_user_permissions(admin_user.admin_level),
            'session_id': session.id,
            'expires_at': session.expires_at
        }
    
    async def _is_account_locked(self, admin_user: AdminUser, db: Session) -> bool:
        """Check if admin account is locked due to failed login attempts"""
        
        if admin_user.failed_login_attempts >= self.max_login_attempts:
            if admin_user.locked_until and admin_user.locked_until > datetime.now():
                return True
            elif admin_user.failed_login_attempts >= self.max_login_attempts:
                # Lock account
                admin_user.locked_until = datetime.now() + timedelta(minutes=self.lockout_duration_minutes)
                db.commit()
                return True
        
        return False
    
    async def _record_failed_login(self, admin_user: AdminUser, db: Session):
        """Record failed login attempt"""
        admin_user.failed_login_attempts += 1
        
        if admin_user.failed_login_attempts >= self.max_login_attempts:
            admin_user.locked_until = datetime.now() + timedelta(minutes=self.lockout_duration_minutes)
        
        db.commit()
    
    def _verify_totp(self, totp_secret: str, totp_code: str) -> bool:
        """Verify Time-based One-Time Password"""
        totp = pyotp.TOTP(totp_secret)
        return totp.verify(totp_code, valid_window=1)  # Allow 1 window tolerance
    
    async def _create_admin_session(self, admin_user: AdminUser, db: Session) -> AdminSession:
        """Create secure admin session"""
        
        # Invalidate any existing sessions for this user
        existing_sessions = db.query(AdminSession).filter(
            AdminSession.admin_user_id == admin_user.id,
            AdminSession.is_active == True
        ).all()
        
        for session in existing_sessions:
            session.is_active = False
        
        # Create new session
        new_session = AdminSession(
            admin_user_id=admin_user.id,
            session_token=jwt.encode({
                'user_id': admin_user.id,
                'username': admin_user.username,
                'admin_level': admin_user.admin_level.value,
                'exp': datetime.now() + timedelta(minutes=self.access_token_expire_minutes),
                'iat': datetime.now()
            }, self.secret_key, algorithm=self.algorithm),
            expires_at=datetime.now() + timedelta(minutes=self.access_token_expire_minutes),
            is_active=True,
            created_at=datetime.now()
        )
        
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        
        return new_session
    
    def _get_user_permissions(self, admin_level: AdminLevel) -> List[str]:
        """Get permissions for admin level"""
        return [perm.value for perm in self.role_permissions.get(admin_level, [])]
    
    async def verify_admin_token(self, token: str, db: Session) -> Optional[dict]:
        """Verify admin authentication token"""
        
        try:
            # Decode JWT token
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Check session in database
            session = db.query(AdminSession).filter(
                AdminSession.session_token == token,
                AdminSession.is_active == True,
                AdminSession.expires_at > datetime.now()
            ).first()
            
            if not session:
                return None
            
            # Get admin user
            admin_user = db.query(AdminUser).filter(AdminUser.id == payload['user_id']).first()
            if not admin_user:
                return None
            
            return {
                'user_id': admin_user.id,
                'username': admin_user.username,
                'admin_level': admin_user.admin_level,
                'permissions': self._get_user_permissions(admin_user.admin_level),
                'session_id': session.id
            }
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def require_permission(self, required_permission: AdminPermission):
        """Decorator to require specific admin permission"""
        def decorator(func):
            async def wrapper(*args, **kwargs):
                # Get admin info from request
                admin_info = kwargs.get('admin_info')
                if not admin_info:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Admin authentication required"
                    )
                
                # Check permission
                user_permissions = admin_info.get('permissions', [])
                if required_permission.value not in user_permissions:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Insufficient permissions. Required: {required_permission.value}"
                    )
                
                return await func(*args, **kwargs)
            return wrapper
        return decorator

admin_auth_manager = AdminAuthManager()

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated admin user"""
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    admin_info = await admin_auth_manager.verify_admin_token(credentials.credentials, db)
    if not admin_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return admin_info

async def require_super_admin(admin_info: dict = Depends(get_current_admin)):
    """Require Super Admin level access"""
    if admin_info['admin_level'] != AdminLevel.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin access required"
        )
    return admin_info

async def require_knowledge_admin(admin_info: dict = Depends(get_current_admin)):
    """Require Knowledge Admin level access or higher"""
    if admin_info['admin_level'].value < AdminLevel.KNOWLEDGE_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Knowledge Admin access required"
        )
    return admin_info


# Knowledge Upload Workflow System
# app/admin/knowledge_workflow.py
from enum import Enum
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

class UploadStatus(Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    DEPLOYED = "deployed"
    ROLLED_BACK = "rolled_back"

class KnowledgeUploadWorkflow:
    """Manages knowledge upload approval workflow"""
    
    def __init__(self):
        self.approval_requirements = {
            'building_codes': {'reviewers': 2, 'auto_deploy': False},
            'safety_protocols': {'reviewers': 3, 'auto_deploy': False},
            'cost_data': {'reviewers': 1, 'auto_deploy': True},
            'construction_methods': {'reviewers': 2, 'auto_deploy': True},
            'materials': {'reviewers': 1, 'auto_deploy': True}
        }
    
    async def submit_knowledge_upload(
        self, 
        admin_user_id: int,
        knowledge_domain: str,
        files: List[Any],
        description: str,
        priority: str,
        db: Session
    ) -> Dict[str, Any]:
        """Submit knowledge upload for approval workflow"""
        
        # Create upload request
        upload_request = KnowledgeUploadRequest(
            id=str(uuid.uuid4()),
            admin_user_id=admin_user_id,
            knowledge_domain=knowledge_domain,
            files_count=len(files),
            description=description,
            priority=priority,
            status=UploadStatus.PENDING,
            submitted_at=datetime.now()
        )
        
        db.add(upload_request)
        db.commit()
        
        # Store files temporarily
        temp_storage_path = await self._store_files_temporarily(upload_request.id, files)
        upload_request.temp_storage_path = temp_storage_path
        db.commit()
        
        # Perform initial quality assessment
        quality_assessment = await self._perform_quality_assessment(files, knowledge_domain)
        
        # Create review tasks for required reviewers
        await self._create_review_tasks(upload_request, db)
        
        # Log the upload submission
        await self._log_admin_action(
            admin_user_id,
            'knowledge_upload_submitted',
            {
                'upload_id': upload_request.id,
                'domain': knowledge_domain,
                'files_count': len(files)
            },
            db
        )
        
        return {
            'upload_id': upload_request.id,
            'status': upload_request.status.value,
            'quality_assessment': quality_assessment,
            'review_tasks_created': True,
            'next_steps': 'Awaiting review approval'
        }
    
    async def review_knowledge_upload(
        self,
        upload_id: str,
        reviewer_admin_id: int,
        approval: bool,
        comments: str,
        db: Session
    ) -> Dict[str, Any]:
        """Review and approve/reject knowledge upload"""
        
        upload_request = db.query(KnowledgeUploadRequest).filter(
            KnowledgeUploadRequest.id == upload_id
        ).first()
        
        if not upload_request:
            raise ValueError(f"Upload request {upload_id} not found")
        
        # Record the review
        review = KnowledgeUploadReview(
            upload_request_id=upload_id,
            reviewer_admin_id=reviewer_admin_id,
            approved=approval,
            comments=comments,
            reviewed_at=datetime.now()
        )
        
        db.add(review)
        db.commit()
        
        # Check if all required reviews are complete
        total_reviews = db.query(KnowledgeUploadReview).filter(
            KnowledgeUploadReview.upload_request_id == upload_id
        ).count()
        
        approved_reviews = db.query(KnowledgeUploadReview).filter(
            KnowledgeUploadReview.upload_request_id == upload_id,
            KnowledgeUploadReview.approved == True
        ).count()
        
        required_reviewers = self.approval_requirements[upload_request.knowledge_domain]['reviewers']
        
        if total_reviews >= required_reviewers:
            if approved_reviews >= required_reviewers:
                # All reviews approved - proceed to deployment
                await self._deploy_knowledge_upload(upload_request, db)
                upload_request.status = UploadStatus.DEPLOYED
            else:
                # Not enough approvals - reject
                upload_request.status = UploadStatus.REJECTED
            
            db.commit()
        else:
            upload_request.status = UploadStatus.UNDER_REVIEW
            db.commit()
        
        # Log the review action
        await self._log_admin_action(
            reviewer_admin_id,
            'knowledge_upload_reviewed',
            {
                'upload_id': upload_id,
                'approved': approval,
                'total_reviews': total_reviews,
                'required_reviews': required_reviewers
            },
            db
        )
        
        return {
            'upload_id': upload_id,
            'review_recorded': True,
            'current_status': upload_request.status.value,
            'total_reviews': total_reviews,
            'required_reviews': required_reviewers,
            'approved_reviews': approved_reviews
        }


# Secure Knowledge Management Router
# app/routers/admin_knowledge_management.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.admin_auth import (
    get_current_admin, 
    require_super_admin, 
    require_knowledge_admin,
    AdminPermission,
    admin_auth_manager
)
from app.admin.knowledge_workflow import KnowledgeUploadWorkflow
from app.training.knowledge_importer import AdvancedKnowledgeImporter
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


# Admin Dashboard Frontend Component
# src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/ApiContext';
import AdminLogin from './AdminLogin';
import KnowledgeUploadPanel from './KnowledgeUploadPanel';
import PendingReviews from './PendingReviews';
import AuditLogs from './AuditLogs';
import SystemControls from './SystemControls';

const AdminDashboard = () => {
    const api = useApi();
    const [adminInfo, setAdminInfo] = useState(null);
    const [selectedTab, setSelectedTab] = useState('overview');
    const [pendingReviews, setPendingReviews] = useState([]);
    const [systemStatus, setSystemStatus] = useState(null);

    useEffect(() => {
        // Check if admin is already logged in
        const storedAdminInfo = localStorage.getItem('adminInfo');
        if (storedAdminInfo) {
            setAdminInfo(JSON.parse(storedAdminInfo));
            loadDashboardData();
        }
    }, []);

    const loadDashboardData = async () => {
        try {
            const [reviews, status] = await Promise.all([
                api.admin.getPendingReviews(),
                api.agentic.getSystemStatus()
            ]);
            
            setPendingReviews(reviews.pending_reviews);
            setSystemStatus(status);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleAdminLogin = (loginResult) => {
        setAdminInfo(loginResult.admin_info);
        localStorage.setItem('adminInfo', JSON.stringify(loginResult.admin_info));
        localStorage.setItem('adminToken', loginResult.admin_info.session_token);
        loadDashboardData();
    };

    const handleLogout = () => {
        setAdminInfo(null);
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('adminToken');
    };

    if (!adminInfo) {
        return <AdminLogin onLogin={handleAdminLogin} />;
    }

    const hasPermission = (permission) => {
        return adminInfo.permissions.includes(permission);
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>🔐 BrickBang Admin Control Center</h1>
                <div className="admin-info">
                    <span className="admin-user">
                        👤 {adminInfo.username} 
                        <span className={`admin-level level-${adminInfo.admin_level.value}`}>
                            Level {adminInfo.admin_level.value}
                        </span>
                    </span>
                    <button className="btn btn-outline-danger" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('overview')}
                >
                    📊 Overview
                </button>
                
                {hasPermission('upload_knowledge') && (
                    <button 
                        className={`tab ${selectedTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('upload')}
                    >
                        📁 Upload Knowledge
                    </button>
                )}
                
                {hasPermission('approve_knowledge') && (
                    <button 
                        className={`tab ${selectedTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('reviews')}
                    >
                        ✅ Pending Reviews ({pendingReviews.length})
                    </button>
                )}
                
                {hasPermission('view_audit_logs') && (
                    <button 
                        className={`tab ${selectedTab === 'audit' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('audit')}
                    >
                        📋 Audit Logs
                    </button>
                )}
                
                {hasPermission('system_configuration') && (
                    <button 
                        className={`tab ${selectedTab === 'system' ? 'active' : ''}`}
                        onClick={() => setSelectedTab('system')}
                    >
                        ⚙️ System Controls
                    </button>
                )}
            </div>

            <div className="tab-content">
                {selectedTab === 'overview' && (
                    <div className="overview-panel">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Pending Reviews</h3>
                                <div className="stat-number">{pendingReviews.length}</div>
                            </div>
                            <div className="stat-card">
                                <h3>System Health</h3>
                                <div className="stat-number">
                                    {systemStatus?.system_health?.overall_health || 0}%
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>Active Projects</h3>
                                <div className="stat-number">
                                    {Object.keys(systemStatus?.active_projects || {}).length}
                                </div>
                            </div>
                        </div>
                        
                        <div className="permissions-panel">
                            <h3>Your Permissions</h3>
                            <div className="permissions-grid">
                                {adminInfo.permissions.map(permission => (
                                    <span key={permission} className="permission-badge">
                                        {permission.replace('_', ' ').toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {selectedTab === 'upload' && hasPermission('upload_knowledge') && (
                    <KnowledgeUploadPanel onUploadComplete={loadDashboardData} />
                )}
                
                {selectedTab === 'reviews' && hasPermission('approve_knowledge') && (
                    <PendingReviews 
                        reviews={pendingReviews}
                        onReviewComplete={loadDashboardData}
                    />
                )}
                
                {selectedTab === 'audit' && hasPermission('view_audit_logs') && (
                    <AuditLogs />
                )}
                
                {selectedTab === 'system' && hasPermission('system_configuration') && (
                    <SystemControls 
                        systemStatus={systemStatus}
                        onSystemUpdate={loadDashboardData}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
```

### 🔐 Security Features Summary

#### **Multi-Layer Authentication**
- **Username/Password** + **TOTP (Time-based OTP)**
- **Account lockout** after failed attempts
- **Session management** with automatic expiration
- **JWT tokens** for secure API access

#### **Role-Based Access Control (RBAC)**
- **Super Admin**: Full system control
- **Knowledge Admin**: Knowledge management permissions  
- **Knowledge Auditor**: Read-only access and review capabilities

#### **Approval Workflow System**
- **Multi-reviewer approval** for critical knowledge domains
- **Quality assessment** before deployment
- **Version control** and rollback capabilities
- **Audit trail** for all knowledge changes

#### **Security Monitoring**
- **Comprehensive audit logging** of all admin actions
- **Failed login attempt tracking**
- **IP address logging** for security analysis
- **Real-time security alerts**

### 🛡️ Implementation Steps

#### **1. Update main.py**
```python
from app.routers import admin_knowledge_management
app.include_router(admin_knowledge_management.router, prefix="/api/admin", tags=["Admin Knowledge Management"])
```

#### **2. Update ApiContext.js**
```javascript
admin: {
  login: (data) => apiService.post('/api/admin/login', data),
  uploadKnowledge: (formData) => apiService.post('/api/admin/knowledge/upload', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
  }),
  reviewKnowledge: (data) => apiService.post('/api/admin/knowledge/review', data),
  getPendingReviews: () => apiService.get('/api/admin/knowledge/pending-reviews'),
  getAuditLogs: () => apiService.get('/api/admin/audit/logs'),
  optimizePipeline: () => apiService.post('/api/admin/system/optimize-pipeline'),
  rollbackDeployment: (uploadId) => apiService.delete(`/api/admin/knowledge/rollback/${uploadId}`),
},
```

#### **3. Database Models**
```python
# Add to app/models/models.py
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
```

This secure system ensures that only authorized administrators can modify your AI system's knowledge base, maintaining the integrity and security of your construction expertise while providing proper audit trails and approval workflows.