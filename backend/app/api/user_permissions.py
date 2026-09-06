import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.user_permissions import (
    UserPermissionsResponse,
    UserPermissionsUpdate,
    UserPermissionItem,
)
from app.utils.deps import require_admin
from app.services.audit import write_audit


router = APIRouter()


@router.get(
    "/{user_id}",
    response_model=UserPermissionsResponse,
)
def get_user_permissions(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Retourne toutes les permissions disponibles
    et indique lesquelles sont attribuées à l'utilisateur.
    """

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    permissions = (
        db.query(Permission)
        .order_by(Permission.name)
        .all()
    )

    assigned_ids = {
        item.permission_id
        for item in db.query(UserPermission)
        .filter(UserPermission.user_id == user_id)
        .all()
    }

    result = []

    for permission in permissions:
        result.append(
            UserPermissionItem(
                id=permission.id,
                name=permission.name,
                description=permission.description,
                assigned=permission.id in assigned_ids,
            )
        )

    return UserPermissionsResponse(
        user_id=user_id,
        permissions=result,
    )


@router.put(
    "/{user_id}",
    response_model=UserPermissionsResponse,
)
def update_user_permissions(
    user_id: uuid.UUID,
    data: UserPermissionsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Remplace complètement les permissions
    d'un utilisateur.
    """

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Vérifier que toutes les permissions existent
    permissions = (
        db.query(Permission)
        .filter(Permission.id.in_(data.permission_ids))
        .all()
    )

    if len(permissions) != len(set(data.permission_ids)):
        raise HTTPException(
            status_code=400,
            detail="One or more permission IDs are invalid",
        )

    # Anciennes permissions
    old_permissions = [
        permission.permission.name
        for permission in user.user_permissions
    ]

    # Supprimer les anciennes
    db.query(UserPermission).filter(
        UserPermission.user_id == user_id
    ).delete(synchronize_session=False)

    # Ajouter les nouvelles
    for permission in permissions:
        db.add(
            UserPermission(
                user_id=user_id,
                permission_id=permission.id,
            )
        )

    # Audit
    write_audit(
        db,
        user_id=current_user.id,
        action="UPDATE_USER_PERMISSIONS",
        entity="User",
        entity_id=user_id,
        old_values={
            "permissions": old_permissions,
        },
        new_values={
            "permissions": [permission.name for permission in permissions],
        },
    )

    db.commit()

    # Recharger
    db.refresh(user)

    return get_user_permissions(
        user_id=user_id,
        db=db,
        current_user=current_user,
    )