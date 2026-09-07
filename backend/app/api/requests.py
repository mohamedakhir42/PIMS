from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.db.database import get_db

# SQLAlchemy models
from app.models.stock_request import (
    StockRequest as StockRequestModel,
    RequestStatus,
)
from app.models.stock_request_item import StockRequestItem
from app.models.article import Article
from app.models.user import User

# Pydantic schemas
from app.schemas.requests import (
    StockRequestCreate,
    StockRequestUpdate,
    StockRequest,
)

from app.utils.deps import check_permission
from app.services import notify_new_request, notify_request_approved, notify_request_rejected
from app.models.stock import Stock
from app.models.stock_movement import StockMovement, MovementType
from app.services.audit import write_audit


class RejectRequest(BaseModel):
    rejection_reason: str


router = APIRouter()


# ============================================================
# GET ALL REQUESTS
# ============================================================

@router.get("", response_model=List[StockRequest])
def get_requests(
    skip: int = 0,
    limit: int = 100,
    status_filter: RequestStatus = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REQUEST_READ")),
):
    query = db.query(StockRequestModel)

    if status_filter:
        query = query.filter(
            StockRequestModel.status == status_filter
        )

    requests = (
        query
        .order_by(StockRequestModel.created_at.desc())
        .offset(skip)
        .limit(min(limit, 100))
        .all()
    )

    return requests


# ============================================================
# GET ONE REQUEST
# ============================================================

@router.get("/{request_id}", response_model=StockRequest)
def get_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REQUEST_READ")),
):
    request = (
        db.query(StockRequestModel)
        .filter(StockRequestModel.id == request_id)
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    return request


# ============================================================
# CREATE REQUEST
# ============================================================

@router.post(
    "",
    response_model=StockRequest,
    status_code=status.HTTP_201_CREATED,
)
def create_request(
    request_data: StockRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REQUEST_CREATE")),
):
    # Generate request number
    request_number = (
        f"REQ-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    )

    # Create request
    db_request = StockRequestModel(
        request_number=request_number,
        requester_id=current_user.id,
        service=request_data.service,
        priority=request_data.priority,
        reason=request_data.reason,
        status=RequestStatus.DRAFT,
    )

    db.add(db_request)
    db.flush()

    # Create request items
    for item_data in request_data.items:

        # Verify article exists
        article = (
            db.query(Article)
            .filter(Article.id == item_data.article_id)
            .first()
        )

        if not article:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Article {item_data.article_id} not found",
            )

        item = StockRequestItem(
            request_id=db_request.id,
            article_id=item_data.article_id,
            quantity=item_data.quantity,
        )

        db.add(item)

    db.commit()
    db.refresh(db_request)

    # Notify approvers about new request
    from app.models.role import Role
    from app.models.user_permission import UserPermission
    from app.models.permission import Permission
    from app.models.role_permission import RolePermission
    
    # Find users with REQUEST_APPROVE permission (via role or direct)
    approvers_query = db.query(User).distinct()
    
    # Users with role having REQUEST_APPROVE permission
    role_approvers = approvers_query.join(Role).join(RolePermission).join(Permission).filter(
        Permission.name == "REQUEST_APPROVE"
    ).all()
    
    # Users with direct REQUEST_APPROVE permission
    direct_approvers = db.query(User).join(UserPermission).join(Permission).filter(
        Permission.name == "REQUEST_APPROVE"
    ).all()
    
    # Combine and deduplicate
    approvers = list({u.id: u for u in role_approvers + direct_approvers}.values())
    
    for approver in approvers:
        notify_new_request(db, approver.id, db_request.request_number)
    
    db.commit()

    return db_request


# ============================================================
# SUBMIT REQUEST
# ============================================================

@router.post(
    "/{request_id}/submit",
    response_model=StockRequest,
)
def submit_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REQUEST_CREATE")),
):
    db_request = (
        db.query(StockRequestModel)
        .filter(StockRequestModel.id == request_id)
        .first()
    )

    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    if db_request.status != RequestStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft requests can be submitted",
        )

    db_request.status = RequestStatus.SUBMITTED
    db.commit()
    db.refresh(db_request)

    # Auto-transition to PENDING_APPROVAL for maintenance manager review
    db_request.status = RequestStatus.PENDING_APPROVAL
    db.commit()
    db.refresh(db_request)

    # Notify approvers about new request
    from app.models.role import Role
    from app.models.user_permission import UserPermission
    from app.models.permission import Permission
    from app.models.role_permission import RolePermission
    
    # Find users with REQUEST_APPROVE permission (via role or direct)
    approvers_query = db.query(User).distinct()
    
    # Users with role having REQUEST_APPROVE permission
    role_approvers = approvers_query.join(Role).join(RolePermission).join(Permission).filter(
        Permission.name == "REQUEST_APPROVE"
    ).all()
    
    # Users with direct REQUEST_APPROVE permission
    direct_approvers = db.query(User).join(UserPermission).join(Permission).filter(
        Permission.name == "REQUEST_APPROVE"
    ).all()
    
    # Combine and deduplicate
    approvers = list({u.id: u for u in role_approvers + direct_approvers}.values())
    
    for approver in approvers:
        notify_new_request(db, approver.id, db_request.request_number)
    
    db.commit()

    return db_request


