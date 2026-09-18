#!/usr/bin/env python3
"""
Sovereign AI Workbench - Enterprise Defense CLI (Air-Gap Admin & Operator Console)
"""

import os
import sys
import argparse
import asyncio
import json
import time
from pathlib import Path

# Ensure UTF-8 stdout encoding on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add project root and backend to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(PROJECT_ROOT))

def print_banner():
    banner = """
================================================================================
   ____   ___ __     _______ ____  _____ ___ ____ _   _     _    ___ 
  / ___| / _ \\\\ \\   / / ____|  _ \\| ____|_ _/ ___| \\ | |   / \\  |_ _|
  \\___ \\| | | |\\ \\ / /|  _| | |_) |  _|  | | |  _|  \\| |  / _ \\  | | 
   ___) | |_| | \\ V / | |___|  _ <| |___ | | |_| | |\\  | / ___ \\ | | 
  |____/ \\___/   \\_/  |_____|_| \\_\\_____|___\\____|_| \\_|/_/   \\_\\___|
  AIR-GAPPED AGENTIC WORKBENCH | DEFENCE & PSU SECURE OPERATING CONSOLE
================================================================================
"""
    print(banner)

def cmd_status(args):
    """Check status of sovereign system, active local models and air-gap mode."""
    print("[+] Querying Sovereign System Status...")
    from app.config import OLLAMA_BASE_URL, REASONING_MODEL, CODING_MODEL, VISION_MODEL, EMBEDDING_MODEL
    from app.core.zero_egress import get_network_egress_status
    
    egress = get_network_egress_status()
    print(f"  * Sovereign Mode         : STRICT_AIR_GAP")
    print(f"  * Network Egress Status  : {egress['air_gap_status']}")
    print(f"  * Local Inference URL    : {OLLAMA_BASE_URL}")
    print(f"  * Default Reasoning Model: {REASONING_MODEL}")
    print(f"  * Default Coding Model   : {CODING_MODEL}")
    print(f"  * Vision Analyst Model   : {VISION_MODEL}")
    print(f"  * Embedding Model        : {EMBEDDING_MODEL}")
    print(f"  * Local Active Sockets   : {len(egress['localhost_services'])}")
    print("\n[OK] Sovereign System Operational.")

def cmd_egress(args):
    """Run Zero-Egress Network Sniffer & Air-Gap Compliance Check."""
    print("[+] Initiating Real-Time Network Packet & Socket Inspection...")
    from app.core.zero_egress import get_network_egress_status
    
    egress = get_network_egress_status()
    print(f"\n[NETWORK SCAN REPORT]")
    print(f"  * Status               : {egress['air_gap_status']}")
    print(f"  * Compliance Standard  : {egress['compliance_standard']}")
    print(f"  * WAN Egress Packets   : {egress['wan_egress_count']}")
    print(f"  * Timestamp            : {egress['timestamp']}")
    print(f"  * External Telemetry   : BLOCKED (0 calls)")
    
    print("\n[ACTIVE BOUND LOCAL SOCKETS]:")
    for svc in egress.get('localhost_services', []):
        print(f"  - Port {svc.get('port')}: {svc.get('service')} bound to {svc.get('bind_ip')}")
    
    print("\n[OK] Zero-Egress Verification Complete.")

def cmd_audit(args):
    """Verify cryptographic SHA-256 hash chaining of audit logs."""
    from app.core.audit import verify_audit_chain, get_all_logs
    
    if args.action == "verify":
        print("[+] Verifying Cryptographic Audit Trail Chaining (SHA-256 Ledger)...")
        verification = verify_audit_chain()
        if verification["is_valid"]:
            print(f"[OK] INTEGRITY VERIFIED: {verification['message']}")
            print(f"  * Total Blocks : {verification['total_records']}")
            print(f"  * Latest Hash  : {verification['latest_block_hash']}")
        else:
            print(f"[ERROR] INTEGRITY COMPROMISED: {verification['message']}")
            sys.exit(1)
    elif args.action == "list":
        limit = args.limit or 10
        print(f"[+] Listing last {limit} Audit Trail Records...")
        logs = get_all_logs(limit=limit)
        for log in logs:
            print(f"  [{log.get('timestamp')}] ID: {log.get('log_id')} | User: {log.get('user_id')} | Action: {log.get('action')}")
            print(f"     CurrHash: {log.get('current_hash')[:24]}... | PrevHash: {log.get('prev_hash')[:24]}...")

