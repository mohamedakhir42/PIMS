from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.site import SiteStatus


class SiteBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    status: SiteStatus = SiteStatus.ACTIVE


class SiteCreate(SiteBase):
    pass


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    status: Optional[SiteStatus] = None


class SiteInDB(SiteBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Site(SiteInDB):
    pass
