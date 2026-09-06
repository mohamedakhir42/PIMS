from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.database import get_db
from app.models.site import Site as SiteModel
from app.schemas.site import SiteCreate, SiteUpdate, Site
from app.utils.deps import check_permission
from app.models.user import User
from app.services.audit import write_audit


router = APIRouter()


@router.get("", response_model=List[Site])
def get_sites(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("SITES_READ"))
):
    sites = (
        db.query(SiteModel)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return sites


@router.get("/{site_id}", response_model=Site)
def get_site(
    site_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("SITES_READ"))
):
    site = (
        db.query(SiteModel)
        .filter(SiteModel.id == site_id)
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=404,
            detail="Site not found"
        )

    return site


@router.post(
    "",
    response_model=Site,
    status_code=status.HTTP_201_CREATED
)
def create_site(
    site: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("SITES_CREATE"))
):
    existing = (
        db.query(SiteModel)
        .filter(SiteModel.code == site.code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Site code already exists"
        )

    db_site = SiteModel(**site.dict())

    db.add(db_site)
    db.flush()

    write_audit(
        db,
        user_id=current_user.id,
        action="CREATE_SITE",
        entity="Site",
        entity_id=db_site.id,
        new_values={"code": db_site.code, "name": db_site.name},
    )

    db.commit()
    db.refresh(db_site)

    return db_site


@router.patch("/{site_id}", response_model=Site)
def update_site(
    site_id: uuid.UUID,
    site: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("SITES_UPDATE"))
):
    db_site = (
        db.query(SiteModel)
        .filter(SiteModel.id == site_id)
        .first()
    )

    if not db_site:
        raise HTTPException(
            status_code=404,
            detail="Site not found"
        )

    update_data = site.dict(exclude_unset=True)
    old_values = {field: getattr(db_site, field) for field in update_data.keys()}

    for field, value in update_data.items():
        setattr(db_site, field, value)

    write_audit(
        db,
        user_id=current_user.id,
        action="UPDATE_SITE",
        entity="Site",
        entity_id=db_site.id,
        old_values=old_values,
        new_values=update_data,
    )

    db.commit()
    db.refresh(db_site)

    return db_site
