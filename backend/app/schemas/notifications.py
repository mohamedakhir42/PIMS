from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

from app.models.notification import NotificationType


class NotificationCreate(BaseModel):
    user_id: UUID
    type: NotificationType
    title: str
    message: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None


class NotificationUpdate(BaseModel):
    is_read: bool


class Notification(BaseModel):
    id: UUID
    user_id: UUID
    type: NotificationType
    title: str
    message: Optional[str] = None
    is_read: bool
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True