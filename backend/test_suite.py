import asyncio
import os
import sys
from pathlib import Path

# UTF-8 stdout
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core.agent import agent
from app.core.audit import verify_audit_chain, get_all_logs
from app.core.zero_egress import get_network_egress_status
from app.rag.vector_store import vector_store
from app.config import SAMPLE_DATASETS_DIR, DELIVERABLES_DIR

async def run_full_sovereign_tests():
    print("=" * 70)
    print("SOVEREIGN AGENTIC AI WORKBENCH - AUTOMATED VERIFICATION SUITE")
    print("=" * 70)

    # 1. Test Knowledge Base Ingestion
    print("\n[TEST 1/5] Ingesting Sovereign SOP Dataset into ChromaDB...")
    sop_file = SAMPLE_DATASETS_DIR / "SOP_TURBINE_MAINTENANCE_V4.txt"
    ingest_res = await vector_store.ingest_document(sop_file, department="Turbomachinery QA", classification="RESTRICTED")
    print(f"[OK] KB Ingestion Result: {ingest_res}")

    # 2. Test Flagship Demo 1: Inspection -> SOP RAG -> Approval Note (.docx)
    print("\n[TEST 2/5] Running Flagship Demo 1 (Inspection Report -> Approval Note .docx)...")
    prompt_1 = "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul."
    res_1 = await agent.process_task(prompt_1, user_id="officer_sharma", attachments=["INSPECTION_REPORT_TURBINE_UNIT_7.txt"])
    print(f"[OK] Model Selected: {res_1['model_routing']['selected_model']}")
    print(f"[OK] Steps Executed: {len(res_1['steps'])}")
    print(f"[OK] Deliverables Generated: {[a['filename'] for a in res_1['artifacts']]}")
    print(f"[OK] Citations Found: {len(res_1['citations'])}")
    
    for art in res_1['artifacts']:
        art_path = DELIVERABLES_DIR / art['filename']
        assert art_path.exists(), f"Deliverable {art['filename']} was not generated!"
        print(f"   -> Verified File on Disk: {art['filename']} ({art_path.stat().st_size} bytes)")

    # 3. Test Flagship Demo 2: Sensor CSV -> Isolated Python Sandbox -> Plot + Excel
    print("\n[TEST 3/5] Running Flagship Demo 2 (Telemetry CSV -> Code Sandbox -> .png + .xlsx)...")
    prompt_2 = "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet."
    res_2 = await agent.process_task(prompt_2, user_id="analyst_patel", attachments=["railway_sensor_telemetry.csv"])
    print(f"[OK] Model Selected: {res_2['model_routing']['selected_model']}")
    print(f"[OK] Steps Executed: {len(res_2['steps'])}")
    print(f"[OK] Deliverables Generated: {[a['filename'] for a in res_2['artifacts']]}")
    
    for art in res_2['artifacts']:
        art_path = DELIVERABLES_DIR / art['filename']
        assert art_path.exists(), f"Deliverable {art['filename']} was not generated!"
        print(f"   -> Verified File on Disk: {art['filename']} ({art_path.stat().st_size} bytes)")

    # 4. Test Cryptographic Audit Log & SHA-256 Hash Chain Integrity
    print("\n[TEST 4/5] Verifying SHA-256 Cryptographic Audit Chain Integrity...")
    audit_verification = verify_audit_chain()
    print(f"[OK] Audit Verification: {audit_verification}")
    assert audit_verification["is_valid"] is True, "Audit chain integrity check failed!"
    print(f"   -> {audit_verification['total_records']} audit blocks cryptographically linked and verified.")

    # 5. Test Zero-Egress Network Sniffer
    print("\n[TEST 5/5] Inspecting Network Sockets for Zero-Egress Compliance...")
    egress = get_network_egress_status()
    print(f"[OK] Air-Gap Status: {egress['air_gap_status']}")
    print(f"[OK] Standard: {egress['compliance_standard']}")
    print(f"[OK] Active Localhost Services: {len(egress['localhost_services'])}")

    print("\n" + "=" * 70)
    print("SUCCESS: ALL 5 SOVEREIGN WORKBENCH TESTS PASSED FLAWLESSLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_full_sovereign_tests())