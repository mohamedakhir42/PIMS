from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class LocationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Location(Base):
    __tablename__ = "locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("zones.id"), nullable=False)
    capacity = Column(Integer, nullable=True)
    description = Column(String(255))
    status = Column(SQLEnum(LocationStatus), default=LocationStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("Zone", back_populates="locations")
    stock = relationship("Stock", back_populates="location")
