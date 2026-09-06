from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.article import Article as ArticleModel
from app.schemas.article import ArticleCreate, ArticleUpdate, Article
from app.utils.deps import check_permission
from app.models.user import User
from app.services.audit import write_audit

import uuid


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
    "/",
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