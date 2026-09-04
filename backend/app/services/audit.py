from typing import Optional
import json
import uuid

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def write_audit(
    db: Session,
    *,
    user_id,
    action: str,
    entity: str,
    entity_id: Optional[str] = None,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None,
    ip_address: Optional[str] = None,
    details: Optional[str] = None,
) -> AuditLog:

    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity,
        entity_id=uuid.UUID(str(entity_id)) if entity_id else None,
        old_values=json.dumps(old_values) if old_values else None,
        new_values=json.dumps(new_values) if new_values else None,
        ip_address=ip_address,
        additional_info=details,
    )

    db.add(log)

    return log
