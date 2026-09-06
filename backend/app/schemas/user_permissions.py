from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional


class UserPermissionItem(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    assigned: bool


class UserPermissionsResponse(BaseModel):
    user_id: UUID
    permissions: List[UserPermissionItem]


class UserPermissionsUpdate(BaseModel):
    permission_ids: List[UUID]