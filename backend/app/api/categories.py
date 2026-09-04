from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.database import get_db
from app.models.category import Category as CategoryModel
from app.schemas.category import CategoryCreate, CategoryUpdate, Category
from app.utils.deps import check_permission
from app.models.user import User


router = APIRouter()


# GET /categories
@router.get("", response_model=List[Category])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("CATEGORIES_READ"))
):
    categories = (
        db.query(CategoryModel)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return categories


# GET /categories/{category_id}
@router.get("/{category_id}", response_model=Category)
def get_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("CATEGORIES_READ"))
):
    category = (
        db.query(CategoryModel)
        .filter(CategoryModel.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


# POST /categories
@router.post(
    "",
    response_model=Category,
    status_code=status.HTTP_201_CREATED
)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("CATEGORIES_CREATE"))
):
    # Vérifier si le code existe déjà
    existing = (
        db.query(CategoryModel)
        .filter(CategoryModel.code == category.code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category code already exists"
        )

    db_category = CategoryModel(**category.dict())

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category


# PATCH /categories/{category_id}
@router.patch("/{category_id}", response_model=Category)
def update_category(
    category_id: uuid.UUID,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("CATEGORIES_UPDATE"))
):
    db_category = (
        db.query(CategoryModel)
        .filter(CategoryModel.id == category_id)
        .first()
    )

    if not db_category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    update_data = category.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_category, field, value)

    db.commit()
    db.refresh(db_category)

    return db_category
