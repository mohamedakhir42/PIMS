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
from app.services import notify_stock_critical
from app.services.audit import write_audit

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
# VALIDATE MOVEMENT
# ============================================================

@router.post("/validate")
def validate_movement(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_READ")),
):
    """
    Validate if a stock movement can be performed.
    Returns information about current stock and whether the movement is valid.
    """
    
    # Get current stock for the article and location
    current_stock = (
        db.query(StockModel)
        .filter(
            StockModel.article_id == movement.article_id,
            StockModel.location_id == movement.location_id,
        )
        .first()
    )
    
    current_quantity = current_stock.quantity if current_stock else 0
    
    # Get article stock_min for validation
    article = db.query(Article).filter(Article.id == movement.article_id).first()
    stock_min = article.stock_min if article else 0
    
    # Validate based on movement type
    validation_result = {
        "valid": True,
        "current_quantity": current_quantity,
        "movement_quantity": movement.quantity,
        "movement_type": movement.movement_type,
        "stock_min": stock_min,
        "message": "Movement is valid",
    }
    
    if movement.movement_type in [MovementType.ISSUE, MovementType.TRANSFER]:
        # Check if movement would make stock negative
        if current_quantity < movement.quantity:
            validation_result["valid"] = False
            validation_result["message"] = f"Insufficient stock. Current: {current_quantity}, Required: {movement.quantity}"
            validation_result["shortage"] = movement.quantity - current_quantity
        
        # Check if movement would make stock below minimum
        elif current_quantity - movement.quantity < stock_min:
            validation_result["warning"] = True
            validation_result["message"] = f"Stock will be below minimum after movement. New quantity: {current_quantity - movement.quantity}, Minimum: {stock_min}"
    
    elif movement.movement_type == MovementType.RECEIPT:
        # Receipts are always valid
        validation_result["message"] = f"Stock will increase from {current_quantity} to {current_quantity + movement.quantity}"
    
    elif movement.movement_type == MovementType.RETURN:
        # Returns increase stock
        validation_result["message"] = f"Stock will increase from {current_quantity} to {current_quantity + movement.quantity}"
    
    elif movement.movement_type in [MovementType.ADJUSTMENT, MovementType.INVENTORY_ADJUSTMENT]:
        # Adjustments can go negative with proper permissions
        if current_quantity + movement.quantity < 0:
            validation_result["warning"] = True
            validation_result["message"] = f"Adjustment will result in negative stock: {current_quantity + movement.quantity}"
    
    return validation_result


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

    try:
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
            old_quantity = stock.quantity
            stock.quantity += movement.quantity
        else:
            old_quantity = 0
            stock = StockModel(
                article_id=movement.article_id,
                location_id=movement.location_id,
                quantity=movement.quantity,
            )

            db.add(stock)

        # Audit logging
        write_audit(
            db,
            user_id=current_user.id,
            action="STOCK_RECEIPT",
            entity="Stock",
            entity_id=stock.id,
            old_values={"quantity": old_quantity},
            new_values={"quantity": stock.quantity},
            details=f"Receipt of {movement.quantity} units for article {movement.article_id}",
        )

        db.commit()
        db.refresh(db_movement)

        # Check for critical stock after receipt (unlikely but possible if stock was negative)
        article = db.query(Article).filter(Article.id == movement.article_id).first()
        if article and stock.quantity <= article.stock_min:
            notify_stock_critical(db, current_user.id, movement.article_id, stock.quantity, article.stock_min)

        return db_movement
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating receipt: {str(e)}"
        )


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

    try:
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

        old_quantity = stock.quantity
        stock.quantity -= movement.quantity

        # Audit logging
        write_audit(
            db,
            user_id=current_user.id,
            action="STOCK_ISSUE",
            entity="Stock",
            entity_id=stock.id,
            old_values={"quantity": old_quantity},
            new_values={"quantity": stock.quantity},
            details=f"Issue of {movement.quantity} units for article {movement.article_id}",
        )

        db.commit()
        db.refresh(db_movement)

        # Check for critical stock after issue
        article = db.query(Article).filter(Article.id == movement.article_id).first()
        if article and stock.quantity <= article.stock_min:
            notify_stock_critical(db, current_user.id, movement.article_id, stock.quantity, article.stock_min)

        return db_movement
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating issue: {str(e)}"
        )


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
    
    NOTE: Pour le MVP, le transfert est implémenté comme une opération atomique
    instantanée. Le cahier des charges décrit un workflow plus complexe avec
    états REQUESTED/APPROVED/IN_TRANSIT/RECEIVED/CANCELLED, mais cette complexité
    est reportée à une version future pour garantir la stabilité du MVP actuel.
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

    try:
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
        old_source_quantity = source_stock.quantity
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

        old_dest_quantity = dest_stock.quantity if dest_stock else 0
        if dest_stock:
            dest_stock.quantity += movement.quantity
        else:
            dest_stock = StockModel(
                article_id=movement.article_id,
                location_id=movement.destination_location_id,
                quantity=movement.quantity,
            )
            db.add(dest_stock)

        # Audit logging
        write_audit(
            db,
            user_id=current_user.id,
            action="STOCK_TRANSFER",
            entity="Stock",
            entity_id=source_stock.id,
            old_values={"source_quantity": old_source_quantity, "dest_quantity": old_dest_quantity},
            new_values={"source_quantity": source_stock.quantity, "dest_quantity": dest_stock.quantity},
            details=f"Transfer of {movement.quantity} units from {movement.source_location_id} to {movement.destination_location_id}",
        )

        db.commit()
        db.refresh(db_movement)

        return db_movement

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error during transfer: {str(e)}"
        )


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

    try:
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
            old_quantity = stock.quantity
            stock.quantity += movement.quantity
        else:
            old_quantity = 0
            stock = StockModel(
                article_id=movement.article_id,
                location_id=movement.location_id,
                quantity=movement.quantity,
            )

            db.add(stock)

        # Audit logging
        write_audit(
            db,
            user_id=current_user.id,
            action="STOCK_ADJUSTMENT",
            entity="Stock",
            entity_id=stock.id,
            old_values={"quantity": old_quantity},
            new_values={"quantity": stock.quantity},
            details=f"Adjustment of {movement.quantity} units for article {movement.article_id}",
        )

        db.commit()
        db.refresh(db_movement)

        # Check for critical stock after adjustment
        article = db.query(Article).filter(Article.id == movement.article_id).first()
        if article and stock.quantity <= article.stock_min:
            notify_stock_critical(db, current_user.id, movement.article_id, stock.quantity, article.stock_min)

        return db_movement
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating adjustment: {str(e)}"
        )


