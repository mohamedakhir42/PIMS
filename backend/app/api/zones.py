from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.database import get_db
from app.models.zone import Zone as ZoneModel
from app.schemas.zone import ZoneCreate, ZoneUpdate, Zone
from app.utils.deps import check_permission
from app.models.user import User
from app.services.audit import write_audit


router = APIRouter()


@router.get("", response_model=List[Zone])
def get_zones(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ZONES_READ"))
):
    zones = (
        db.query(ZoneModel)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return zones


@router.get("/{zone_id}", response_model=Zone)
def get_zone(
    zone_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ZONES_READ"))
):
    zone = (
        db.query(ZoneModel)
        .filter(ZoneModel.id == zone_id)
        .first()
    )

    if not zone:
        raise HTTPException(
            status_code=404,
            detail="Zone not found"
        )

    return zone


@router.post(
    "",
    response_model=Zone,
    status_code=status.HTTP_201_CREATED
)
def create_zone(
    zone: ZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ZONES_CREATE"))
):
    existing = (
        db.query(ZoneModel)
        .filter(ZoneModel.code == zone.code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Zone code already exists"
        )

    db_zone = ZoneModel(**zone.dict())

    db.add(db_zone)
    db.flush()

    write_audit(
        db,
        user_id=current_user.id,
        action="CREATE_ZONE",
        entity="Zone",
        entity_id=db_zone.id,
        new_values={"code": db_zone.code, "name": db_zone.name},
    )

    db.commit()
    db.refresh(db_zone)

    return db_zone


@router.patch("/{zone_id}", response_model=Zone)
def update_zone(
    zone_id: uuid.UUID,
    zone: ZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ZONES_UPDATE"))
):
    db_zone = (
        db.query(ZoneModel)
        .filter(ZoneModel.id == zone_id)
        .first()
    )

    if not db_zone:
        raise HTTPException(
            status_code=404,
            detail="Zone not found"
        )

    update_data = zone.dict(exclude_unset=True)
    old_values = {field: getattr(db_zone, field) for field in update_data.keys()}

    for field, value in update_data.items():
        setattr(db_zone, field, value)

    write_audit(
        db,
        user_id=current_user.id,
        action="UPDATE_ZONE",
        entity="Zone",
        entity_id=db_zone.id,
        old_values=old_values,
        new_values=update_data,
    )

    db.commit()
    db.refresh(db_zone)

    return db_zone
