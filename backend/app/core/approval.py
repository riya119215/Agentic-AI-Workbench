import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel

class ApprovalRequest(BaseModel):
    request_id: str
    task_id: str
    action_type: str # 'OFFICIAL_DELIVERABLE_GENERATION', 'SANDBOX_CODE_EXECUTION', 'PROTECTED_DOCUMENT_MODIFY'
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
    Ensures autonomous agents pause before executing sensitive operations until approved.
    """
    def __init__(self):
        self._requests: Dict[str, Dict[str, Any]] = {}

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
        req = {
            "request_id": req_id,
            "task_id": task_id,
            "action_type": action_type,
            "title": title,
            "description": description,
            "classification": classification,
            "requested_by": requested_by,
            "status": initial_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {}
        }
        self._requests[req_id] = req
        return req

    def get_pending_requests(self) -> List[Dict[str, Any]]:
        return [r for r in self._requests.values() if r["status"] == "PENDING"]

    def get_all_requests(self) -> List[Dict[str, Any]]:
        return list(self._requests.values())

    def get_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        return self._requests.get(request_id)

    def respond_to_request(self, request_id: str, approved: bool, user_id: str = "officer_sharma") -> Optional[Dict[str, Any]]:
        if request_id in self._requests:
            self._requests[request_id]["status"] = "APPROVED" if approved else "REJECTED"
            self._requests[request_id]["resolved_by"] = user_id
            self._requests[request_id]["resolved_at"] = datetime.now(timezone.utc).isoformat()
            return self._requests[request_id]
        return None

approval_manager = HumanApprovalManager()