# ============================================================
# CREATE RETURN
# ============================================================

@router.post(
    "/return",
    response_model=StockMovement,
    status_code=status.HTTP_201_CREATED,
)
def create_return(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_RETURN")),
):
    """
    Retour de marchandises (retour au stock après sortie).
    
    Augmente la quantité disponible dans le stock.
    """

    if movement.movement_type != MovementType.RETURN:
        raise HTTPException(
            status_code=400,
            detail="Movement type must be RETURN",
        )

    movement_number = (
        f"RET-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )

    try:
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
            old_quantity = stock.quantity
            stock.quantity += movement.quantity
        else:
            old_quantity = 0
            stock = StockModel(
                article_id=movement.article_id,
                location_id=movement.location_id,
                quantity=movement.quantity,
            )

            db.add(stock)

        # Audit logging
        write_audit(
            db,
            user_id=current_user.id,
            action="STOCK_RETURN",
            entity="Stock",
            entity_id=stock.id,
            old_values={"quantity": old_quantity},
            new_values={"quantity": stock.quantity},
            details=f"Return of {movement.quantity} units for article {movement.article_id}",
        )

        db.commit()
        db.refresh(db_movement)

        # Check for critical stock after return (unlikely but possible if stock was negative)
        article = db.query(Article).filter(Article.id == movement.article_id).first()
        if article and stock.quantity <= article.stock_min:
            notify_stock_critical(db, current_user.id, movement.article_id, stock.quantity, article.stock_min)

        return db_movement
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating return: {str(e)}"
        )