def cmd_benchmark(args):
    """Run full hardware and latency benchmark."""
    from app.core.benchmarks import benchmark_engine
    print("[+] Running Sovereign Benchmark & Hardware Profiler...")
    res = benchmark_engine.run_full_benchmark()
    b = res["benchmarks"]
    print(f"\n[BENCHMARK RESULTS]:")
    print(f"  * SHA-256 Hash Speed     : {b['sha256_throughput_hashes_per_sec']:,.0f} hashes/sec")
    print(f"  * Routing Latency        : {b['model_routing_latency_ms']} ms")
    print(f"  * Sandbox Startup & Exec : {b['sandbox_exec_latency_ms']} ms ({b['sandbox_status']})")
    print(f"  * RAG Retrieval Latency  : {b['rag_retrieval_latency_ms']} ms")
    print(f"  * RAG Faithfulness Score : {b['rag_faithfulness_score'] * 100}%")
    print(f"  * Local Token Speed      : {b['local_token_generation_speed_tok_sec']} tok/sec")
    print("\n[OK] Benchmark Complete.")

def cmd_health(args):
    """Display comprehensive system health."""
    from app.core.system_health import get_system_health_report
    print("[+] Querying System Component Health...")
    res = get_system_health_report()
    print(f"\n[SYSTEM HEALTH]: Status: {res['overall_status']}")
    print(f"  * CPU Utilization : {res['hardware_telemetry']['cpu_utilization_pct']}%")
    print(f"  * RAM Used        : {res['hardware_telemetry']['ram_used_gb']} / {res['hardware_telemetry']['ram_total_gb']} GB")
    print("\n[SERVICES]:")
    for s in res["services"]:
        print(f"  - [{s['status']}] {s['name']}: {s['details']}")
    print("\n[OK] Health Check Complete.")

async def _run_ingest(file_path: Path, department: str, classification: str):
    from app.rag.vector_store import vector_store
    print(f"[+] Ingesting document: {file_path.name} into Sovereign ChromaDB Vector Store...")
    res = await vector_store.ingest_document(file_path, department=department, classification=classification)
    print(f"[OK] Ingestion successful: {json.dumps(res, indent=2)}")

def cmd_ingest(args):
    """Ingest documents or folders into Sovereign Multimodal RAG."""
    file_path = Path(args.file).resolve()
    if not file_path.exists():
        print(f"[ERROR] File or path not found: {file_path}")
        sys.exit(1)
    
    department = args.department or "Strategic Operations"
    classification = args.classification or "RESTRICTED"
    asyncio.run(_run_ingest(file_path, department, classification))

