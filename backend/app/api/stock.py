from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.stock import Stock
from app.models.stock_movement import StockMovement, MovementType
from app.models.article import Article
from app.schemas.stock import StockMovementCreate, Stock, StockMovement
from app.utils.deps import get_current_user, check_permission
from app.models.user import User
import uuid
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=List[Stock])
def get_stock(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_READ"))
):
    stock = db.query(Stock).offset(skip).limit(limit).all()
    return stock


@router.get("/critical", response_model=List[Stock])
def get_critical_stock(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_READ"))
):
    # Get stock where quantity is 0 or below minimum
    critical_stock = db.query(Stock).join(Article).filter(
        (Stock.quantity <= 0) | (Stock.quantity < Article.stock_min)
    ).all()
    return critical_stock


@router.get("/movements", response_model=List[StockMovement])
def get_movements(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_READ"))
):
    movements = db.query(StockMovement).order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()
    return movements


@router.post("/receipt", response_model=StockMovement, status_code=status.HTTP_201_CREATED)
def create_receipt(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_RECEIVE"))
):
    if movement.movement_type != MovementType.RECEIPT:
        raise HTTPException(status_code=400, detail="Movement type must be RECEIPT")
    
    # Generate movement number
    movement_number = f"REC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Create movement
    db_movement = StockMovement(
        movement_number=movement_number,
        user_id=current_user.id,
        **movement.dict()
    )
    db.add(db_movement)
    
    # Update stock
    stock = db.query(Stock).filter(
        Stock.article_id == movement.article_id,
        Stock.location_id == movement.location_id
    ).first()
    
    if stock:
        stock.quantity += movement.quantity
    else:
        stock = Stock(
            article_id=movement.article_id,
            location_id=movement.location_id,
            quantity=movement.quantity
        )
        db.add(stock)
    
    db.commit()
    db.refresh(db_movement)
    return db_movement


@router.post("/issue", response_model=StockMovement, status_code=status.HTTP_201_CREATED)
def create_issue(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_ISSUE"))
):
    if movement.movement_type != MovementType.ISSUE:
        raise HTTPException(status_code=400, detail="Movement type must be ISSUE")
    
    # Check stock availability
    stock = db.query(Stock).filter(
        Stock.article_id == movement.article_id,
        Stock.location_id == movement.location_id
    ).first()
    
    if not stock or stock.quantity < movement.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {stock.quantity if stock else 0}, Requested: {movement.quantity}"
        )
    
    # Generate movement number
    movement_number = f"ISS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Create movement
    db_movement = StockMovement(
        movement_number=movement_number,
        user_id=current_user.id,
        **movement.dict()
    )
    db.add(db_movement)
    
    # Update stock
    stock.quantity -= movement.quantity
    
    db.commit()
    db.refresh(db_movement)
    return db_movement


@router.post("/transfer", response_model=StockMovement, status_code=status.HTTP_201_CREATED)
def create_transfer(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_TRANSFER"))
):
    if movement.movement_type != MovementType.TRANSFER:
        raise HTTPException(status_code=400, detail="Movement type must be TRANSFER")
    
    if not movement.source_location_id or not movement.destination_location_id:
        raise HTTPException(status_code=400, detail="Source and destination locations required for transfer")
    
    # Check stock availability at source
    source_stock = db.query(Stock).filter(
        Stock.article_id == movement.article_id,
        Stock.location_id == movement.source_location_id
    ).first()
    
    if not source_stock or source_stock.quantity < movement.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock at source. Available: {source_stock.quantity if source_stock else 0}, Requested: {movement.quantity}"
        )
    
    # Generate movement number
    movement_number = f"TRF-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Create movement
    db_movement = StockMovement(
        movement_number=movement_number,
        user_id=current_user.id,
        **movement.dict()
    )
    db.add(db_movement)
    
    # Update source stock
    source_stock.quantity -= movement.quantity
    
    # Update destination stock
    dest_stock = db.query(Stock).filter(
        Stock.article_id == movement.article_id,
        Stock.location_id == movement.destination_location_id
    ).first()
    
    if dest_stock:
        dest_stock.quantity += movement.quantity
    else:
        dest_stock = Stock(
            article_id=movement.article_id,
            location_id=movement.destination_location_id,
            quantity=movement.quantity
        )
        db.add(dest_stock)
    
    db.commit()
    db.refresh(db_movement)
    return db_movement


@router.post("/adjustment", response_model=StockMovement, status_code=status.HTTP_201_CREATED)
def create_adjustment(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_ADJUST"))
):
    if movement.movement_type != MovementType.ADJUSTMENT:
        raise HTTPException(status_code=400, detail="Movement type must be ADJUSTMENT")
    
    # Generate movement number
    movement_number = f"ADJ-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    
    # Create movement
    db_movement = StockMovement(
        movement_number=movement_number,
        user_id=current_user.id,
        **movement.dict()
    )
    db.add(db_movement)
    
    # Update stock
    stock = db.query(Stock).filter(
        Stock.article_id == movement.article_id,
        Stock.location_id == movement.location_id
    ).first()
    
    if stock:
        stock.quantity += movement.quantity
    else:
        stock = Stock(
            article_id=movement.article_id,
            location_id=movement.location_id,
            quantity=movement.quantity
        )
        db.add(stock)
    
    db.commit()
    db.refresh(db_movement)
    return db_movement
