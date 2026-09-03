from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class MovementType(str, enum.Enum):
    RECEIPT = "RECEIPT"
    ISSUE = "ISSUE"
    TRANSFER = "TRANSFER"
    RETURN = "RETURN"
    ADJUSTMENT = "ADJUSTMENT"
    INVENTORY_ADJUSTMENT = "INVENTORY_ADJUSTMENT"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    movement_number = Column(String(50), unique=True, nullable=False, index=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    movement_type = Column(SQLEnum(MovementType), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=True)
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("warehouses.id"), nullable=True)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=True)
    source_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=True)
    destination_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id"), nullable=True)
    reason = Column(String(255))
    reference = Column(String(100))
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    article = relationship("Article", back_populates="movements")
    user = relationship("User", back_populates="movements")
