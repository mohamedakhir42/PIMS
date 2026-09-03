from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.stock_movement import MovementType


class StockMovementBase(BaseModel):
    article_id: UUID
    quantity: int
    movement_type: MovementType
    location_id: Optional[UUID] = None
    source_location_id: Optional[UUID] = None
    destination_location_id: Optional[UUID] = None
    reason: Optional[str] = None
    reference: Optional[str] = None
    comment: Optional[str] = None


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementInDB(StockMovementBase):
    id: UUID
    movement_number: str
    user_id: UUID
    site_id: Optional[UUID] = None
    warehouse_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StockMovement(StockMovementInDB):
    pass


class StockBase(BaseModel):
    article_id: UUID
    location_id: UUID
    quantity: int = 0


class StockCreate(StockBase):
    pass


class StockInDB(StockBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Stock(StockInDB):
    pass
