from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base

import uuid
from datetime import datetime


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    entity_type = Column(String(50), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)

    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))

    uploaded_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(DateTime, default=datetime.utcnow)

    uploader = relationship("User")