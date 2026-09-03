from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from datetime import datetime


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    roles = relationship("Role", secondary="role_permissions", back_populates="permissions")
