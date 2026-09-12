from fastapi import APIRouter
from app.core.rbac import DEFAULT_USERS, ROLE_PERMISSIONS, get_user_by_id

router = APIRouter(prefix="/api/security", tags=["RBAC & Security"])

@router.get("/users")
async def get_users():
    return [u.dict() for u in DEFAULT_USERS]

@router.get("/permissions")
async def get_permissions():
    return ROLE_PERMISSIONS

@router.get("/user/{user_id}")
async def get_user_info(user_id: str):
    user = get_user_by_id(user_id)
    return user.dict() if user else None
