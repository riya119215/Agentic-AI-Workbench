"""
Full Audit Chain Verification Script (SIH26117)
Run this directly on the real database to independently verify all N blocks,
not just a spot-check of 3. Usage:

    python verify_audit_chain.py

Requires: backend/data/audit_logs/audit_chain.db to exist (SQLite).
Adjust TABLE_NAME / COLUMN_NAMES below if your schema differs slightly.
"""

import sqlite3
import hashlib
import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

DB_PATH = "backend/data/audit_logs/audit_chain.db"
if not os.path.exists(DB_PATH) and os.path.exists("data/audit_logs/audit_chain.db"):
    DB_PATH = "data/audit_logs/audit_chain.db"

def compute_hash(prev_hash, timestamp, user_id, action, details, files_touched):
    raw = f"{prev_hash}|{timestamp}|{user_id}|{action}|{details}|{files_touched}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Adjust table/column names here if they differ in your actual schema
    cur.execute("""
        SELECT id, timestamp, user_id, action, details, files_touched, prev_hash, current_hash
        FROM audit_logs
        ORDER BY id ASC
    """)
    rows = cur.fetchall()

    if not rows:
        print("No rows found — check table name / path.")
        sys.exit(1)

    total = len(rows)
    failures = []

    for row in rows:
        expected = compute_hash(
            row["prev_hash"],
            row["timestamp"],
            row["user_id"],
            row["action"],
            row["details"],
            row["files_touched"],
        )
        if expected != row["current_hash"]:
            failures.append((row["id"], expected, row["current_hash"]))

    # Also verify chain linkage: each row's prev_hash must equal the previous row's current_hash
    linkage_failures = []
    for i in range(1, len(rows)):
        if rows[i]["prev_hash"] != rows[i - 1]["current_hash"]:
            linkage_failures.append((rows[i]["id"], rows[i-1]["id"]))

    print(f"Total blocks checked: {total}")
    print(f"Hash-recomputation failures: {len(failures)}")
    for f in failures:
        print(f"  Block id={f[0]} expected={f[1]} stored={f[2]}")
    print(f"Chain-linkage failures: {len(linkage_failures)}")
    for lf in linkage_failures:
        print(f"  Block id={lf[0]} does not link to previous block id={lf[1]}")

    if not failures and not linkage_failures:
        print("\n✅ ALL BLOCKS VERIFIED — chain is genuinely intact, not fabricated.")
    else:
        print("\n❌ CHAIN INTEGRITY FAILED — investigate immediately, do not demo with this claim.")

if __name__ == "__main__":
    main()
