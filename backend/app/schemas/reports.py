from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class StockReportItem(BaseModel):
    article_id: UUID
    code: str
    name: str
    category: Optional[str] = None
    location_id: UUID
    quantity: int
    status: str

    class Config:
        from_attributes = True


class MovementReportItem(BaseModel):
    id: UUID
    movement_number: str
    article_id: UUID
    article_name: str
    type: str
    quantity: int
    user_id: UUID
    user_name: str
    date: str
    site_id: UUID
    warehouse_id: UUID
    location_id: UUID

    class Config:
        from_attributes = True


class ArticleReportItem(BaseModel):
    id: UUID
    code: str
    name: str
    category: str
    total_quantity: int
    min_stock: int
    max_stock: int
    status: str

    class Config:
        from_attributes = True
