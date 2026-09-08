from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import uuid
import os

from app.db.database import get_db
from app.models.article import Article as ArticleModel, ArticleStatus
from app.models.stock_movement import StockMovement
from app.schemas.article import ArticleCreate, ArticleUpdate, Article
from app.utils.deps import check_permission
from app.models.user import User
from app.services.audit import write_audit
from app.utils.files import validate_image_file, save_uploaded_file, delete_file

router = APIRouter()


@router.get("", response_model=List[Article])
def get_articles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ARTICLES_READ"))
):
    articles = (
        db.query(ArticleModel)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return articles


@router.get("/{article_id}", response_model=Article)
def get_article(
    article_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ARTICLES_READ"))
):
    article = (
        db.query(ArticleModel)
        .filter(ArticleModel.id == article_id)
        .first()
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    return article


@router.post(
    "",
    response_model=Article,
    status_code=status.HTTP_201_CREATED
)
def create_article(
    article: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ARTICLES_CREATE"))
):
    # Check if code already exists
    existing = (
        db.query(ArticleModel)
        .filter(ArticleModel.code == article.code)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Article code already exists"
        )

    db_article = ArticleModel(**article.dict())

    db.add(db_article)
    db.flush()

    # Audit logging
    write_audit(
        db,
        user_id=current_user.id,
        action="CREATE_ARTICLE",
        entity="Article",
        entity_id=db_article.id,
        new_values={"code": db_article.code, "designation": db_article.designation},
    )

    db.commit()
    db.refresh(db_article)

    return db_article


@router.patch(
    "/{article_id}",
    response_model=Article
)
def update_article(
    article_id: uuid.UUID,
    article: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ARTICLES_UPDATE"))
):
    db_article = (
        db.query(ArticleModel)
        .filter(ArticleModel.id == article_id)
        .first()
    )

    if not db_article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    update_data = article.dict(exclude_unset=True)
    old_values = {field: getattr(db_article, field) for field in update_data.keys()}

    for field, value in update_data.items():
        setattr(db_article, field, value)

    # Audit logging
    write_audit(
        db,
        user_id=current_user.id,
        action="UPDATE_ARTICLE",
        entity="Article",
        entity_id=db_article.id,
        old_values=old_values,
        new_values=update_data,
    )

    db.commit()
    db.refresh(db_article)

    return db_article


@router.delete("/{article_id}")
def delete_article(
    article_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ARTICLES_DISABLE"))
):
    db_article = (
        db.query(ArticleModel)
        .filter(ArticleModel.id == article_id)
        .first()
    )

    if not db_article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    # Check if article has movement history
    movement_count = (
        db.query(StockMovement)
        .filter(StockMovement.article_id == article_id)
        .count()
    )

    if movement_count > 0:
        # Article has history - disable instead of delete
        old_status = db_article.status
        db_article.status = ArticleStatus.INACTIVE
        
        # Audit logging
        write_audit(
            db,
            user_id=current_user.id,
            action="DISABLE_ARTICLE",
            entity="Article",
            entity_id=db_article.id,
            old_values={"status": old_status},
            new_values={"status": db_article.status},
        )
        
        db.commit()
        return {"message": "Article disabled (has movement history)"}
    else:
        # No history - can delete
        old_values = {"code": db_article.code, "designation": db_article.designation}
        
        # Audit logging before deletion
        write_audit(
            db,
            user_id=current_user.id,
            action="DELETE_ARTICLE",
            entity="Article",
            entity_id=db_article.id,
            old_values=old_values,
        )
        
        db.delete(db_article)
        db.commit()
        return {"message": "Article deleted"}


@router.post("/{article_id}/image", response_model=Article)
async def upload_article_image(
    article_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ARTICLES_UPDATE"))
):
    """Upload an image for an article."""
    # Validate article exists
    article = (
        db.query(ArticleModel)
        .filter(ArticleModel.id == article_id)
        .first()
    )
    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )
    
    # Validate file
    validate_image_file(file)
    
    # Delete old image if exists
    if article.image_url:
        delete_file(article.image_url, "uploads")
    
    # Save new file
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_url = save_uploaded_file(file, "uploads", unique_filename)
    
    # Update article
    old_image_url = article.image_url
    article.image_url = file_url
    
    # Audit logging
    write_audit(
        db,
        user_id=current_user.id,
        action="UPDATE_ARTICLE_IMAGE",
        entity="Article",
        entity_id=article.id,
        old_values={"image_url": old_image_url},
        new_values={"image_url": file_url},
    )
    
    db.commit()
    db.refresh(article)
    
    return article


@router.delete("/{article_id}/image", response_model=Article)
def delete_article_image(
    article_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ARTICLES_UPDATE"))
):
    """Delete the image from an article."""
    # Validate article exists
    article = (
        db.query(ArticleModel)
        .filter(ArticleModel.id == article_id)
        .first()
    )
    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )
    
    if not article.image_url:
        raise HTTPException(
            status_code=400,
            detail="Article has no image to delete"
        )
    
    # Delete physical file
    delete_file(article.image_url, "uploads")
    
    # Update article
    old_image_url = article.image_url
    article.image_url = None
    
    # Audit logging
    write_audit(
        db,
        user_id=current_user.id,
        action="DELETE_ARTICLE_IMAGE",
        entity="Article",
        entity_id=article.id,
        old_values={"image_url": old_image_url},
        new_values={"image_url": None},
    )
    
    db.commit()
    db.refresh(article)
    
    return article