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
