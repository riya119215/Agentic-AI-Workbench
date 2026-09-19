import asyncio
import json
import hashlib
import time
import sys
from pathlib import Path
from datetime import datetime, timezone

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.router import router
from app.core.model_manager import model_manager
from app.core.zero_egress import get_network_egress_status
from app.tools.ocr_tool import ocr_engine
from app.tools.parser_service import parse_document
from app.tools.sandbox import execute_python_sandbox
from app.core.agent_loop import run_agent_loop_stream
from app.core.audit import record_audit_event, get_all_logs, verify_audit_chain, compute_hash

async def run_master_rehearsal():
    print("=" * 80)
    print("SIH26117 PHASE 3 MASTER REHEARSAL & GAP VERIFICATION PROOF")
    print("=" * 80)

    # -------------------------------------------------------------
    # 1. Zero-Egress Network Check
    # -------------------------------------------------------------
    print("\n[STEP 1: ZERO-EGRESS & AIR-GAP TELEMETRY CHECK]")
    egress_info = get_network_egress_status(scoped_to_workbench=True)
    print(f"Air-Gap Status: {egress_info.get('air_gap_status')}")
    print(f"Local Services Bound: {len(egress_info.get('localhost_services', []))}")
    print(f"Outbound WAN Egress Sockets: {egress_info.get('wan_egress_count', 0)}")
    assert egress_info.get("wan_egress_count", 0) == 0, "WAN egress detected!"
    print(">>> ZERO WAN EGRESS LIVE CONFIRMED (0 external sockets).")

    # -------------------------------------------------------------
    # 2. GAP 1: Real Scanned Document / Image & Engineering Drawing End-to-End
    # -------------------------------------------------------------
    print("\n[STEP 2: GAP 1 — REAL SCANNED IMAGE & DRAWING OCR RUN]")
    scan_png = Path("e:/Agentic AI/datasets/inspection_scans/TURBINE_BEARING_SCAN_UNIT_7.png")
    drawing_png = Path("e:/Agentic AI/datasets/inspection_scans/BEARING_CAVITATION_DRAWING_UNIT_7.png")
    
    # 2a. Real Scanned Metrology Report OCR
    ocr_scan_res = ocr_engine.extract_document_ocr(scan_png)
    print(f"File: {scan_png.name} | SHA-256: {ocr_scan_res['pages'][0]['source_hash'][:16]}...")
    print(f"OCR Engine: {ocr_scan_res['pages'][0]['engine']} | Confidence: {ocr_scan_res['pages'][0]['confidence']}")
    print("RAW EXTRACTED OCR TEXT FROM SCANNED REPORT:")
    print("-" * 60)
    print(ocr_scan_res['pages'][0]['text'][:450] + "\n...")
    print("-" * 60)

    # 2b. Engineering Drawing OCR
    ocr_dwg_res = ocr_engine.extract_document_ocr(drawing_png)
    print(f"\nFile: {drawing_png.name} | SHA-256: {ocr_dwg_res['pages'][0]['source_hash'][:16]}...")
    print("RAW EXTRACTED OCR TEXT FROM ENGINEERING DRAWING:")
    print("-" * 60)
    print(ocr_dwg_res['pages'][0]['text'])
    print("-" * 60)

    # 2c. Multimodal Loop Execution with Real Scanned PNG
    print("\n[STEP 2c: MULTIMODAL AGENT STREAM WITH SCANNED IMAGE ATTACHMENT]")
    events = []
    async for event in run_agent_loop_stream(
        prompt="Analyze this visual metrology scan for Unit 7 Turbine against SOP standards.",
        attachments=["TURBINE_BEARING_SCAN_UNIT_7.png"],
        user_id="officer_sharma",
        clearance="RESTRICTED"
    ):
        events.append(event)
        etype = event.get("type")
        if etype in ["model_selected", "finding", "deliverable"]:
            print(f"-> STREAM EVENT [{etype.upper()}]: {json.dumps(event, default=str)}")

    # -------------------------------------------------------------
    # 3. GAP 2: Sandbox Isolation Adversarial Enforcement
    # -------------------------------------------------------------
    print("\n[STEP 3: GAP 2 — MULTI-LAYER SANDBOX ADVERSARIAL TEST]")
    
    # Attempt 1: Direct Python Socket
    s_res1 = execute_python_sandbox("import socket\ns = socket.socket()\ns.connect(('1.1.1.1', 80))\nprint('BREACH')")
    print(f"Attempt 1 (socket.socket.connect): Exit Code {s_res1['exit_code']} | Caught: {s_res1['stderr'].strip()}")
    assert "PermissionError: NETWORK_BLOCKED" in s_res1["stderr"]

    # Attempt 2: Subprocess curl bypass
    s_res2 = execute_python_sandbox("import subprocess\nsubprocess.run(['curl', 'http://1.1.1.1'])\nprint('BREACH')")
    print(f"Attempt 2 (subprocess curl): Exit Code {s_res2['exit_code']} | Caught: {s_res2['stderr'].strip()}")
    assert "AIR_GAP_ENFORCED" in s_res2["stderr"]

    # -------------------------------------------------------------
    # 4. GAP 3: Dynamic Model Registration & Priority Selection
    # -------------------------------------------------------------
    print("\n[STEP 4: GAP 3 — DYNAMIC MODEL REGISTRATION & ROUTING SELECTION]")
    m_reg = model_manager.add_model({
        "id": "qwen2.5-coder:14b-enterprise",
        "name": "Qwen 2.5 Coder 14B Enterprise",
        "task_type": "Code Generation & Sandbox",
        "category": "code",
        "is_preferred": True,
        "size_gb": 8.9,
        "vram_pct": 62
    })
    print(f"Dynamically Registered Model: {m_reg['id']} (is_preferred={m_reg.get('is_preferred')})")
    
    routed = router.classify_and_route("Generate telemetry evaluation Python code for turbine bearing.")
    print(f"General Code Task Routed To: {routed['selected_model']}")
    print(f"Routing Rationale: {routed['rationale']}")
    assert routed["selected_model"] == "qwen2.5-coder:14b-enterprise", "Router failed to select newly registered model!"

    # -------------------------------------------------------------
    # 5. Cryptographic Audit Ledger Block Recomputation
    # -------------------------------------------------------------
    print("\n[STEP 5: CRYPTOGRAPHIC AUDIT LEDGER PROVENANCE]")
    chain_status = verify_audit_chain()
    print(f"Audit Chain Valid: {chain_status['is_valid']}")
    print(f"Total Blocks: {chain_status.get('total_records')}")
    print(f"Message: {chain_status.get('message')}")
    assert chain_status["is_valid"] is True, "Audit chain integrity failed!"
    print(">>> CRYPTOGRAPHIC AUDIT LEDGER MATHEMATICALLY VERIFIED.")

    print("\n" + "=" * 80)
    print(">>> ALL 3 GAPS CLOSED & REHEARSAL VERIFICATION 100% COMPLETE! <<<")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(run_master_rehearsal())
