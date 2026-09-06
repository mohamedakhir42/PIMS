from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.database import get_db
from app.models.warehouse import Warehouse as WarehouseModel
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, Warehouse
from app.utils.deps import check_permission
from app.models.user import User
from app.services.audit import write_audit


router = APIRouter()


@router.get("", response_model=List[Warehouse])
def get_warehouses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("WAREHOUSES_READ"))
):
    warehouses = (
        db.query(WarehouseModel)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return warehouses


@router.get("/{warehouse_id}", response_model=Warehouse)
def get_warehouse(
    warehouse_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("WAREHOUSES_READ"))
):
    warehouse = (
        db.query(WarehouseModel)
        .filter(WarehouseModel.id == warehouse_id)
        .first()
    )

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    return warehouse


@router.post(
    "",
    response_model=Warehouse,
    status_code=status.HTTP_201_CREATED
)
def create_warehouse(
    warehouse: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("WAREHOUSES_CREATE"))
):
    existing = (
        db.query(WarehouseModel)
        .filter(WarehouseModel.code == warehouse.code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Warehouse code already exists"
        )

    db_warehouse = WarehouseModel(**warehouse.dict())

    db.add(db_warehouse)
    db.flush()

    write_audit(
        db,
        user_id=current_user.id,
        action="CREATE_WAREHOUSE",
        entity="Warehouse",
        entity_id=db_warehouse.id,
        new_values={"code": db_warehouse.code, "name": db_warehouse.name},
    )

    db.commit()
    db.refresh(db_warehouse)

    return db_warehouse


@router.patch("/{warehouse_id}", response_model=Warehouse)
def update_warehouse(
    warehouse_id: uuid.UUID,
    warehouse: WarehouseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("WAREHOUSES_UPDATE"))
):
    db_warehouse = (
        db.query(WarehouseModel)
        .filter(WarehouseModel.id == warehouse_id)
        .first()
    )

    if not db_warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    update_data = warehouse.dict(exclude_unset=True)
    old_values = {field: getattr(db_warehouse, field) for field in update_data.keys()}

    for field, value in update_data.items():
        setattr(db_warehouse, field, value)

    write_audit(
        db,
        user_id=current_user.id,
        action="UPDATE_WAREHOUSE",
        entity="Warehouse",
        entity_id=db_warehouse.id,
        old_values=old_values,
        new_values=update_data,
    )

    db.commit()
    db.refresh(db_warehouse)

    return db_warehouse
