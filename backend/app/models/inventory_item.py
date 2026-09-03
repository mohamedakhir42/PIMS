from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from datetime import datetime


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inventory_id = Column(UUID(as_uuid=True), ForeignKey("inventories.id"), nullable=False)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False)
    theoretical_quantity = Column(Integer, nullable=False)
    physical_quantity = Column(Integer, nullable=False)
    difference = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory = relationship("Inventory", back_populates="items")
    article = relationship("Article", back_populates="inventory_items")
