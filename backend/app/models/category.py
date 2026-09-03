from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class CategoryStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    status = Column(SQLEnum(CategoryStatus), default=CategoryStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent")
    articles = relationship("Article", back_populates="category")