from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class NotificationType(str, enum.Enum):
    STOCK_CRITICAL = "STOCK_CRITICAL"
    STOCK_LOW = "STOCK_LOW"
    NEW_REQUEST = "NEW_REQUEST"
    REQUEST_APPROVED = "REQUEST_APPROVED"
    REQUEST_REJECTED = "REQUEST_REJECTED"
    TRANSFER_RECEIVED = "TRANSFER_RECEIVED"
    INVENTORY_COMPLETED = "INVENTORY_COMPLETED"
    ANOMALY = "ANOMALY"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    entity_type = Column(String(50))
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
