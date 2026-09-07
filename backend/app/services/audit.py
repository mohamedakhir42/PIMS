from typing import Optional
import json
import uuid
from datetime import datetime, date

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def _json_safe(value):
    """
    Convertit les objets Python non sérialisables
    en valeurs compatibles avec JSON.
    """

    if isinstance(value, uuid.UUID):
        return str(value)

    if isinstance(value, (datetime, date)):
        return value.isoformat()

    if isinstance(value, dict):
        return {
            str(key): _json_safe(val)
            for key, val in value.items()
        }

    if isinstance(value, (list, tuple, set)):
        return [_json_safe(item) for item in value]

    return value


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

        old_values=(
            json.dumps(_json_safe(old_values))
            if old_values is not None
            else None
        ),

        new_values=(
            json.dumps(_json_safe(new_values))
            if new_values is not None
            else None
        ),

        ip_address=ip_address,
        additional_info=details,
    )

    db.add(log)

    return log