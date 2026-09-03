from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.category import CategoryStatus


class CategoryBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    parent_id: Optional[UUID] = None
    status: CategoryStatus = CategoryStatus.ACTIVE


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[UUID] = None
    status: Optional[CategoryStatus] = None


class CategoryInDB(CategoryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Category(CategoryInDB):
    pass
