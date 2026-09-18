from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.workspace import workspace_manager, WorkspaceError, PathTraversalError

router = APIRouter(prefix="/api/workspaces", tags=["Workspace Manager"])

class CreateWorkspaceRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    classification: Optional[str] = "RESTRICTED"
    owner: Optional[str] = "officer_sharma"
    workspace_id: Optional[str] = None

@router.get("")
async def list_workspaces():
    return workspace_manager.list_workspaces()

@router.post("")
async def create_workspace(req: CreateWorkspaceRequest):
    try:
        ws = workspace_manager.create_workspace(
            name=req.name,
            description=req.description,
            classification=req.classification,
            owner=req.owner,
            workspace_id=req.workspace_id
        )
        return ws
    except WorkspaceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workspace_id}")
async def get_workspace(workspace_id: str):
    try:
        ws = workspace_manager.get_workspace(workspace_id)
        if not ws:
            raise HTTPException(status_code=404, detail=f"Workspace {workspace_id} not found.")
        return ws
    except PathTraversalError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{workspace_id}/archive")
async def archive_workspace(workspace_id: str):
    try:
        return workspace_manager.archive_workspace(workspace_id)
    except WorkspaceError as e:
        raise HTTPException(status_code=404, detail=str(e))
