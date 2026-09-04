from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    permission_ids: List[UUID] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[UUID]] = None

class RoleOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    class Config:
        from_attributes = True
