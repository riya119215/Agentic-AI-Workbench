import asyncio
import json
import logging
import shutil
from typing import Optional, List
from pathlib import Path
from fastapi import APIRouter, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.core.agent_loop import run_agent_loop_stream
from app.core.agent import agent
from app.config import WORKSPACES_DIR

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/task", tags=["Task & Live Agent Stream"])

# In-memory store for task states
TASK_REGISTRY = {}

class CreateTaskRequest(BaseModel):
    prompt: str
    user_id: Optional[str] = "officer_sharma"
    attachments: Optional[List[str]] = []
    clearance: Optional[str] = "RESTRICTED"
    workspace_id: Optional[str] = "default-workspace"

@router.post("")
async def create_task(req: CreateTaskRequest):
    task_id = f"task_{int(asyncio.get_event_loop().time() * 1000)}"
    TASK_REGISTRY[task_id] = {
        "task_id": task_id,
        "prompt": req.prompt,
        "user_id": req.user_id,
        "attachments": req.attachments or [],
        "clearance": req.clearance or "RESTRICTED",
        "workspace_id": req.workspace_id or "default-workspace",
        "status": "QUEUED"
    }
    return {"task_id": task_id, "status": "QUEUED"}


@router.post("/with-files")
async def create_task_with_files(
    prompt: str = Form(...),
    user_id: str = Form("officer_sharma"),
    clearance: str = Form("RESTRICTED"),
    workspace_id: str = Form("WS-MAIN"),
    files: List[UploadFile] = File(default=[])
):
    """
    Create a task with actual file uploads (multipart/form-data).
    Files are saved to the workspace evidence directory and their filenames
    are passed as attachments to the agent loop.
    """
    task_id = f"task_{int(asyncio.get_event_loop().time() * 1000)}"
    saved_filenames = []

    # Save uploaded files to workspace evidence directory
    evidence_dir = WORKSPACES_DIR / workspace_id / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)

    for upload_file in files:
        if upload_file.filename:
            file_bytes = await upload_file.read()
            dest_path = evidence_dir / upload_file.filename
            dest_path.write_bytes(file_bytes)
            saved_filenames.append(upload_file.filename)
            logger.info(
                f"[TASK UPLOAD] Saved '{upload_file.filename}' "
                f"({len(file_bytes)} bytes) to {dest_path}"
            )
            logger.info(
                f"[TASK UPLOAD] First 200 bytes of '{upload_file.filename}': "
                f"{file_bytes[:200]}"
            )

    TASK_REGISTRY[task_id] = {
        "task_id": task_id,
        "prompt": prompt,
        "user_id": user_id,
        "attachments": saved_filenames,
        "clearance": clearance,
        "workspace_id": workspace_id,
        "status": "QUEUED"
    }

    logger.info(
        f"[TASK UPLOAD] Task {task_id} created with {len(saved_filenames)} files: {saved_filenames}"
    )

    return {"task_id": task_id, "status": "QUEUED", "attachments_saved": saved_filenames}


@router.get("/{task_id}/stream")
async def stream_task_events(task_id: str):
    task_data = TASK_REGISTRY.get(task_id)
    prompt = task_data.get("prompt", "") if task_data else "Analyze inspection report."
    user_id = task_data.get("user_id", "officer_sharma") if task_data else "officer_sharma"
    attachments = task_data.get("attachments", []) if task_data else []
    clearance = task_data.get("clearance", "RESTRICTED") if task_data else "RESTRICTED"
    workspace_id = task_data.get("workspace_id", "default-workspace") if task_data else "default-workspace"

    logger.info(
        f"[STREAM] Starting stream for task {task_id} (workspace={workspace_id}) — "
        f"prompt='{prompt[:80]}', attachments={attachments}"
    )

    async def event_generator():
        async for event in run_agent_loop_stream(
            prompt=prompt,
            user_id=user_id,
            attachments=attachments,
            clearance=clearance,
            task_id=task_id,
            workspace_id=workspace_id
        ):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
