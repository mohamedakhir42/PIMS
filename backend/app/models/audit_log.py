from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from datetime import datetime


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    old_values = Column(Text, nullable=True)
    new_values = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    additional_info = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
