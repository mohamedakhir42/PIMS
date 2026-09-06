from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.database import get_db
from app.models.location import Location as LocationModel
from app.schemas.location import LocationCreate, LocationUpdate, Location
from app.utils.deps import check_permission
from app.models.user import User
from app.services.audit import write_audit


router = APIRouter()


@router.get("", response_model=List[Location])
def get_locations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("LOCATIONS_READ"))
):
    locations = (
        db.query(LocationModel)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return locations


@router.get("/{location_id}", response_model=Location)
def get_location(
    location_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("LOCATIONS_READ"))
):
    location = (
        db.query(LocationModel)
        .filter(LocationModel.id == location_id)
        .first()
    )

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    return location


@router.post(
    "",
    response_model=Location,
    status_code=status.HTTP_201_CREATED
)
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("LOCATIONS_CREATE"))
):
    existing = (
        db.query(LocationModel)
        .filter(LocationModel.code == location.code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Location code already exists"
        )

    db_location = LocationModel(**location.dict())

    db.add(db_location)
    db.flush()

    write_audit(
        db,
        user_id=current_user.id,
        action="CREATE_LOCATION",
        entity="Location",
        entity_id=db_location.id,
        new_values={"code": db_location.code, "name": db_location.name},
    )

    db.commit()
    db.refresh(db_location)

    return db_location


@router.patch("/{location_id}", response_model=Location)
def update_location(
    location_id: uuid.UUID,
    location: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("LOCATIONS_UPDATE"))
):
    db_location = (
        db.query(LocationModel)
        .filter(LocationModel.id == location_id)
        .first()
    )

    if not db_location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    update_data = location.dict(exclude_unset=True)
    old_values = {field: getattr(db_location, field) for field in update_data.keys()}

    for field, value in update_data.items():
        setattr(db_location, field, value)

    write_audit(
        db,
        user_id=current_user.id,
        action="UPDATE_LOCATION",
        entity="Location",
        entity_id=db_location.id,
        old_values=old_values,
        new_values=update_data,
    )

    db.commit()
    db.refresh(db_location)

    return db_location
