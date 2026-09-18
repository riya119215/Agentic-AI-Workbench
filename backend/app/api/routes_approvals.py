from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.core.approval import approval_manager

router = APIRouter(prefix="/api/approvals", tags=["Human in the Loop Approvals"])

class ApprovalAction(BaseModel):
    request_id: str
    approved: bool
    user_id: Optional[str] = "admin_verma"

@router.get("/list")
async def list_approvals():
    return approval_manager.get_all_requests()

@router.get("/pending")
async def get_pending():
    return approval_manager.get_pending_requests()

@router.post("/respond")
async def respond_approval(action: ApprovalAction):
    res = approval_manager.respond_to_request(action.request_id, action.approved, action.user_id)
    return res or {"status": "NOT_FOUND"}
