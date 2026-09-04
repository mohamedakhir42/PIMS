from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from app.models.inventory import InventoryStatus


class InventoryItemCreate(BaseModel):
    article_id: UUID
    theoretical_quantity: int
    physical_quantity: int


class InventoryItemUpdate(BaseModel):
    physical_quantity: int


class InventoryCreate(BaseModel):
    site_id: UUID
    warehouse_id: UUID
    notes: Optional[str] = None


class InventoryUpdate(BaseModel):
    notes: Optional[str] = None


class InventoryItem(BaseModel):
    id: UUID
    inventory_id: UUID
    article_id: UUID
    theoretical_quantity: int
    physical_quantity: int
    variance: int

    class Config:
        from_attributes = True


class Inventory(BaseModel):
    id: UUID
    inventory_number: str
    site_id: UUID
    warehouse_id: UUID
    status: InventoryStatus
    notes: Optional[str] = None
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    validated_at: Optional[datetime] = None
    validated_by: Optional[UUID] = None
    items: List[InventoryItem] = []

    class Config:
        from_attributes = True
