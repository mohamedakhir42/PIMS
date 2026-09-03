from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class ZoneStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Zone(Base):
    __tablename__ = "zones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("warehouses.id"), nullable=False)
    description = Column(String(255))
    status = Column(SQLEnum(ZoneStatus), default=ZoneStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="zones")
    locations = relationship("Location", back_populates="zone")
