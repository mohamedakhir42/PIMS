import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.role import Role
from app.models.permission import Permission
from app.models.user import User
from app.schemas.roles import RoleCreate, RoleUpdate, RoleOut
from app.utils.deps import check_permission

router = APIRouter()

@router.get("", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db), current_user: User = Depends(check_permission("USERS_READ"))):
    return db.query(Role).order_by(Role.name).all()

@router.get("/permissions")
def list_permissions(db: Session = Depends(get_db), current_user: User = Depends(check_permission("USERS_READ"))):
    return db.query(Permission).order_by(Permission.name).all()

@router.post("", response_model=RoleOut)
def create_role(data: RoleCreate, db: Session = Depends(get_db), current_user: User = Depends(check_permission("USERS_CREATE"))):
    if db.query(Role).filter(Role.name == data.name).first():
        raise HTTPException(409, "Role already exists")
    role = Role(name=data.name, description=data.description)
    if data.permission_ids:
        role.permissions = db.query(Permission).filter(Permission.id.in_(data.permission_ids)).all()
    db.add(role); db.commit(); db.refresh(role)
    return role

@router.patch("/{role_id}", response_model=RoleOut)
def update_role(role_id: uuid.UUID, data: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(check_permission("USERS_UPDATE"))):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role: raise HTTPException(404, "Role not found")
    values = data.model_dump(exclude_unset=True)
    permission_ids = values.pop("permission_ids", None)
    for k,v in values.items(): setattr(role,k,v)
    if permission_ids is not None:
        role.permissions = db.query(Permission).filter(Permission.id.in_(permission_ids)).all()
    db.commit(); db.refresh(role)
    return role
