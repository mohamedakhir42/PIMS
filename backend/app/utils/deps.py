from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.api.auth import get_current_user


def check_permission(permission: str):
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No role assigned to user"
            )
        
        user_permissions = [p.name for p in current_user.role.permissions]
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' required"
            )
        
        return current_user
    
    return permission_checker
