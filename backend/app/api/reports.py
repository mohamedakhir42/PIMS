from datetime import datetime, timedelta
from typing import Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.article import Article
from app.models.category import Category
from app.models.stock import Stock
from app.models.stock_movement import StockMovement, MovementType
from app.models.stock_request import StockRequest, RequestStatus
from app.utils.deps import check_permission

router = APIRouter()

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REPORT_READ")),
):
    total_articles = db.query(func.count(Article.id)).filter(Article.status == "ACTIVE").scalar() or 0
    total_stock = db.query(func.coalesce(func.sum(Stock.quantity), 0)).scalar() or 0
    critical = db.query(func.count(Stock.id)).filter(Stock.quantity <= 0).scalar() or 0
    low = (
        db.query(func.count(Stock.id))
        .join(Article, Article.id == Stock.article_id)
        .filter(Stock.quantity > 0, Stock.quantity < Article.stock_min)
        .scalar() or 0
    )
    pending = db.query(func.count(StockRequest.id)).filter(
        StockRequest.status.in_([RequestStatus.SUBMITTED, RequestStatus.PENDING_APPROVAL])
    ).scalar() or 0

    today = datetime.utcnow().date()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)
    counts = {}
    for movement_type in MovementType:
        counts[movement_type.value] = db.query(func.count(StockMovement.id)).filter(
            StockMovement.movement_type == movement_type,
            StockMovement.created_at >= start,
            StockMovement.created_at < end,
        ).scalar() or 0

    recent = db.query(StockMovement).order_by(StockMovement.created_at.desc()).limit(10).all()
    critical_rows = (
        db.query(Stock, Article)
        .join(Article, Article.id == Stock.article_id)
        .filter(Stock.quantity <= Article.stock_min)
        .order_by(Stock.quantity.asc()).limit(10).all()
    )
    return {
        "kpis": {
            "total_articles": total_articles,
            "total_stock": total_stock,
            "critical_stock": critical,
            "low_stock": low,
            "pending_requests": pending,
            "today_receipts": counts.get("RECEIPT", 0),
            "today_issues": counts.get("ISSUE", 0),
            "today_transfers": counts.get("TRANSFER", 0),
        },
        "movements_today": counts,
        "critical": [
            {"article_id": s.article_id, "quantity": s.quantity, "minimum_stock": a.minimum_stock}
            for s,a in critical_rows
        ],
        "recent_activity": [
            {"id": m.id, "movement_number": m.movement_number,
             "movement_type": m.movement_type, "article_id": m.article_id,
             "quantity": m.quantity, "user_id": m.user_id,
             "created_at": m.created_at}
            for m in recent
        ],
    }

@router.get("/stock")
def stock_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REPORT_READ")),
):
    rows = (
        db.query(Stock, Article, Category)
        .join(Article, Article.id == Stock.article_id)
        .outerjoin(Category, Category.id == Article.category_id)
        .all()
    )
    return [
        {"article_id": s.article_id, "code": a.code, "name": a.designation,
         "category": c.name if c else None, "location_id": s.location_id,
         "quantity": s.quantity, "minimum_stock": a.minimum_stock,
         "status": "CRITICAL" if s.quantity <= 0 else ("LOW" if s.quantity < a.minimum_stock else "NORMAL")}
        for s,a,c in rows
    ]

@router.get("/movements")
def movements_report(
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    movement_type: MovementType | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REPORT_READ")),
):
    q = db.query(StockMovement)
    if date_from: q = q.filter(StockMovement.created_at >= date_from)
    if date_to: q = q.filter(StockMovement.created_at <= date_to)
    if movement_type: q = q.filter(StockMovement.movement_type == movement_type)
    return q.order_by(StockMovement.created_at.desc()).limit(500).all()

@router.get("/critical-stock")
def critical_stock(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REPORT_READ")),
):
    return dashboard(db, current_user)["critical"]

@router.get("/inventory")
def inventory_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REPORT_READ")),
):
    from app.models.inventory import Inventory
    return db.query(Inventory).order_by(Inventory.created_at.desc()).all()
