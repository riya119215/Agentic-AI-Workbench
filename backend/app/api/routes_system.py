from fastapi import APIRouter
from app.core.system_health import get_system_health_report

router = APIRouter(prefix="/api/system", tags=["System Health"])

@router.get("/health")
async def get_health():
    return get_system_health_report()
