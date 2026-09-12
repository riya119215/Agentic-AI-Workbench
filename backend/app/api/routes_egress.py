from fastapi import APIRouter
from app.core.zero_egress import get_network_egress_status

router = APIRouter(prefix="/api/egress", tags=["Zero-Egress Guardian"])

@router.get("/status")
async def egress_status():
    return get_network_egress_status()
