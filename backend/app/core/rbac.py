from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class UserRole(str, Enum):
    ADMIN = "Admin"
    OFFICER = "Officer"
    ANALYST = "Analyst"
    VIEWER = "Viewer"

class UserProfile(BaseModel):
    user_id: str
    name: str
    role: UserRole
    department: str
    clearance_level: str
    allowed_tools: List[str]

ROLE_PERMISSIONS = {
    UserRole.ADMIN: {
        "tools": ["all", "doc_generator", "excel_generator", "code_sandbox", "ocr_tool", "rag_search", "audit_verify", "model_override"],
        "max_clearance": "TOP_SECRET",
        "can_generate_deliverables": True,
        "can_run_sandbox": True
    },
    UserRole.OFFICER: {
        "tools": ["doc_generator", "excel_generator", "ocr_tool", "rag_search"],
        "max_clearance": "RESTRICTED_OFFICIAL",
        "can_generate_deliverables": True,
        "can_run_sandbox": False
    },
    UserRole.ANALYST: {
        "tools": ["excel_generator", "code_sandbox", "ocr_tool", "rag_search"],
        "max_clearance": "CONFIDENTIAL",
        "can_generate_deliverables": True,
        "can_run_sandbox": True
    },
    UserRole.VIEWER: {
        "tools": ["rag_search"],
        "max_clearance": "UNCLASSIFIED",
        "can_generate_deliverables": False,
        "can_run_sandbox": False
    }
}

DEFAULT_USERS = [
    UserProfile(user_id="officer_sharma", name="Col. R. Sharma", role=UserRole.OFFICER, department="Quality Assurance & Inspection", clearance_level="RESTRICTED_OFFICIAL", allowed_tools=ROLE_PERMISSIONS[UserRole.OFFICER]["tools"]),
    UserProfile(user_id="admin_verma", name="Dr. A. Verma", role=UserRole.ADMIN, department="Sovereign AI Operations", clearance_level="TOP_SECRET", allowed_tools=ROLE_PERMISSIONS[UserRole.ADMIN]["tools"]),
    UserProfile(user_id="analyst_patel", name="P. Patel", role=UserRole.ANALYST, department="Telemetry & Predictive Analytics", clearance_level="CONFIDENTIAL", allowed_tools=ROLE_PERMISSIONS[UserRole.ANALYST]["tools"]),
    UserProfile(user_id="viewer_guest", name="Trainee Desk", role=UserRole.VIEWER, department="General Inquiries", clearance_level="UNCLASSIFIED", allowed_tools=ROLE_PERMISSIONS[UserRole.VIEWER]["tools"]),
]

def get_user_by_id(user_id: str) -> Optional[UserProfile]:
    for u in DEFAULT_USERS:
        if u.user_id == user_id:
            return u
    return DEFAULT_USERS[0] # Default fallback

def check_user_permission(user_id: str, tool_name: str) -> bool:
    user = get_user_by_id(user_id)
    if not user:
        return True
    perms = ROLE_PERMISSIONS.get(user.role, {}).get("tools", [])
    return "all" in perms or tool_name in perms or tool_name == "all"

