from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.utils.deps import check_permission

router = APIRouter()

@router.get("")
def list_audit_logs(
    skip: int = 0,
    limit: int = 50,
    action: Optional[str] = Query(None),
    entity: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("AUDIT_READ")),
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if entity:
        query = query.filter(AuditLog.entity_type.ilike(f"%{entity}%"))
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(min(limit,200)).all()
