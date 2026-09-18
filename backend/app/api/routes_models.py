from fastapi import APIRouter
from app.core.model_manager import model_manager

router = APIRouter(prefix="/api/models", tags=["Local Model Manager"])

@router.get("/status")
async def get_model_status():
    return await model_manager.get_runtime_status()
