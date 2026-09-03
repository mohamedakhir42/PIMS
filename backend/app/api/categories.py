from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, Category
from app.utils.deps import get_current_user, check_permission
from app.models.user import User
import uuid

router = APIRouter()


@router.get("/", response_model=List[Category])
def get_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("CATEGORIES_READ"))
):
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories


@router.get("/{category_id}", response_model=Category)
def get_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("CATEGORIES_READ"))
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("CATEGORIES_CREATE"))
):
    # Check if code already exists
    existing = db.query(Category).filter(Category.code == category.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category code already exists")
    
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.patch("/{category_id}", response_model=Category)
def update_category(
    category_id: uuid.UUID,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("CATEGORIES_UPDATE"))
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category
