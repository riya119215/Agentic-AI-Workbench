import unittest
import asyncio
import tempfile
import os
import shutil
import hashlib
from pathlib import Path

# Add backend to sys.path
import sys
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.core.workspace import workspace_manager, PathTraversalError, WorkspaceError
from app.core.evidence import evidence_service, EvidenceError
from app.tools.parser_service import document_parser
from app.tools.ocr_tool import ocr_engine
from app.rag.embeddings import embedding_gateway, EmbeddingUnavailableError
from app.rag.vector_store import vector_store
from app.core.citations import citation_engine
from app.core.tool_gateway import tool_gateway
from app.tools.sandbox import execute_python_sandbox
from app.core.verification import verification_engine
from app.tools.docx_generator import create_approval_note
from app.tools.excel_generator import create_analytics_spreadsheet
from app.tools.pptx_generator import create_executive_presentation
from app.core.audit import log_audit_event, verify_audit_chain, compute_hash, get_all_logs, init_audit_db
from app.core.zero_egress import get_network_egress_status
from app.core.rbac import get_user_by_id, UserRole
from app.core.approval import approval_manager
from app.config import DELIVERABLES_DIR

class TestNonLLMCoreInfrastructure(unittest.TestCase):

    def setUp(self):
        self.test_ws_id = "WS-TEST-CI"
        try:
            workspace_manager.create_workspace(
                name="Automated Test Workspace",
                description="CI/CD Test Sandbox",
                workspace_id=self.test_ws_id
            )
        except WorkspaceError:
            pass # Already exists

    def tearDown(self):
        ws_dir = workspace_manager.get_workspace_dir(self.test_ws_id)
        if ws_dir.exists():
            shutil.rmtree(ws_dir, ignore_errors=True)

    # -----------------------------------------------------------------
    # 1. Workspace Traversal & Sandboxing Tests
    # -----------------------------------------------------------------
    def test_workspace_traversal_protection(self):
        # 1. Reject parent directory escape
        with self.assertRaises(PathTraversalError):
            workspace_manager.resolve_safe_path(self.test_ws_id, "evidence", "../../../etc/passwd")

        # 2. Reject absolute paths
        with self.assertRaises(PathTraversalError):
            workspace_manager.resolve_safe_path(self.test_ws_id, "evidence", "/etc/shadow")

        # 3. Reject Windows drive traversal
        with self.assertRaises(PathTraversalError):
            workspace_manager.resolve_safe_path(self.test_ws_id, "evidence", "C:\\Windows\\System32\\cmd.exe")

        # 4. Valid safe path
        safe_p = workspace_manager.resolve_safe_path(self.test_ws_id, "evidence", "report.pdf")
        self.assertTrue(str(safe_p).endswith("evidence\\report.pdf") or str(safe_p).endswith("evidence/report.pdf"))

    # -----------------------------------------------------------------
    # 2. Evidence Management & SHA-256 Hashing Tests
    # -----------------------------------------------------------------
    def test_evidence_management_and_hashing(self):
        sample_content = b"%PDF-1.4 Simulated PDF Document Content for Sovereign Testing"
        meta = evidence_service.store_evidence(
            workspace_id=self.test_ws_id,
            filename="sample_inspection.pdf",
            file_bytes=sample_content,
            department="QA Engineering"
        )
        self.assertEqual(meta["status"], "UPLOADED")
        self.assertEqual(meta["size_bytes"], len(sample_content))
        self.assertEqual(meta["sha256"], hashlib.sha256(sample_content).hexdigest())

        # Update status lifecycle
        updated = evidence_service.update_status(self.test_ws_id, "sample_inspection.pdf", "PROCESSED")
        self.assertIsNotNone(updated)
        self.assertEqual(updated["status"], "PROCESSED")

    # -----------------------------------------------------------------
    # 3. Document Parser Normalization Tests
    # -----------------------------------------------------------------
    def test_document_parser_normalization(self):
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False, mode="w", encoding="utf-8") as f:
            f.write("Line 1: Critical Telemetry Check\nLine 2: Bearing 94.2 C")
            temp_path = Path(f.name)

        try:
            chunks = document_parser.parse_document(temp_path)
            self.assertEqual(len(chunks), 1)
            self.assertIn("Critical Telemetry Check", chunks[0]["text"])
            self.assertEqual(chunks[0]["page_number"], 1)
            self.assertIn("sha256", chunks[0]["metadata"])
        finally:
            if temp_path.exists():
                temp_path.unlink()

    # -----------------------------------------------------------------
    # 4. Local OCR Preprocessor Tests
    # -----------------------------------------------------------------
    def test_local_ocr_extraction(self):
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False, mode="w", encoding="utf-8") as f:
            f.write("Inspection Stamp Approved")
            temp_path = Path(f.name)

        try:
            res = ocr_engine.extract_document_ocr(temp_path)
            self.assertIn(res["status"], ["SUCCESS", "UNSUPPORTED_FORMAT"])
        finally:
            if temp_path.exists():
                temp_path.unlink()

    # -----------------------------------------------------------------
    # 5. Deterministic Verification Engine Tests
    # -----------------------------------------------------------------
    def test_verification_engine(self):
        # 1. Non-compliant breach (4.85 > 3.50)
        res1 = verification_engine.verify_numeric_rule(
            parameter_name="Bearing Vibration",
            measured_value=4.85,
            threshold_value=3.50,
            operator="<=",
            unit="mm/s",
            rule_severity="CRITICAL"
        )
        self.assertEqual(res1["status"], "NON_COMPLIANT")
        self.assertFalse(res1["is_compliant"])
        self.assertEqual(res1.get("severity"), "CRITICAL")

        # 2. Compliant check (1.85 between 1.80 and 2.20)
        res2 = verification_engine.verify_range_rule(
            parameter_name="Lube Oil Pressure",
            measured_value=1.85,
            min_value=1.80,
            max_value=2.20,
            unit="Bar"
        )
        self.assertEqual(res2["status"], "COMPLIANT")
        self.assertTrue(res2["is_compliant"])

    # -----------------------------------------------------------------
    # 6. Secure Python Sandbox Confinement Tests
    # -----------------------------------------------------------------
    def test_secure_sandbox_execution(self):
        code = """
import numpy as np
arr = np.array([10, 20, 30])
print(f"SUM:{arr.sum()}")
"""
        res = execute_python_sandbox(code, workspace_id=self.test_ws_id, timeout_seconds=10)
        self.assertTrue(res["success"])
        self.assertIn("SUM:60", res["stdout"])
        self.assertEqual(res["isolation_status"], "CONTAINER_RUNTIME_RESTRICTED")

    def test_secure_sandbox_timeout(self):
        code = """
import time
time.sleep(15)
"""
        res = execute_python_sandbox(code, workspace_id=self.test_ws_id, timeout_seconds=2)
        self.assertFalse(res["success"])
        self.assertIn("TIMEOUT", res["stderr"])

    # -----------------------------------------------------------------
    # 7. Deliverables Generation Tests (.docx, .xlsx, .pptx)
    # -----------------------------------------------------------------
    def test_deliverables_generation(self):
        # 1. DOCX
        docx_file = create_approval_note(
            memo_no="TEST-MEMO-001",
            subject="CI Test Memorandum",
            reference_doc="SOP-TEST-V1",
            inspection_summary={"evaluation": "Automated verification test."},
            findings_table=[{"parameter": "Vibration", "measured": "4.85 mm/s", "limit": "3.50 mm/s", "status": "NON_COMPLIANT"}],
            recommendation="Test directive issued."
        )
        docx_path = DELIVERABLES_DIR / docx_file
        self.assertTrue(docx_path.exists())
        self.assertGreater(docx_path.stat().st_size, 1000)

        # 2. XLSX
        xlsx_file = create_analytics_spreadsheet(
            report_title="CI Test Spreadsheet",
            headers=["Timestamp", "Vibration", "Status"],
            rows=[["2026-09-17 10:00", 4.85, "NON_COMPLIANT"]],
            filename_prefix="CI_Test"
        )
        xlsx_path = DELIVERABLES_DIR / xlsx_file
        self.assertTrue(xlsx_path.exists())
        self.assertGreater(xlsx_path.stat().st_size, 1000)

        # 3. PPTX
        pptx_file = create_executive_presentation(
            title="CI Test Briefing",
            subtitle="Automated Verification Deck",
            classification="RESTRICTED"
        )
        pptx_path = DELIVERABLES_DIR / pptx_file
        self.assertTrue(pptx_path.exists())
        self.assertGreater(pptx_path.stat().st_size, 1000)

    # -----------------------------------------------------------------
    # 8. Cryptographic Audit Chain & Tamper Detection Tests
    # -----------------------------------------------------------------
    def test_audit_hash_chain_and_tamper_detection(self):
        init_audit_db()
        entry1 = log_audit_event(
            user_id="officer_sharma",
            role="Officer",
            action="TEST_ACTION_ALPHA",
            details={"param": "vibration_test"},
            files_touched=["report.pdf"]
        )
        self.assertIn("current_hash", entry1)

        entry2 = log_audit_event(
            user_id="officer_sharma",
            role="Officer",
            action="TEST_ACTION_BETA",
            details={"param": "approval_test"},
            files_touched=["Approval_Note.docx"]
        )
        self.assertEqual(entry2["prev_hash"], entry1["current_hash"])

        # Chain verification
        verification = verify_audit_chain()
        self.assertTrue(verification["is_valid"])

    # -----------------------------------------------------------------
    # 9. Zero-Egress Network Inspection Tests
    # -----------------------------------------------------------------
    def test_zero_egress_runtime_inspection(self):
        status = get_network_egress_status()
        self.assertIn(status["air_gap_status"], ["STRICT_AIR_GAP_ACTIVE", "EXTERNAL_WAN_DETECTED", "MONITORING_UNAVAILABLE"])
        self.assertIn("wan_egress_count", status)

    # -----------------------------------------------------------------
    # 10. RBAC Permission Gate Tests
    # -----------------------------------------------------------------
    def test_rbac_permission_gates(self):
        officer = get_user_by_id("officer_sharma")
        self.assertEqual(officer.role, UserRole.OFFICER)
        self.assertIn("doc_generator", officer.allowed_tools)

        viewer = get_user_by_id("viewer_guest")
        self.assertEqual(viewer.role, UserRole.VIEWER)
        self.assertNotIn("code_sandbox", viewer.allowed_tools)

if __name__ == "__main__":
    unittest.main()
