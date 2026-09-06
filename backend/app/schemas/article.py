from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.article import ArticleStatus


class ArticleBase(BaseModel):
    code: str
    reference: str
    designation: str
    description: Optional[str] = None
    category_id: UUID
    unit: str
    stock_min: int = 0
    stock_max: Optional[int] = None
    reorder_point: Optional[int] = None
    main_supplier_id: Optional[UUID] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    status: ArticleStatus = ArticleStatus.ACTIVE


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    reference: Optional[str] = None
    designation: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    unit: Optional[str] = None
    stock_min: Optional[int] = None
    stock_max: Optional[int] = None
    reorder_point: Optional[int] = None
    main_supplier_id: Optional[UUID] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[ArticleStatus] = None


class ArticleInDB(ArticleBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Article(ArticleInDB):
    pass
