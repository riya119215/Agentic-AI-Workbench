from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.agent import agent

router = APIRouter(prefix="/api/chat", tags=["Agentic Chat"])

class ChatRequest(BaseModel):
    prompt: str
    user_id: Optional[str] = "officer_sharma"
    attachments: Optional[List[str]] = []

@router.post("")
async def run_agent_task(req: ChatRequest):
    try:
        result = await agent.process_task(
            prompt=req.prompt,
            user_id=req.user_id,
            attachments=req.attachments
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
