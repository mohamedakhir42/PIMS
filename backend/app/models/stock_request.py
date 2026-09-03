from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class RequestStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PREPARING = "PREPARING"
    READY = "READY"
    ISSUED = "ISSUED"
    CANCELLED = "CANCELLED"


class RequestPriority(str, enum.Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class StockRequest(Base):
    __tablename__ = "stock_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_number = Column(String(50), unique=True, nullable=False, index=True)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    service = Column(String(100))
    priority = Column(SQLEnum(RequestPriority), default=RequestPriority.NORMAL)
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.DRAFT)
    reason = Column(Text)
    rejection_reason = Column(Text)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requester = relationship(
    "User",
    back_populates="stock_requests",
    foreign_keys=[requester_id]
)

    approver = relationship(
    "User",
    back_populates="approved_stock_requests",
    foreign_keys=[approved_by]
)
    items = relationship("StockRequestItem", back_populates="request")
