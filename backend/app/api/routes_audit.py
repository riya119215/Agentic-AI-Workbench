from fastapi import APIRouter
from app.core.audit import get_all_logs, verify_audit_chain

router = APIRouter(prefix="/api/audit", tags=["Audit & Governance"])

@router.get("/logs")
async def get_logs(limit: int = 50):
    return get_all_logs(limit=limit)

@router.get("/verify")
async def verify_chain():
    return verify_audit_chain()
