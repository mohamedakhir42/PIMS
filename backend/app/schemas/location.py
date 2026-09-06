from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.location import LocationStatus


class LocationBase(BaseModel):
    code: str
    name: str
    zone_id: UUID
    capacity: Optional[int] = None
    description: Optional[str] = None
    status: LocationStatus = LocationStatus.ACTIVE


class LocationCreate(LocationBase):
    pass


class LocationUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    status: Optional[LocationStatus] = None


class LocationInDB(LocationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Location(LocationInDB):
    pass
