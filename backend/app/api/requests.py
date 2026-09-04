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
        status=RequestStatus.PENDING_APPROVAL,
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

    db_request.status = RequestStatus.APPROVED
    db_request.approved_by = current_user.id
    db_request.approved_at = datetime.utcnow()

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

    db.commit()
    db.refresh(db_request)

    return db_request