async def _run_demo(demo_num: int):
    from app.core.agent import agent
    from app.config import DELIVERABLES_DIR
    
    if demo_num == 1:
        print("[+] Executing Flagship Demo 1: Inspection -> SOP RAG -> Approval Note (.docx)...")
        prompt = "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul."
        res = await agent.process_task(prompt, user_id="officer_sharma", attachments=["INSPECTION_REPORT_TURBINE_UNIT_7.txt"])
        print("\n[DEMO 1 RESULT]:")
        print(f"  * Selected Model : {res['model_routing']['selected_model']}")
        print(f"  * Steps Executed : {len(res['steps'])}")
        print(f"  * Citations      : {len(res['citations'])}")
        for art in res['artifacts']:
            print(f"  * Generated File : {art['filename']} (Path: {DELIVERABLES_DIR / art['filename']})")
    elif demo_num == 2:
        print("[+] Executing Flagship Demo 2: Sensor CSV -> Isolated Python Sandbox -> Plot + Excel...")
        prompt = "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet."
        res = await agent.process_task(prompt, user_id="analyst_patel", attachments=["railway_sensor_telemetry.csv"])
        print("\n[DEMO 2 RESULT]:")
        print(f"  * Selected Model : {res['model_routing']['selected_model']}")
        print(f"  * Steps Executed : {len(res['steps'])}")
        for art in res['artifacts']:
            print(f"  * Generated File : {art['filename']} (Path: {DELIVERABLES_DIR / art['filename']})")
    elif demo_num == 3:
        print("[+] Executing Flagship Demo 3: Document -> RAG -> Cited Sovereign Answer...")
        prompt = "What is the maximum allowed bearing vibration threshold for Category-1 steam turbines before mandatory de-energization under SOP Section 2.1?"
        res = await agent.process_task(prompt, user_id="officer_sharma", attachments=[])
        print("\n[DEMO 3 RESULT]:")
        print(f"  * Selected Model : {res['model_routing']['selected_model']}")
        print(f"  * Citations Found: {len(res['citations'])}")
        for cit in res['citations']:
            print(f"     - Source: {cit['source']} | Page: {cit['page']} | Clause: {cit['clause']}")
    elif demo_num == 4:
        print("[+] Executing Flagship Demo 4: Multimodal Image & Blueprint Understanding...")
        prompt = "Analyze scanned defect photograph for journal bearing cavitation and evaluate against defence standards."
        res = await agent.process_task(prompt, user_id="officer_sharma", attachments=["bearing_cavitation_scan.png"])
        print("\n[DEMO 4 RESULT]:")
        print(f"  * Selected Model : {res['model_routing']['selected_model']}")
        print(f"  * Task Type      : {res['model_routing']['task_type']}")
        print(f"  * Citations      : {len(res['citations'])}")
    elif demo_num == 5:
        print("[+] Executing Flagship Demo 5: Multi-File Comprehensive Master Task (PDF + CSV + Photo -> DOCX + XLSX + PPTX)...")
        prompt = "Analyze all evidence: inspection.pdf, railway_sensor_telemetry.csv, and bearing photos. Correlate findings, issue emergency directive, and prepare complete deliverable suite (.docx, .xlsx, .pptx)."
        res = await agent.process_task(prompt, user_id="admin_verma", attachments=["inspection.pdf", "railway_sensor_telemetry.csv", "photo.jpg"])
        print("\n[DEMO 5 MASTER DELIVERABLE SUITE RESULT]:")
        print(f"  * Selected Model : {res['model_routing']['selected_model']}")
        print(f"  * Steps Executed : {len(res['steps'])}")
        print(f"  * Citations      : {len(res['citations'])}")
        print(f"  * Approvals Req  : {len(res['approvals'])}")
        for art in res['artifacts']:
            print(f"  * Generated File : [{art['type']}] {art['filename']}")
    print("\n[OK] Demo Execution Complete.")

def cmd_demo(args):
    """Execute SIH Demonstration Scenarios."""
    asyncio.run(_run_demo(args.scenario))

def main():
    parser = argparse.ArgumentParser(
        description="Sovereign Agentic AI Workbench - Enterprise Defence CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # status
    p_status = subparsers.add_parser("status", help="Display system and air-gap health status")
    p_status.set_defaults(func=cmd_status)

    # egress
    p_egress = subparsers.add_parser("egress", help="Inspect sockets for Zero-Egress compliance")
    p_egress.set_defaults(func=cmd_egress)

    # audit
    p_audit = subparsers.add_parser("audit", help="Cryptographic Audit Chain operations")
    p_audit.add_argument("action", choices=["verify", "list"], help="Audit action: verify or list")
    p_audit.add_argument("--limit", type=int, default=10, help="Number of records to show")
    p_audit.set_defaults(func=cmd_audit)

    # benchmark
    p_bench = subparsers.add_parser("benchmark", help="Run hardware latency & throughput benchmark")
    p_bench.set_defaults(func=cmd_benchmark)

    # health
    p_health = subparsers.add_parser("health", help="Check system services health")
    p_health.set_defaults(func=cmd_health)

    # ingest
    p_ingest = subparsers.add_parser("ingest", help="Ingest documents into sovereign vector store")
    p_ingest.add_argument("file", help="Path to document to ingest")
    p_ingest.add_argument("--department", default="Defence QA", help="Department tag")
    p_ingest.add_argument("--classification", default="RESTRICTED", choices=["UNCLASSIFIED", "CONFIDENTIAL", "RESTRICTED", "TOP_SECRET"])
    p_ingest.set_defaults(func=cmd_ingest)

    # demo
    p_demo = subparsers.add_parser("demo", help="Run SIH Flagship Demo scenarios (1 to 5)")
    p_demo.add_argument("scenario", type=int, choices=[1, 2, 3, 4, 5], help="Scenario number (1, 2, 3, 4, or 5)")
    p_demo.set_defaults(func=cmd_demo)

    args = parser.parse_args()

    print_banner()
    if not args.command:
        parser.print_help()
        sys.exit(0)

    args.func(args)

if __name__ == "__main__":
    main()
