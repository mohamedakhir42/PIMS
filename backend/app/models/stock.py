from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from datetime import datetime


class Stock(Base):
    __tablename__ = "stock"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=False)
    quantity = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    article = relationship("Article", back_populates="stock")
    location = relationship("Location", back_populates="stock")
