from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.utils.deps import get_current_user

router = APIRouter()

@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(100).all()

@router.patch("/{notification_id}/read")
def mark_read(
    notification_id,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    n = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()
    if not n:
        from fastapi import HTTPException
        raise HTTPException(404, "Notification not found")
    n.is_read = True
    db.commit()
    return n
