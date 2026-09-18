from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from app.core.evidence import evidence_service, EvidenceError
from app.core.workspace import PathTraversalError

router = APIRouter(prefix="/api/evidence", tags=["Evidence Management"])

@router.get("/{workspace_id}")
async def list_evidence(workspace_id: str):
    try:
        return evidence_service.list_evidence(workspace_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    workspace_id: str = Form("WS-MAIN"),
    department: str = Form("General"),
    classification: str = Form("RESTRICTED"),
    user_id: str = Form("officer_sharma")
):
    try:
        file_bytes = await file.read()
        res = evidence_service.store_evidence(
            workspace_id=workspace_id,
            filename=file.filename,
            file_bytes=file_bytes,
            department=department,
            classification=classification,
            uploaded_by=user_id
        )
        return res
    except EvidenceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PathTraversalError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
