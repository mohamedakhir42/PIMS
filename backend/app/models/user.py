from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DISABLED = "DISABLED"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    status = Column(SQLEnum(UserStatus), default=UserStatus.ACTIVE)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    stock_requests = relationship(
    "StockRequest",
    back_populates="requester",
    foreign_keys="StockRequest.requester_id"
)

    approved_stock_requests = relationship(
    "StockRequest",
    back_populates="approver",
    foreign_keys="StockRequest.approved_by"
)
    movements = relationship("StockMovement", back_populates="user")
    inventories = relationship(
    "Inventory",
    back_populates="responsible",
    foreign_keys="Inventory.responsible_id"
)
    audit_logs = relationship("AuditLog", back_populates="user")
