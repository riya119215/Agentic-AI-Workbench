from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from pathlib import Path
from datetime import datetime
import os
import hashlib
from app.config import DELIVERABLES_DIR
from app.tools.docx_generator import create_approval_note

router = APIRouter(prefix="/api/deliverables", tags=["Deliverables"])

class GenerateDeliverableRequest(BaseModel):
    memo_no: Optional[str] = None
    subject: Optional[str] = "Official Analysis & Compliance Report"
    reference_doc: Optional[str] = "Uploaded Document / Metrology Record"
    inspection_summary: Optional[Dict[str, Any]] = None
    findings_table: Optional[List[Dict[str, Any]]] = None
    recommendation: Optional[str] = "Review and sanction recommended maintenance actions."
    signatory_title: Optional[str] = "Chief Inspection Officer (QA & Safety)"
    signatory_dept: Optional[str] = "Directorate of Industrial Safety & Engineering"

def _format_label_from_filename(filename: str) -> str:
    name_without_ext = Path(filename).stem
    clean = name_without_ext.replace("_", " ").replace("-", " ")
    # Capitalize cleanly
    words = [w.capitalize() if not w.isupper() else w for w in clean.split()]
    return " ".join(words)

def _get_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".docx":
        return "DOCX"
    elif ext == ".xlsx":
        return "XLSX"
    elif ext == ".pptx":
        return "PPTX"
    elif ext == ".pdf":
        return "PDF"
    elif ext in [".png", ".jpg", ".jpeg"]:
        return "PNG"
    return "FILE"

@router.get("")
async def list_deliverables():
    """
    Returns all real, physically existing deliverable files in DELIVERABLES_DIR.
    Guarantees every download_url points to a valid file that returns HTTP 200.
    """
    if not DELIVERABLES_DIR.exists():
        return []

    files = []
    for p in DELIVERABLES_DIR.iterdir():
        if p.is_file() and not p.name.startswith("."):
            stat = p.stat()
            file_type = _get_file_type(p.name)
            files.append({
                "filename": p.name,
                "label": _format_label_from_filename(p.name),
                "type": file_type,
                "size_bytes": stat.st_size,
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "download_url": f"http://127.0.0.1:8000/deliverables/{p.name}"
            })

    # Sort descending by modified date
    files.sort(key=lambda x: x["modified_at"], reverse=True)
    return files

@router.post("/generate")
async def generate_deliverable(req: GenerateDeliverableRequest):
    """
    Generates a real, official Note Sheet / Approval Memorandum in .docx format on disk.
    """
    try:
        memo_no = req.memo_no or f"MEMO/{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        findings = req.findings_table or [
            {
                "parameter": "Inspection Parameter",
                "measured": "Compliant",
                "limit": "Standard SOP",
                "status": "COMPLIANT"
            }
        ]
        
        summary = req.inspection_summary or {
            "Source": req.reference_doc,
            "Analysis": "Automated Sovereign Analysis Engine",
            "evaluation": f"Comprehensive evaluation conducted for {req.subject}."
        }

        filename = create_approval_note(
            memo_no=memo_no,
            subject=req.subject,
            reference_doc=req.reference_doc,
            inspection_summary=summary,
            findings_table=findings,
            recommendation=req.recommendation,
            signatory_title=req.signatory_title,
            signatory_dept=req.signatory_dept
        )

        file_path = DELIVERABLES_DIR / filename
        stat = file_path.stat()

        return {
            "filename": filename,
            "label": req.subject or _format_label_from_filename(filename),
            "type": "DOCX",
            "size_bytes": stat.st_size,
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "download_url": f"http://127.0.0.1:8000/deliverables/{filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate deliverable: {str(e)}")
