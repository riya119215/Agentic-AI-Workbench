from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.core.tool_gateway import tool_gateway

router = APIRouter(prefix="/api/tools", tags=["Tool Gateway"])

class ToolExecutionRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    user_id: Optional[str] = "officer_sharma"
    workspace_id: Optional[str] = None

@router.get("")
async def list_tools():
    return tool_gateway.list_tools()

@router.post("/execute")
async def execute_tool(req: ToolExecutionRequest):
    result = await tool_gateway.execute_tool(
        tool_name=req.tool_name,
        arguments=req.arguments,
        user_id=req.user_id,
        workspace_id=req.workspace_id
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result
