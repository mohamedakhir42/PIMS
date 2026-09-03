from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid


class ArticleSupplier(Base):
    __tablename__ = "article_suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=False)
