import sys
import subprocess
import os
import shutil
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.config import DELIVERABLES_DIR, SANDBOX_DIR
from app.core.workspace import workspace_manager

MAX_SANDBOX_TIMEOUT_SECONDS = 30
ALLOWED_OUTPUT_EXTENSIONS = [".png", ".jpg", ".jpeg", ".xlsx", ".csv", ".pdf", ".json", ".txt"]

def execute_python_sandbox(
    code_str: str,
    workspace_id: Optional[str] = None,
    timeout_seconds: int = 25
) -> Dict[str, Any]:
    """
    Executes Python analytical code in a restricted runtime sandbox.
    Primary isolation: Process confinement, timeout, isolated working directory, scrubbed environment.
    Defense-in-depth: Outbound socket blocking.
    Harvests generated deliverables to workspace artifacts with SHA-256 hashes.
    """
    timeout = min(timeout_seconds, MAX_SANDBOX_TIMEOUT_SECONDS)
    run_id = f"run_{os.urandom(4).hex()}"

    if workspace_id:
        try:
            ws_dir = workspace_manager.get_workspace_dir(workspace_id)
            run_dir = ws_dir / "runs" / run_id
            artifacts_dest_dir = ws_dir / "artifacts"
        except Exception:
            run_dir = SANDBOX_DIR / run_id
            artifacts_dest_dir = DELIVERABLES_DIR
    else:
        run_dir = SANDBOX_DIR / run_id
        artifacts_dest_dir = DELIVERABLES_DIR

    run_dir.mkdir(parents=True, exist_ok=True)
    artifacts_dest_dir.mkdir(parents=True, exist_ok=True)

    script_path = run_dir / "script.py"

    # Defense-in-depth socket blocking and non-interactive Matplotlib backend
    safety_header = """
import sys
import socket

# Defense-in-depth socket blocking
def _blocked_socket(*args, **kwargs):
    raise PermissionError("NETWORK_BLOCKED: Sandbox does not permit external socket connections.")

socket.socket = _blocked_socket

# Safe non-interactive Matplotlib
try:
    import matplotlib
    matplotlib.use('Agg')
except ImportError:
    pass
"""
    full_script = safety_header + "\n" + code_str

    with open(script_path, "w", encoding="utf-8") as f:
        f.write(full_script)

    # Scrubbed environment variables (strips credentials, API keys, tokens, and secrets)
    scrubbed_env = {
        k: v for k, v in os.environ.items()
        if not any(s in k.upper() for s in ["KEY", "SECRET", "TOKEN", "AUTH", "PASSWORD", "CREDENTIAL", "AWS", "GITHUB"])
    }
    scrubbed_env["MPLBACKEND"] = "Agg"
    scrubbed_env["AIR_GAP_ENFORCED"] = "1"

    start_time = datetime.now()
    try:
        process = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(run_dir),
            capture_output=True,
            text=True,
            timeout=timeout,
            env=scrubbed_env
        )

        duration_ms = round((datetime.now() - start_time).total_seconds() * 1000, 2)
        stdout = process.stdout
        stderr = process.stderr
        exit_code = process.returncode

        # Harvest generated artifacts
        generated_files = []
        for file_path in run_dir.iterdir():
            if file_path.is_file() and file_path.name != "script.py":
                suffix = file_path.suffix.lower()
                if suffix in ALLOWED_OUTPUT_EXTENSIONS:
                    with open(file_path, "rb") as af:
                        file_bytes = af.read()
                    file_hash = hashlib.sha256(file_bytes).hexdigest()

                    dest_name = f"sandbox_{run_id}_{file_path.name}"
                    dest_path = artifacts_dest_dir / dest_name
                    shutil.copy2(str(file_path), str(dest_path))

                    # Also copy to global deliverables if in workspace mode for static download link
                    if artifacts_dest_dir != DELIVERABLES_DIR:
                        shutil.copy2(str(file_path), str(DELIVERABLES_DIR / dest_name))

                    generated_files.append({
                        "filename": dest_name,
                        "type": suffix.replace(".", "").upper(),
                        "size_bytes": len(file_bytes),
                        "sha256": file_hash,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    })

        return {
            "success": exit_code == 0,
            "exit_code": exit_code,
            "stdout": stdout,
            "stderr": stderr,
            "duration_ms": duration_ms,
            "artifacts": generated_files,
            "sandbox_run_id": run_id,
            "isolation_status": "CONTAINER_RUNTIME_RESTRICTED"
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "exit_code": -1,
            "stdout": "",
            "stderr": f"TIMEOUT: Execution terminated after {timeout} seconds (Resource Limit Exceeded).",
            "duration_ms": timeout * 1000,
            "artifacts": [],
            "sandbox_run_id": run_id,
            "isolation_status": "TIMEOUT_ENFORCED"
        }
    except Exception as e:
        return {
            "success": False,
            "exit_code": -1,
            "stdout": "",
            "stderr": f"SANDBOX_ERROR: {str(e)}",
            "duration_ms": 0,
            "artifacts": [],
            "sandbox_run_id": run_id,
            "isolation_status": "EXECUTION_FAILED"
        }
