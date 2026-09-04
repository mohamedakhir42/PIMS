from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.database import get_db
from app.models.supplier import Supplier as SupplierModel
from app.schemas.supplier import SupplierCreate, SupplierUpdate, Supplier
from app.utils.deps import check_permission
from app.models.user import User


router = APIRouter()


@router.get("", response_model=List[Supplier])
def get_suppliers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("SUPPLIERS_READ"))
):
    suppliers = (
        db.query(SupplierModel)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return suppliers


@router.get("/{supplier_id}", response_model=Supplier)
def get_supplier(
    supplier_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("SUPPLIERS_READ"))
):
    supplier = (
        db.query(SupplierModel)
        .filter(SupplierModel.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return supplier


@router.post(
    "/",
    response_model=Supplier,
    status_code=status.HTTP_201_CREATED
)
def create_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("SUPPLIERS_CREATE"))
):
    # Check if code already exists
    existing = (
        db.query(SupplierModel)
        .filter(SupplierModel.code == supplier.code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Supplier code already exists"
        )

    db_supplier = SupplierModel(**supplier.dict())

    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)

    return db_supplier


@router.patch("/{supplier_id}", response_model=Supplier)
def update_supplier(
    supplier_id: uuid.UUID,
    supplier: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("SUPPLIERS_UPDATE"))
):
    db_supplier = (
        db.query(SupplierModel)
        .filter(SupplierModel.id == supplier_id)
        .first()
    )

    if not db_supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    update_data = supplier.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_supplier, field, value)

    db.commit()
    db.refresh(db_supplier)

    return db_supplier