from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from app.models.stock_request import RequestStatus


class StockRequestItemCreate(BaseModel):
    article_id: UUID
    quantity: int


class StockRequestCreate(BaseModel):
    service: str
    priority: str
    reason: str
    items: List[StockRequestItemCreate]


class StockRequestUpdate(BaseModel):
    service: Optional[str] = None
    priority: Optional[str] = None
    reason: Optional[str] = None


class StockRequestItem(BaseModel):
    id: UUID
    article_id: UUID
    quantity: int

    class Config:
        from_attributes = True


class StockRequest(BaseModel):
    id: UUID
    request_number: str
    requester_id: UUID
    service: str
    priority: str
    reason: str
    status: RequestStatus
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[StockRequestItem] = []

    class Config:
        from_attributes = True
