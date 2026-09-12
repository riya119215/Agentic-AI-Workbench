import sys
import subprocess
import tempfile
import os
import shutil
import glob
from pathlib import Path
from app.config import DELIVERABLES_DIR, SANDBOX_DIR

def execute_python_sandbox(code_str: str, timeout_seconds: int = 25) -> dict:
    """
    Safely executes arbitrary Python analytical code inside an isolated workspace.
    Captures stdout, stderr, and automatically harvests generated plots/deliverables.
    """
    run_id = f"run_{os.urandom(4).hex()}"
    run_dir = SANDBOX_DIR / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    script_path = run_dir / "analytics_script.py"

    # Prepend safety header (disable internet sockets inside the sandbox)
    safety_preamble = """
import sys
import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import socket
# Block outbound sockets
socket.socket = None
"""
    full_code = safety_preamble + "\n" + code_str
    
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(full_code)

    try:
        process = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=str(run_dir),
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            env={**os.environ, "MPLBACKEND": "Agg"}
        )
        
        stdout = process.stdout
        stderr = process.stderr
        exit_code = process.returncode

        # Harvest generated artifacts (.png, .xlsx, .csv, .pdf)
        generated_files = []
        for ext in ["*.png", "*.jpg", "*.xlsx", "*.csv", "*.pdf", "*.json"]:
            for f in run_dir.glob(ext):
                dest_name = f"sandbox_{run_id}_{f.name}"
                dest_path = DELIVERABLES_DIR / dest_name
                shutil.copy2(str(f), str(dest_path))
                generated_files.append({
                    "filename": dest_name,
                    "type": f.suffix.replace(".", "").upper(),
                    "size_bytes": dest_path.stat().st_size
                })

        return {
            "success": exit_code == 0,
            "exit_code": exit_code,
            "stdout": stdout,
            "stderr": stderr,
            "artifacts": generated_files,
            "sandbox_run_id": run_id
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "exit_code": -1,
            "stdout": "",
            "stderr": f"Execution timed out after {timeout_seconds} seconds (Resource Limit Exceeded).",
            "artifacts": [],
            "sandbox_run_id": run_id
        }
    except Exception as e:
        return {
            "success": False,
            "exit_code": -1,
            "stdout": "",
            "stderr": f"Sandbox execution error: {str(e)}",
            "artifacts": [],
            "sandbox_run_id": run_id
        }
