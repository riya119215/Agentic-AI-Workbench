import sqlite3
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from app.config import AUDIT_DIR

DB_PATH = AUDIT_DIR / "audit_chain.db"

def init_audit_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_id TEXT UNIQUE NOT NULL,
            timestamp TEXT NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            files_touched TEXT NOT NULL,
            model_used TEXT NOT NULL,
            prev_hash TEXT NOT NULL,
            current_hash TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def compute_hash(prev_hash: str, timestamp: str, user_id: str, action: str, details: str, files_touched: str) -> str:
    raw = f"{prev_hash}|{timestamp}|{user_id}|{action}|{details}|{files_touched}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def get_latest_hash() -> str:
    init_audit_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT current_hash FROM audit_logs ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return row[0]
    # Genesis hash
    return "0" * 64

def log_audit_event(user_id: str, role: str, action: str, details: dict or str, files_touched: list = None, model_used: str = "N/A") -> dict:
    init_audit_db()
    prev_hash = get_latest_hash()
    timestamp = datetime.now(timezone.utc).isoformat()
    log_id = f"AUD-{datetime.now().strftime('%Y%m%d%H%M%S')}-{int(datetime.now().timestamp()*1000)%1000:03d}"
    
    details_str = json.dumps(details) if isinstance(details, (dict, list)) else str(details)
    files_str = json.dumps(files_touched if files_touched else [])
    
    current_hash = compute_hash(prev_hash, timestamp, user_id, action, details_str, files_str)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_logs (log_id, timestamp, user_id, role, action, details, files_touched, model_used, prev_hash, current_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (log_id, timestamp, user_id, role, action, details_str, files_str, model_used, prev_hash, current_hash))
    conn.commit()
    conn.close()
    
    return {
        "log_id": log_id,
        "timestamp": timestamp,
        "user_id": user_id,
        "role": role,
        "action": action,
        "model_used": model_used,
        "prev_hash": prev_hash,
        "current_hash": current_hash
    }

def get_all_logs(limit: int = 100) -> list:
    init_audit_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    logs = []
    for r in rows:
        d = dict(r)
        try:
            d["details"] = json.loads(d["details"])
        except Exception:
            pass
        try:
            d["files_touched"] = json.loads(d["files_touched"])
        except Exception:
            pass
        logs.append(d)
    return logs

def verify_audit_chain() -> dict:
    init_audit_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, log_id, timestamp, user_id, action, details, files_touched, prev_hash, current_hash FROM audit_logs ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return {"is_valid": True, "total_records": 0, "message": "Audit chain is empty. Genesis ready."}
        
    expected_prev = "0" * 64
    for idx, row in enumerate(rows):
        r_id, r_log_id, r_time, r_user, r_action, r_details, r_files, r_prev, r_curr = row
        if r_prev != expected_prev:
            return {
                "is_valid": False,
                "corrupted_at_id": r_log_id,
                "reason": f"Broken link at record {r_log_id}: Prev hash does not match expected {expected_prev}"
            }
        recomputed = compute_hash(r_prev, r_time, r_user, r_action, r_details, r_files)
        if recomputed != r_curr:
            return {
                "is_valid": False,
                "corrupted_at_id": r_log_id,
                "reason": f"Tampered data detected in record {r_log_id}: Computed hash {recomputed} != Stored {r_curr}"
            }
        expected_prev = r_curr
        
    return {
        "is_valid": True,
        "total_records": len(rows),
        "latest_block_hash": expected_prev,
        "message": f"Cryptographic integrity verified across {len(rows)} immutable audit blocks."
    }
