import hashlib
import json
import mimetypes
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.core.workspace import workspace_manager, WorkspaceError

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 # 50 MB

ALLOWED_EXTENSIONS = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".py": "text/x-python",
    ".json": "application/json",
    ".log": "text/plain",
    ".md": "text/markdown",
}

# Magic bytes signature checking for strict content validation
MAGIC_SIGNATURES = {
    ".pdf": [b"%PDF"],
    ".png": [b"\x89PNG\r\n\x1a\n"],
    ".jpg": [b"\xff\xd8\xff"],
    ".jpeg": [b"\xff\xd8\xff"],
    ".docx": [b"PK\x03\x04"],
    ".xlsx": [b"PK\x03\x04"],
    ".pptx": [b"PK\x03\x04"],
    ".bmp": [b"BM"],
    ".webp": [b"RIFF"],
}

class EvidenceError(Exception):
    pass

class EvidenceService:
    """
    Manages operational evidence lifecycle, cryptographic hashing,
    MIME validation, and storage isolation.
    """
    def __init__(self):
        pass

    def compute_sha256(self, file_bytes: bytes) -> str:
        return hashlib.sha256(file_bytes).hexdigest()

    def validate_file(self, filename: str, file_bytes: bytes) -> str:
        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise EvidenceError(f"File exceeds maximum allowed size ({MAX_FILE_SIZE_BYTES // (1024*1024)} MB).")
        
        if len(file_bytes) == 0:
            raise EvidenceError("File is empty (0 bytes).")

        suffix = Path(filename).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise EvidenceError(f"Unsupported file type: {suffix}. Allowed: {list(ALLOWED_EXTENSIONS.keys())}")

        # Magic byte check for binary formats
        if suffix in MAGIC_SIGNATURES:
            valid_sig = any(file_bytes.startswith(sig) for sig in MAGIC_SIGNATURES[suffix])
            if not valid_sig:
                raise EvidenceError(f"File content signature does not match declared extension {suffix}.")

        return ALLOWED_EXTENSIONS[suffix]

    def store_evidence(
        self,
        workspace_id: str,
        filename: str,
        file_bytes: bytes,
        department: str = "General",
        classification: str = "RESTRICTED",
        uploaded_by: str = "officer_sharma"
    ) -> Dict[str, Any]:
        # Validate format & size
        mime_type = self.validate_file(filename, file_bytes)
        file_hash = self.compute_sha256(file_bytes)
        
        # Resolve isolated destination
        dest_path = workspace_manager.resolve_safe_path(workspace_id, "evidence", filename)
        
        with open(dest_path, "wb") as f:
            f.write(file_bytes)

        evidence_meta = {
            "evidence_id": f"EVD-{file_hash[:12].upper()}",
            "workspace_id": workspace_id,
            "filename": filename,
            "mime_type": mime_type,
            "size_bytes": len(file_bytes),
            "sha256": file_hash,
            "department": department,
            "classification": classification,
            "uploaded_by": uploaded_by,
            "status": "UPLOADED",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        # Save metadata record
        meta_path = workspace_manager.resolve_safe_path(workspace_id, "evidence", f"{filename}.meta.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(evidence_meta, f, indent=2)

        return evidence_meta

    def list_evidence(self, workspace_id: str) -> List[Dict[str, Any]]:
        ws_dir = workspace_manager.get_workspace_dir(workspace_id)
        evidence_dir = ws_dir / "evidence"
        if not evidence_dir.exists():
            return []

        results = []
        for p in evidence_dir.glob("*.meta.json"):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    results.append(json.load(f))
            except Exception:
                pass
        return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    def update_status(self, workspace_id: str, filename: str, new_status: str, error_msg: Optional[str] = None) -> Optional[Dict[str, Any]]:
        valid_statuses = ["UPLOADED", "PROCESSING", "PROCESSED", "FAILED", "QUARANTINED"]
        if new_status not in valid_statuses:
            raise EvidenceError(f"Invalid evidence status: {new_status}")

        try:
            meta_path = workspace_manager.resolve_safe_path(workspace_id, "evidence", f"{filename}.meta.json")
            if not meta_path.exists():
                return None
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
            meta["status"] = new_status
            meta["updated_at"] = datetime.now(timezone.utc).isoformat()
            if error_msg:
                meta["error_message"] = error_msg
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(meta, f, indent=2)
            return meta
        except Exception:
            return None

evidence_service = EvidenceService()
