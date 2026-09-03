from sqlalchemy import Column, String, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class SupplierStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    ice = Column(String(50), nullable=True)
    address = Column(String(255))
    phone = Column(String(20))
    email = Column(String(100))
    contact_person = Column(String(100))
    status = Column(SQLEnum(SupplierStatus), default=SupplierStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    articles = relationship("Article", secondary="article_suppliers", back_populates="suppliers")
