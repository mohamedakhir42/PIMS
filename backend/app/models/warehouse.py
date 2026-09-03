from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class WarehouseStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    manager = Column(String(100))
    description = Column(String(255))
    status = Column(SQLEnum(WarehouseStatus), default=WarehouseStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    site = relationship("Site", back_populates="warehouses")
    zones = relationship("Zone", back_populates="warehouse")
