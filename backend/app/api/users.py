import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User, UserStatus
from app.models.role import Role
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema
from app.utils.deps import check_permission
from app.services.audit import write_audit
from app.core.security import get_password_hash

router = APIRouter()

@router.get("", response_model=List[UserSchema])
def list_users(
    skip: int = 0,
    limit: int = 25,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("USERS_READ")),
):
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(min(limit, 100)).all()

@router.get("/{user_id}", response_model=UserSchema)
def get_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("USERS_READ")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.post("", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("USERS_CREATE")),
):
    if db.query(User).filter((User.username == data.username) | (User.email == data.email)).first():
        raise HTTPException(409, "Username or email already exists")
    if data.role_id and not db.query(Role).filter(Role.id == data.role_id).first():
        raise HTTPException(400, "Role not found")

    payload = data.model_dump(exclude={"password"})
    payload["hashed_password"] = get_password_hash(data.password)
    user = User(**payload)
    db.add(user)
    db.flush()
    write_audit(db, user_id=current_user.id, action="CREATE_USER", entity="User", entity_id=user.id,
                new_values={"username": user.username, "email": user.email})
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("USERS_UPDATE")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    old = {"email": user.email, "full_name": user.full_name, "status": user.status.value, "role_id": str(user.role_id) if user.role_id else None}
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    write_audit(db, user_id=current_user.id, action="UPDATE_USER", entity="User", entity_id=user.id,
                old_values=old, new_values={k: str(v) for k, v in data.model_dump(exclude_unset=True).items()})
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", response_model=UserSchema)
def disable_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("USERS_DISABLE")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.status = UserStatus.DISABLED
    write_audit(db, user_id=current_user.id, action="DISABLE_USER", entity="User", entity_id=user.id)
    db.commit()
    db.refresh(user)
    return user

@router.get("/roles/list", response_model=list)
def list_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_permission("USERS_READ")),
):
    return db.query(Role).order_by(Role.name).all()
