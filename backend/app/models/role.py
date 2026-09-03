from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from datetime import datetime


class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary="role_permissions", back_populates="roles")
