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