# ============================================================
# CANCEL REQUEST
# ============================================================

@router.post(
    "/{request_id}/cancel",
    response_model=StockRequest,
)
def cancel_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REQUEST_CREATE")),
):
    db_request = (
        db.query(StockRequestModel)
        .filter(StockRequestModel.id == request_id)
        .first()
    )

    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    # Can only cancel DRAFT or SUBMITTED requests
    if db_request.status not in [RequestStatus.DRAFT, RequestStatus.SUBMITTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft or submitted requests can be cancelled",
        )

    db_request.status = RequestStatus.CANCELLED
    db.commit()
    db.refresh(db_request)

    return db_request


# ============================================================
# UPDATE REQUEST
# ============================================================

@router.patch(
    "/{request_id}",
    response_model=StockRequest,
)
def update_request(
    request_id: uuid.UUID,
    request_data: StockRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REQUEST_READ")),
):
    db_request = (
        db.query(StockRequestModel)
        .filter(StockRequestModel.id == request_id)
        .first()
    )

    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    # Cannot update completed requests
    if db_request.status in [
        RequestStatus.APPROVED,
        RequestStatus.ISSUED,
        RequestStatus.REJECTED,
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update request in current status",
        )

    update_data = request_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_request, field, value)

    db.commit()
    db.refresh(db_request)

    return db_request


# ============================================================
# APPROVE REQUEST
# ============================================================

@router.post(
    "/{request_id}/approve",
    response_model=StockRequest,
)
def approve_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REQUEST_APPROVE")),
):
    db_request = (
        db.query(StockRequestModel)
        .filter(StockRequestModel.id == request_id)
        .first()
    )

    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    if db_request.status != RequestStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not pending approval",
        )

    db_request.status = RequestStatus.READY_FOR_ISSUE
    db_request.approved_by = current_user.id
    db_request.approved_at = datetime.utcnow()

    # Notify requester about approval
    notify_request_approved(db, db_request.requester_id, db_request.request_number)
    db.commit()
    db.refresh(db_request)

    return db_request


# ============================================================
# REJECT REQUEST
# ============================================================

@router.post(
    "/{request_id}/reject",
    response_model=StockRequest,
)
def reject_request(
    request_id: uuid.UUID,
    reject_data: RejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("REQUEST_REJECT")),
):
    db_request = (
        db.query(StockRequestModel)
        .filter(StockRequestModel.id == request_id)
        .first()
    )

    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    if db_request.status != RequestStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request is not pending approval",
        )

    db_request.status = RequestStatus.REJECTED
    db_request.approved_by = current_user.id
    db_request.approved_at = datetime.utcnow()
    db_request.rejection_reason = reject_data.rejection_reason

    # Notify requester about rejection
    notify_request_rejected(db, db_request.requester_id, db_request.request_number, reject_data.rejection_reason)
    db.commit()
    db.refresh(db_request)

    return db_request


# ============================================================
# ISSUE STOCK FROM APPROVED REQUEST
# ============================================================

class IssueRequest(BaseModel):
    location_id: uuid.UUID
    warehouse_id: uuid.UUID
    site_id: uuid.UUID


@router.post(
    "/{request_id}/issue",
    response_model=StockRequest,
)
def issue_request(
    request_id: uuid.UUID,
    issue_data: IssueRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("STOCK_ISSUE")),
):
    db_request = (
        db.query(StockRequestModel)
        .filter(StockRequestModel.id == request_id)
        .first()
    )

    if not db_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    if db_request.status != RequestStatus.READY_FOR_ISSUE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request must be ready for issue before issuing stock",
        )

    try:
        # Get request items
        request_items = (
            db.query(StockRequestItem)
            .filter(StockRequestItem.request_id == db_request.id)
            .all()
        )

        # Process each item
        for item in request_items:
            # Find stock at the specified location
            stock = (
                db.query(Stock)
                .filter(
                    Stock.article_id == item.article_id,
                    Stock.location_id == issue_data.location_id
                )
                .first()
            )

            if not stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No stock found for article at specified location",
                )

            if stock.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for article. Available: {stock.quantity}, Requested: {item.quantity}",
                )

            # Create stock movement
            movement_number = f"MOV-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
            movement = StockMovement(
                movement_number=movement_number,
                article_id=item.article_id,
                quantity=item.quantity,
                movement_type=MovementType.ISSUE,
                user_id=current_user.id,
                location_id=issue_data.location_id,
                warehouse_id=issue_data.warehouse_id,
                site_id=issue_data.site_id,
                reason=f"Stock Request {db_request.request_number}",
                reference=db_request.request_number,
            )
            db.add(movement)

            # Update stock quantity
            stock.quantity -= item.quantity

        # Update request status
        db_request.status = RequestStatus.FULFILLED
        db_request.issued_by = current_user.id
        db_request.issued_at = datetime.utcnow()

        # Audit logging
        write_audit(
            db,
            user_id=current_user.id,
            action="ISSUE_REQUEST",
            entity="StockRequest",
            entity_id=db_request.id,
            new_values={"request_number": db_request.request_number, "status": "ISSUED"},
        )

        db.commit()
        db.refresh(db_request)

        return db_request

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error issuing stock: {str(e)}",
        )