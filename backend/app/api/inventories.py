import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.inventory import Inventory, InventoryStatus
from app.models.inventory_item import InventoryItem
from app.models.stock import Stock
from app.models.stock_movement import StockMovement, MovementType
from app.utils.deps import check_permission
from app.services.audit import write_audit
from app.services import notify_inventory_completed
from datetime import datetime

router = APIRouter()

class InventoryCreate(BaseModel):
    site_id: uuid.UUID
    warehouse_id: uuid.UUID
    responsible_id: uuid.UUID | None = None
    notes: str | None = None

class InventoryItemUpdate(BaseModel):
    physical_quantity: int = Field(ge=0)

class InventoryOut(BaseModel):
    id: uuid.UUID
    inventory_number: str
    site_id: uuid.UUID
    warehouse_id: uuid.UUID
    responsible_id: uuid.UUID
    status: InventoryStatus
    notes: str | None
    validated_by: uuid.UUID | None
    validated_at: datetime | None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

@router.get("", response_model=List[InventoryOut])
def list_inventories(
    skip: int = 0, limit: int = 25,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("INVENTORY_READ")),
):
    return db.query(Inventory).order_by(Inventory.created_at.desc()).offset(skip).limit(min(limit,100)).all()

@router.get("/{inventory_id}")
def get_inventory(
    inventory_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("INVENTORY_READ")),
):
    inv = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inv:
        raise HTTPException(404, "Inventory not found")
    return {
        "id": inv.id, "inventory_number": inv.inventory_number,
        "site_id": inv.site_id, "warehouse_id": inv.warehouse_id,
        "responsible_id": inv.responsible_id, "status": inv.status,
        "notes": inv.notes, "validated_by": inv.validated_by,
        "validated_at": inv.validated_at, "created_at": inv.created_at,
        "items": [
            {"id": i.id, "article_id": i.article_id,
             "theoretical_quantity": i.theoretical_quantity,
             "physical_quantity": i.physical_quantity,
             "difference": i.difference}
            for i in inv.items
        ],
    }

@router.post("", response_model=InventoryOut, status_code=status.HTTP_201_CREATED)
def create_inventory(
    data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("INVENTORY_CREATE")),
):
    number = f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"
    inv = Inventory(
        inventory_number=number,
        site_id=data.site_id,
        warehouse_id=data.warehouse_id,
        responsible_id=data.responsible_id or current_user.id,
        notes=data.notes,
        status=InventoryStatus.IN_PROGRESS,
    )
    db.add(inv)
    db.flush()

    # Snapshot stock belonging to the selected warehouse through location -> zone -> warehouse.
    from app.models.location import Location
    from app.models.zone import Zone
    rows = (
        db.query(Stock)
        .join(Location, Location.id == Stock.location_id)
        .join(Zone, Zone.id == Location.zone_id)
        .filter(Zone.warehouse_id == data.warehouse_id)
        .all()
    )
    for row in rows:
        db.add(InventoryItem(
            inventory_id=inv.id,
            article_id=row.article_id,
            theoretical_quantity=row.quantity,
            physical_quantity=row.quantity,
            difference=0,
        ))
    write_audit(db, user_id=current_user.id, action="CREATE_INVENTORY", entity="Inventory", entity_id=inv.id)
    db.commit()
    db.refresh(inv)
    return inv

@router.patch("/{inventory_id}/items/{item_id}")
def update_inventory_item(
    inventory_id: uuid.UUID, item_id: uuid.UUID, data: InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("INVENTORY_CREATE")),
):
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id, InventoryItem.inventory_id == inventory_id
    ).first()
    inv = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not item or not inv:
        raise HTTPException(404, "Inventory or item not found")
    if inv.status in [InventoryStatus.VALIDATED, InventoryStatus.CANCELLED]:
        raise HTTPException(400, "Inventory is closed")
    item.physical_quantity = data.physical_quantity
    item.difference = data.physical_quantity - item.theoretical_quantity
    db.commit()
    db.refresh(item)
    return item

