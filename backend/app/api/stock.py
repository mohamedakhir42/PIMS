from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.stock import Stock as StockModel
from app.models.article import Article
from app.models.stock_movement import (
    StockMovement as StockMovementModel,
    MovementType,
)
from app.schemas.stock import (
    StockMovementCreate,
    Stock,
    StockMovement,
)
from app.utils.deps import check_permission
from app.models.user import User

import uuid
from datetime import datetime


router = APIRouter()


# ============================================================
# GET STOCK
# ============================================================

@router.get("", response_model=List[Stock])
def get_stock(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_READ")),
):
    stock = (
        db.query(StockModel)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return stock


# ============================================================
# GET CRITICAL STOCK
# ============================================================

@router.get("/critical", response_model=List[Stock])
def get_critical_stock(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_READ")),
):
    """
    Retourne les stocks dont la quantité est :
    - <= 0
    - ou inférieure au stock minimum de l'article
    """

    critical_stock = (
        db.query(StockModel)
        .join(Article)
        .filter(
            (StockModel.quantity <= 0)
            | (StockModel.quantity < Article.stock_min)
        )
        .all()
    )

    return critical_stock


# ============================================================
# GET STOCK MOVEMENTS
# ============================================================

@router.get("/movements", response_model=List[StockMovement])
def get_movements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_READ")),
):
    """
    Retourne la liste des mouvements de stock.
    """

    movements = (
        db.query(StockMovementModel)
        .order_by(StockMovementModel.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return movements


# ============================================================
# CREATE RECEIPT
# ============================================================

@router.post(
    "/receipt",
    response_model=StockMovement,
    status_code=status.HTTP_201_CREATED,
)
def create_receipt(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_RECEIVE")),
):
    """
    Réception de marchandises.

    Augmente la quantité disponible dans le stock.
    """

    if movement.movement_type != MovementType.RECEIPT:
        raise HTTPException(
            status_code=400,
            detail="Movement type must be RECEIPT",
        )

    movement_number = (
        f"REC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )

    # IMPORTANT :
    # StockMovementModel = modèle SQLAlchemy
    # StockMovement = schema Pydantic
    db_movement = StockMovementModel(
        movement_number=movement_number,
        user_id=current_user.id,
        **movement.dict(),
    )

    db.add(db_movement)

    stock = (
        db.query(StockModel)
        .filter(
            StockModel.article_id == movement.article_id,
            StockModel.location_id == movement.location_id,
        )
        .first()
    )

    if stock:
        stock.quantity += movement.quantity
    else:
        stock = StockModel(
            article_id=movement.article_id,
            location_id=movement.location_id,
            quantity=movement.quantity,
        )

        db.add(stock)

    db.commit()
    db.refresh(db_movement)

    return db_movement


# ============================================================
# CREATE ISSUE
# ============================================================

@router.post(
    "/issue",
    response_model=StockMovement,
    status_code=status.HTTP_201_CREATED,
)
def create_issue(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_ISSUE")),
):
    """
    Sortie de marchandises.

    Diminue la quantité disponible dans le stock.
    """

    if movement.movement_type != MovementType.ISSUE:
        raise HTTPException(
            status_code=400,
            detail="Movement type must be ISSUE",
        )

    stock = (
        db.query(StockModel)
        .filter(
            StockModel.article_id == movement.article_id,
            StockModel.location_id == movement.location_id,
        )
        .first()
    )

    if not stock or stock.quantity < movement.quantity:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient stock. "
                f"Available: {stock.quantity if stock else 0}, "
                f"Requested: {movement.quantity}"
            ),
        )

    movement_number = (
        f"ISS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )

    db_movement = StockMovementModel(
        movement_number=movement_number,
        user_id=current_user.id,
        **movement.dict(),
    )

    db.add(db_movement)

    stock.quantity -= movement.quantity

    db.commit()
    db.refresh(db_movement)

    return db_movement


# ============================================================
# CREATE TRANSFER
# ============================================================

@router.post(
    "/transfer",
    response_model=StockMovement,
    status_code=status.HTTP_201_CREATED,
)
def create_transfer(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_TRANSFER")),
):
    """
    Transfert de stock d'un emplacement vers un autre.
    """

    if movement.movement_type != MovementType.TRANSFER:
        raise HTTPException(
            status_code=400,
            detail="Movement type must be TRANSFER",
        )

    if (
        not movement.source_location_id
        or not movement.destination_location_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Source and destination locations required for transfer",
        )

    # Vérifier le stock source
    source_stock = (
        db.query(StockModel)
        .filter(
            StockModel.article_id == movement.article_id,
            StockModel.location_id == movement.source_location_id,
        )
        .first()
    )

    if not source_stock or source_stock.quantity < movement.quantity:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient stock at source. "
                f"Available: {source_stock.quantity if source_stock else 0}, "
                f"Requested: {movement.quantity}"
            ),
        )

    movement_number = (
        f"TRF-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )

    db_movement = StockMovementModel(
        movement_number=movement_number,
        user_id=current_user.id,
        **movement.dict(),
    )

    db.add(db_movement)

    # Diminuer le stock source
    source_stock.quantity -= movement.quantity

    # Vérifier le stock destination
    dest_stock = (
        db.query(StockModel)
        .filter(
            StockModel.article_id == movement.article_id,
            StockModel.location_id == movement.destination_location_id,
        )
        .first()
    )

    if dest_stock:
        dest_stock.quantity += movement.quantity
    else:
        dest_stock = StockModel(
            article_id=movement.article_id,
            location_id=movement.destination_location_id,
            quantity=movement.quantity,
        )

        db.add(dest_stock)

    db.commit()
    db.refresh(db_movement)

    return db_movement


# ============================================================
# CREATE ADJUSTMENT
# ============================================================

@router.post(
    "/adjustment",
    response_model=StockMovement,
    status_code=status.HTTP_201_CREATED,
)
def create_adjustment(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_ADJUST")),
):
    """
    Ajustement manuel du stock.
    """

    if movement.movement_type != MovementType.ADJUSTMENT:
        raise HTTPException(
            status_code=400,
            detail="Movement type must be ADJUSTMENT",
        )

    movement_number = (
        f"ADJ-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )

    db_movement = StockMovementModel(
        movement_number=movement_number,
        user_id=current_user.id,
        **movement.dict(),
    )

    db.add(db_movement)

    stock = (
        db.query(StockModel)
        .filter(
            StockModel.article_id == movement.article_id,
            StockModel.location_id == movement.location_id,
        )
        .first()
    )

    if stock:
        stock.quantity += movement.quantity
    else:
        stock = StockModel(
            article_id=movement.article_id,
            location_id=movement.location_id,
            quantity=movement.quantity,
        )

        db.add(stock)

    db.commit()
    db.refresh(db_movement)

    return db_movement