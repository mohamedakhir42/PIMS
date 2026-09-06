from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.models.user_permission import UserPermission
from app.api.auth import get_current_user


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Autorise uniquement les utilisateurs ayant le rôle ADMIN.
    """
    if not current_user.role or current_user.role.name != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required",
        )

    return current_user


def check_permission(permission: str):
    """
    Vérifie si l'utilisateur possède la permission requise.

    ADMIN possède automatiquement tous les droits.
    
    Pour les autres utilisateurs, vérifie:
    1. Les permissions héritées du rôle
    2. Les permissions directement attribuées à l'utilisateur
    """

    def permission_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        # ADMIN = accès complet
        if current_user.role and current_user.role.name == "ADMIN":
            return current_user

        # Collecter toutes les permissions de l'utilisateur
        all_permissions = set()

        # 1. Permissions héritées du rôle
        if current_user.role and current_user.role.permissions:
            role_permissions = {
                perm.name for perm in current_user.role.permissions
            }
            all_permissions.update(role_permissions)

        # 2. Permissions directement attribuées à l'utilisateur
        if current_user.user_permissions:
            user_permissions = {
                user_permission.permission.name
                for user_permission in current_user.user_permissions
            }
            all_permissions.update(user_permissions)

        if permission not in all_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required",
            )

        return current_user

    return permission_checker