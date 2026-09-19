import os
import json
import uuid
import re
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.config import WORKSPACES_DIR

SAFE_SUBFOLDERS = ["evidence", "processed", "knowledge", "runs", "artifacts", "audit"]

class WorkspaceError(Exception):
    pass

class PathTraversalError(WorkspaceError):
    pass

class WorkspaceManager:
    """
    Manages isolated on-premise operational workspaces.
    Enforces strict filesystem confinement and traversal protection.
    """
    def __init__(self, base_dir: Path = WORKSPACES_DIR):
        self.base_dir = base_dir.resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _sanitize_workspace_id(self, workspace_id: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_\-]+$", workspace_id):
            raise WorkspaceError(f"Invalid workspace ID format: {workspace_id}")
        return workspace_id

    def get_workspace_dir(self, workspace_id: str) -> Path:
        clean_id = self._sanitize_workspace_id(workspace_id)
        ws_dir = (self.base_dir / clean_id).resolve()
        # Verify it stays strictly within base_dir
        if not str(ws_dir).startswith(str(self.base_dir)):
            raise PathTraversalError("Workspace path escape attempt detected.")
        return ws_dir

    def create_workspace(
        self,
        name: str,
        description: str = "",
        classification: str = "RESTRICTED",
        owner: str = "officer_sharma",
        workspace_id: Optional[str] = None
    ) -> Dict[str, Any]:
        if not workspace_id:
            workspace_id = f"WS-{uuid.uuid4().hex[:8].upper()}"
        
        ws_dir = self.get_workspace_dir(workspace_id)
        if ws_dir.exists():
            raise WorkspaceError(f"Workspace {workspace_id} already exists.")

        ws_dir.mkdir(parents=True, exist_ok=False)
        for sub in SAFE_SUBFOLDERS:
            (ws_dir / sub).mkdir(parents=True, exist_ok=True)

        meta = {
            "workspace_id": workspace_id,
            "name": name,
            "description": description,
            "classification": classification,
            "owner": owner,
            "status": "ACTIVE",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        meta_file = ws_dir / "workspace.json"
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        return meta

    def get_workspace(self, workspace_id: str) -> Optional[Dict[str, Any]]:
        ws_dir = self.get_workspace_dir(workspace_id)
        meta_file = ws_dir / "workspace.json"
        if not meta_file.exists():
            return None
        with open(meta_file, "r", encoding="utf-8") as f:
            return json.load(f)

    def list_workspaces(self) -> List[Dict[str, Any]]:
        results = []
        for p in self.base_dir.iterdir():
            if p.is_dir():
                meta_file = p / "workspace.json"
                if meta_file.exists():
                    try:
                        with open(meta_file, "r", encoding="utf-8") as f:
                            results.append(json.load(f))
                    except Exception:
                        pass
        return sorted(results, key=lambda x: x.get("updated_at", ""), reverse=True)

    def archive_workspace(self, workspace_id: str) -> Dict[str, Any]:
        ws = self.get_workspace(workspace_id)
        if not ws:
            raise WorkspaceError(f"Workspace {workspace_id} not found.")
        ws["status"] = "ARCHIVED"
        ws["updated_at"] = datetime.now(timezone.utc).isoformat()
        ws_dir = self.get_workspace_dir(workspace_id)
        with open(ws_dir / "workspace.json", "w", encoding="utf-8") as f:
            json.dump(ws, f, indent=2)
        return ws

    def resolve_safe_path(self, workspace_id: str, subfolder: str, filename: str) -> Path:
        """
        Resolves a file path strictly within the workspace's allowed subfolder.
        Rejects directory traversal, symlink escapes, and absolute path injection.
        """
        if subfolder not in SAFE_SUBFOLDERS:
            raise PathTraversalError(f"Invalid workspace subfolder: {subfolder}")

        ws_dir = self.get_workspace_dir(workspace_id)
        if not ws_dir.exists():
            ws_dir.mkdir(parents=True, exist_ok=True)
            for sub in SAFE_SUBFOLDERS:
                (ws_dir / sub).mkdir(parents=True, exist_ok=True)

        target_subfolder = (ws_dir / subfolder).resolve()
        target_subfolder.mkdir(parents=True, exist_ok=True)
        
        # Check filename for traversal attempts
        if ".." in filename or filename.startswith("/") or filename.startswith("\\") or ":" in filename:
            raise PathTraversalError(f"Illegal path characters in filename: {filename}")

        resolved_target = (target_subfolder / filename).resolve()

        # Strict containment check
        if not str(resolved_target).startswith(str(target_subfolder)):
            raise PathTraversalError(f"Path escape attempt blocked: {resolved_target}")

        # Check for symlink escape if file exists
        if resolved_target.is_symlink():
            real_path = Path(os.path.realpath(str(resolved_target)))
            if not str(real_path).startswith(str(target_subfolder)):
                raise PathTraversalError("Symlink pointing outside workspace boundary blocked.")

        return resolved_target

workspace_manager = WorkspaceManager()
