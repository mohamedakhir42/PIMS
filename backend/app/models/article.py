from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
import enum
from datetime import datetime


class ArticleStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DISCONTINUED = "DISCONTINUED"


class Article(Base):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    reference = Column(String(50), nullable=False)
    designation = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    unit = Column(String(20), nullable=False)
    stock_min = Column(Integer, default=0)
    stock_max = Column(Integer, nullable=True)
    reorder_point = Column(Integer, nullable=True)
    main_supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=True)
    barcode = Column(String(50), nullable=True, unique=True, index=True)
    image_url = Column(String(500), nullable=True)
    status = Column(SQLEnum(ArticleStatus), default=ArticleStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="articles")
    main_supplier = relationship("Supplier")
    suppliers = relationship("Supplier", secondary="article_suppliers", back_populates="articles")
    stock = relationship("Stock", back_populates="article")
    movements = relationship("StockMovement", back_populates="article")
    request_items = relationship("StockRequestItem", back_populates="article")
    inventory_items = relationship("InventoryItem", back_populates="article")