@router.post("/{inventory_id}/validate", response_model=InventoryOut)
def validate_inventory(
    inventory_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("INVENTORY_VALIDATE")),
):
    inv = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inv:
        raise HTTPException(404, "Inventory not found")
    if inv.status == InventoryStatus.VALIDATED:
        raise HTTPException(400, "Inventory already validated")
    if inv.status != InventoryStatus.IN_PROGRESS:
        raise HTTPException(400, "Inventory must be in progress to validate")

    try:
        from app.models.location import Location
        from app.models.zone import Zone
        from app.models.article import Article
        
        for item in inv.items:
            if item.difference == 0:
                continue
            
            # Find stocks for this article in the warehouse
            stocks = (
                db.query(Stock)
                .join(Location, Location.id == Stock.location_id)
                .join(Zone, Zone.id == Location.zone_id)
                .filter(Zone.warehouse_id == inv.warehouse_id, Stock.article_id == item.article_id)
                .all()
            )
            
            if not stocks:
                # No stock exists for this article - create it if difference is positive
                if item.difference > 0:
                    # Find a location in this warehouse
                    location = (
                        db.query(Location)
                        .join(Zone, Zone.id == Location.zone_id)
                        .filter(Zone.warehouse_id == inv.warehouse_id)
                        .first()
                    )
                    if location:
                        new_stock = Stock(
                            article_id=item.article_id,
                            location_id=location.id,
                            quantity=item.difference
                        )
                        db.add(new_stock)
                        
                        # Create adjustment movement
                        movement_number = f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"
                        db.add(StockMovement(
                            movement_number=movement_number,
                            article_id=item.article_id,
                            quantity=item.difference,
                            movement_type=MovementType.INVENTORY_ADJUSTMENT,
                            user_id=current_user.id,
                            location_id=location.id,
                            warehouse_id=inv.warehouse_id,
                            site_id=inv.site_id,
                            reason=f"Inventory {inv.inventory_number} - new stock",
                        ))
                continue
            
            # Apply difference to stocks (distribute proportionally or to first location)
            remaining = item.difference
            for stock in stocks:
                if remaining == 0:
                    break
                
                old_quantity = stock.quantity
                # Apply the adjustment to this stock
                stock.quantity = max(0, stock.quantity + remaining)
                actual_adjustment = stock.quantity - old_quantity
                remaining -= actual_adjustment
                
                # Create adjustment movement
                movement_number = f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}"
                db.add(StockMovement(
                    movement_number=movement_number,
                    article_id=item.article_id,
                    quantity=actual_adjustment,
                    movement_type=MovementType.INVENTORY_ADJUSTMENT,
                    user_id=current_user.id,
                    location_id=stock.location_id,
                    warehouse_id=inv.warehouse_id,
                    site_id=inv.site_id,
                    reason=f"Inventory {inv.inventory_number}",
                ))
                
                # Audit logging for each stock adjustment
                write_audit(
                    db,
                    user_id=current_user.id,
                    action="INVENTORY_ADJUSTMENT",
                    entity="Stock",
                    entity_id=stock.id,
                    old_values={"quantity": old_quantity},
                    new_values={"quantity": stock.quantity},
                    details=f"Inventory {inv.inventory_number} adjustment for article {item.article_id}",
                )
        
        inv.status = InventoryStatus.VALIDATED
        inv.validated_by = current_user.id
        inv.validated_at = datetime.utcnow()
        write_audit(db, user_id=current_user.id, action="VALIDATE_INVENTORY", entity="Inventory", entity_id=inv.id)
        
        # Notify responsible user about inventory completion
        if inv.responsible_id:
            notify_inventory_completed(db, inv.responsible_id, inv.inventory_number)
        
        db.commit()
        db.refresh(inv)
        return inv
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error validating inventory: {str(e)}")
