import logging
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.tools.sandbox import execute_python_sandbox

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/sandbox", tags=["Isolated Code Execution Sandbox"])

class RunCodeRequest(BaseModel):
    code: str
    workspace_id: Optional[str] = None
    timeout_seconds: Optional[int] = 25

@router.post("/run")
async def run_sandbox_code(req: RunCodeRequest):
    result = execute_python_sandbox(
        code_str=req.code,
        workspace_id=req.workspace_id,
        timeout_seconds=req.timeout_seconds or 25
    )
    return result
