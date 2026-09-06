from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.zone import ZoneStatus


class ZoneBase(BaseModel):
    code: str
    name: str
    warehouse_id: UUID
    description: Optional[str] = None
    status: ZoneStatus = ZoneStatus.ACTIVE


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ZoneStatus] = None


class ZoneInDB(ZoneBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Zone(ZoneInDB):
    pass
