from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class AuditLog(BaseModel):
    id: UUID
    user_id: UUID
    action: str
    entity: str
    entity_id: Optional[UUID] = None
    old_values: Optional[dict] = None
    new_values: Optional[dict] = None
    ip_address: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
