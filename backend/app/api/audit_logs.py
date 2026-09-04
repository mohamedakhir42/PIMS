from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.utils.deps import check_permission

router = APIRouter()

@router.get("")
def list_audit_logs(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("AUDIT_READ")),
):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(min(limit,200)).all()
