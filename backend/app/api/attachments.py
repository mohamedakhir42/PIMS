import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.attachment import Attachment
from app.models.user import User
from app.utils.deps import check_permission
import os
from datetime import datetime

router = APIRouter()

# Configuration for file uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AttachmentCreate(BaseModel):
    entity_type: str
    entity_id: uuid.UUID
    file_name: str
    file_url: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None


class AttachmentOut(BaseModel):
    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    file_name: str
    file_url: str
    file_size: Optional[int]
    mime_type: Optional[str]
    uploaded_by: Optional[uuid.UUID]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("")
def list_attachments(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ATTACHMENT_READ")),
):
    query = db.query(Attachment)
    if entity_type:
        query = query.filter(Attachment.entity_type == entity_type)
    if entity_id:
        query = query.filter(Attachment.entity_id == entity_id)
    return query.order_by(Attachment.created_at.desc()).all()


@router.get("/{attachment_id}", response_model=AttachmentOut)
def get_attachment(
    attachment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ATTACHMENT_READ")),
):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@router.post("/upload", response_model=AttachmentOut, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    entity_type: str,
    entity_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ATTACHMENT_CREATE")),
):
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create attachment record
    attachment = Attachment(
        entity_type=entity_type,
        entity_id=entity_id,
        file_name=file.filename,
        file_url=f"/uploads/{unique_filename}",
        file_size=len(contents),
        mime_type=file.content_type,
        uploaded_by=current_user.id,
    )
    
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return attachment


@router.delete("/{attachment_id}")
def delete_attachment(
    attachment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("ATTACHMENT_DELETE")),
):
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    # Delete physical file
    try:
        if attachment.file_url.startswith("/uploads/"):
            file_path = os.path.join(UPLOAD_DIR, attachment.file_url.split("/")[-1])
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as e:
        # Log error but continue with database deletion
        pass
    
    db.delete(attachment)
    db.commit()
    
    return {"message": "Attachment deleted successfully"}
