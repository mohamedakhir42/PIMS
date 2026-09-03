from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.supplier import SupplierStatus


class SupplierBase(BaseModel):
    code: str
    name: str
    ice: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    contact_person: Optional[str] = None
    status: SupplierStatus = SupplierStatus.ACTIVE


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    ice: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    contact_person: Optional[str] = None
    status: Optional[SupplierStatus] = None


class SupplierInDB(SupplierBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Supplier(SupplierInDB):
    pass
