from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.warehouse import WarehouseStatus


class WarehouseBase(BaseModel):
    code: str
    name: str
    site_id: UUID
    manager: Optional[str] = None
    description: Optional[str] = None
    status: WarehouseStatus = WarehouseStatus.ACTIVE


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    manager: Optional[str] = None
    description: Optional[str] = None
    status: Optional[WarehouseStatus] = None


class WarehouseInDB(WarehouseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Warehouse(WarehouseInDB):
    pass
