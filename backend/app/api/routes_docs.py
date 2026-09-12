from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import shutil
from typing import Optional
from app.config import KNOWLEDGE_BASE_DIR
from app.rag.vector_store import vector_store
from app.core.audit import log_audit_event

router = APIRouter(prefix="/api/docs", tags=["Knowledge Base"])

@router.get("/list")
async def list_documents():
    return vector_store.get_indexed_documents()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    department: str = Form("Engineering QA"),
    classification: str = Form("RESTRICTED"),
    user_id: str = Form("officer_sharma")
):
    try:
        dest_path = KNOWLEDGE_BASE_DIR / file.filename
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        ingestion_result = await vector_store.ingest_document(
            file_path=dest_path,
            department=department,
            classification=classification
        )

        log_audit_event(
            user_id=user_id,
            role="Officer",
            action="DOCUMENT_INGESTION_AND_INDEXING",
            details={"filename": file.filename, "department": department, "classification": classification},
            files_touched=[file.filename],
            model_used="bge-m3:latest"
        )

        return ingestion_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
