from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.models.user import User
import uuid

def create_notification(
    db: Session,
    *,
    user_id: uuid.UUID,
    notification_type: NotificationType,
    title: str,
    message: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[uuid.UUID] = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
        is_read=False,
    )
    db.add(notification)
    return notification

def notify_stock_critical(db: Session, user_id: uuid.UUID, article_name: str, current_stock: int):
    return create_notification(
        db,
        user_id=user_id,
        notification_type=NotificationType.STOCK_CRITICAL,
        title=f"Stock Critical: {article_name}",
        message=f"Stock level is critical for {article_name}. Current: {current_stock}",
        entity_type="Article",
    )

def notify_new_request(db: Session, user_id: uuid.UUID, request_number: str):
    return create_notification(
        db,
        user_id=user_id,
        notification_type=NotificationType.NEW_REQUEST,
        title=f"New Request: {request_number}",
        message=f"A new stock request {request_number} has been submitted and requires approval.",
        entity_type="StockRequest",
    )

def notify_request_approved(db: Session, user_id: uuid.UUID, request_number: str):
    return create_notification(
        db,
        user_id=user_id,
        notification_type=NotificationType.REQUEST_APPROVED,
        title=f"Request Approved: {request_number}",
        message=f"Your stock request {request_number} has been approved.",
        entity_type="StockRequest",
    )

def notify_request_rejected(db: Session, user_id: uuid.UUID, request_number: str, reason: str):
    return create_notification(
        db,
        user_id=user_id,
        notification_type=NotificationType.REQUEST_REJECTED,
        title=f"Request Rejected: {request_number}",
        message=f"Your stock request {request_number} has been rejected. Reason: {reason}",
        entity_type="StockRequest",
    )

def notify_inventory_completed(db: Session, user_id: uuid.UUID, inventory_number: str):
    return create_notification(
        db,
        user_id=user_id,
        notification_type=NotificationType.INVENTORY_COMPLETED,
        title=f"Inventory Completed: {inventory_number}",
        message=f"Physical inventory {inventory_number} has been validated and completed.",
        entity_type="Inventory",
    )

def notify_anomaly(db: Session, user_id: uuid.UUID, entity_type: str, description: str):
    return create_notification(
        db,
        user_id=user_id,
        notification_type=NotificationType.ANOMALY,
        title=f"Anomaly Detected: {entity_type}",
        message=description,
        entity_type=entity_type,
    )
