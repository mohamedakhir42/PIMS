from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class InventoryStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    VALIDATED = "VALIDATED"
    CANCELLED = "CANCELLED"


class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inventory_number = Column(String(50), unique=True, nullable=False, index=True)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("warehouses.id"), nullable=False)
    responsible_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(InventoryStatus), default=InventoryStatus.DRAFT)
    notes = Column(Text)
    validated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    validated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    site = relationship("Site")
    warehouse = relationship("Warehouse")
    responsible = relationship("User", back_populates="inventories", foreign_keys=[responsible_id])
    validator = relationship("User", foreign_keys=[validated_by])
    items = relationship("InventoryItem", back_populates="inventory")
