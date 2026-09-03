from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from datetime import datetime


class StockRequestItem(Base):
    __tablename__ = "stock_request_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("stock_requests.id"), nullable=False)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("StockRequest", back_populates="items")
    article = relationship("Article", back_populates="request_items")
