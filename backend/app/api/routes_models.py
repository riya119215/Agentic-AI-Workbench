import logging
from typing import Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.model_manager import model_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/models", tags=["Model Registry"])

class RegisterModelRequest(BaseModel):
    id: str
    name: str
    task_type: str
    category: str = "reasoning"
    endpoint: str = "http://127.0.0.1:11434"
    size_gb: float = 3.0
    vram_pct: int = 30
    acceleration: str = "Local Engine"

@router.get("")
async def list_models():
    return model_manager.list_models()

@router.post("")
async def register_model(req: RegisterModelRequest):
    new_entry = model_manager.add_model(req.dict())
    return {"status": "REGISTERED", "model": new_entry}

@router.get("/status")
async def get_model_runtime_status():
    return await model_manager.get_runtime_status()
