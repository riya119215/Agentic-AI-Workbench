import sqlite3
import json
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
from app.config import AUDIT_DIR

DB_PATH = AUDIT_DIR / "approvals.db"

class ApprovalRequest(BaseModel):
    request_id: str
    task_id: str
    action_type: str # 'OFFICIAL_DELIVERABLE_GENERATION', 'SANDBOX_CODE_EXECUTION', 'OFFICIAL_OVERHAUL_SANCTION'
    title: str
    description: str
    classification: str
    requested_by: str
    status: str # 'PENDING', 'APPROVED', 'REJECTED'
    timestamp: str
    metadata: Dict[str, Any]

class HumanApprovalManager:
    """
    Manages Human-in-the-Loop gates for high-clearance actions.
    Persisted to SQLite database so approval tickets survive server restarts.
    """
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(str(self.db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS approvals (
                    request_id TEXT PRIMARY KEY,
                    task_id TEXT NOT NULL,
                    action_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    classification TEXT NOT NULL,
                    requested_by TEXT NOT NULL,
                    status TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    metadata_json TEXT,
                    resolved_by TEXT,
                    resolved_at TEXT
                )
            """)
            conn.commit()

    def create_approval_request(
        self,
        task_id: str,
        action_type: str,
        title: str,
        description: str,
        classification: str = "RESTRICTED",
        requested_by: str = "SovereignAgent",
        metadata: Dict[str, Any] = None,
        initial_status: str = "PENDING"
    ) -> Dict[str, Any]:
        req_id = f"APP-{uuid.uuid4().hex[:8].upper()}"
        ts = datetime.now(timezone.utc).isoformat()
        meta_str = json.dumps(metadata or {})

        with sqlite3.connect(str(self.db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO approvals (
                    request_id, task_id, action_type, title, description,
                    classification, requested_by, status, timestamp, metadata_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (req_id, task_id, action_type, title, description, classification, requested_by, initial_status, ts, meta_str))
            conn.commit()

        return {
            "request_id": req_id,
            "task_id": task_id,
            "action_type": action_type,
            "title": title,
            "description": description,
            "classification": classification,
            "requested_by": requested_by,
            "status": initial_status,
            "timestamp": ts,
            "metadata": metadata or {}
        }

    def get_pending_requests(self) -> List[Dict[str, Any]]:
        with sqlite3.connect(str(self.db_path)) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM approvals WHERE status = 'PENDING' ORDER BY timestamp DESC")
            rows = cursor.fetchall()
            return [self._row_to_dict(r) for r in rows]

    def get_all_requests(self) -> List[Dict[str, Any]]:
        with sqlite3.connect(str(self.db_path)) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM approvals ORDER BY timestamp DESC")
            rows = cursor.fetchall()
            return [self._row_to_dict(r) for r in rows]

    def get_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        with sqlite3.connect(str(self.db_path)) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM approvals WHERE request_id = ?", (request_id,))
            row = cursor.fetchone()
            return self._row_to_dict(row) if row else None

    def respond_to_request(self, request_id: str, approved: bool, user_id: str = "officer_sharma") -> Optional[Dict[str, Any]]:
        status = "APPROVED" if approved else "REJECTED"
        resolved_at = datetime.now(timezone.utc).isoformat()

        with sqlite3.connect(str(self.db_path)) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE approvals
                SET status = ?, resolved_by = ?, resolved_at = ?
                WHERE request_id = ?
            """, (status, user_id, resolved_at, request_id))
            conn.commit()

        return self.get_request(request_id)

    def _row_to_dict(self, row) -> Dict[str, Any]:
        meta = {}
        if row["metadata_json"]:
            try:
                meta = json.loads(row["metadata_json"])
            except Exception:
                pass
        return {
            "request_id": row["request_id"],
            "task_id": row["task_id"],
            "action_type": row["action_type"],
            "title": row["title"],
            "description": row["description"],
            "classification": row["classification"],
            "requested_by": row["requested_by"],
            "status": row["status"],
            "timestamp": row["timestamp"],
            "metadata": meta,
            "resolved_by": row["resolved_by"] if "resolved_by" in row.keys() else None,
            "resolved_at": row["resolved_at"] if "resolved_at" in row.keys() else None
        }

approval_manager = HumanApprovalManager()

def create_approval_request(*args, **kwargs):
    return approval_manager.create_approval_request(*args, **kwargs)

