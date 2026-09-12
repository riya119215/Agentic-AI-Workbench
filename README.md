# 🚀 SIH26117 – Sovereign On-Premise Agentic AI Workbench

> **Air-Gapped, Zero-Cloud, Multi-Model Sovereign Intelligence Operating System for Defence, Government & Strategic PSUs.**

---

## 🏛️ Enterprise Project Architecture

```
sih-sovereign-ai-workbench/
├── 📁 cli/                         # Enterprise Admin & Operator Terminal CLI
│   ├── sovereign_cli.py            # CLI: air-gap audit, model benchmark, KB ingestion, egress test
│   └── __init__.py
├── 📁 infra/                       # Defense & Air-Gap Deployment Infrastructure
│   ├── docker/                     # Modular multi-stage Dockerfiles (backend, frontend, sandbox)
│   ├── k8s/                        # Air-Gapped Kubernetes & NetworkPolicies (Block WAN 0.0.0.0/0)
│   └── airgap-packaging/          # Offline wheelhouse & local model packaging scripts
├── 📁 backend/                     # Modular Agentic Micro-Engine
│   ├── app/                        # API, Core Agents, Router, RAG, Tools, Security
│   ├── tests/                      # Enterprise Test Suites (RBAC, Sandbox, Zero-Egress, Deliverables)
│   └── requirements.txt
├── 📁 frontend/                    # High-Tech Tactical React Dashboard
│   ├── src/ (components, modules, hooks, lib)
│   └── package.json
├── 📁 datasets/                    # Sovereign Datasets & Sample Scenarios
│   ├── defence_sops/               # Defence & Turbine Maintenance Standards
│   ├── sensor_telemetry/           # Railway axle vibration datasets
│   └── inspection_scans/           # Scanned reports with OCR ground truth
├── 📁 evals/                       # Sovereign Model & RAG Benchmark Harness
│   ├── rag_evaluator.py            # Faithfulness, context recall, citation verification
│   └── latency_benchmark.py        # Token/sec & VRAM profiler for on-premise hardware
├── 📁 docs/                        # Formal Government & Defense Specifications
│   ├── ARCHITECTURE.md             # Multi-Model Sovereign Architecture Spec
│   ├── AIRGAP_SECURITY_MATRIX.md   # Zero-Egress and CERT-In / ISO Compliance
│   ├── API_SPECIFICATION.md        # REST & WebSocket Interface Reference
│   └── SIH_JURY_PITCH_GUIDE.md     # 5-Minute Live Demonstration & Pitch Script
├── run_workbench.bat               # 1-Click Windows Unified Launcher
└── docker-compose.yml              # Offline Compose Stack
```

---

## 🌟 Key Architectural Pillars

1. **Model Auto-Router Engine (`model_router.py`)**:
   - Dynamically analyzes prompts & attachments to select specialized open-weight models:
     - 👁️ **Vision / Scanned Docs / Blueprints:** `qwen2-vl:7b` / `minicpm-v`
     - 💻 **Code Synthesis & Data Analytics:** `qwen2.5-coder:7b`
     - 🧠 **Government Policy & Reasoning:** `qwen2.5:7b` / `llama3.1:8b`
     - 🌐 **Embeddings:** `bge-m3:latest` (Ollama Local)

2. **Multimodal Local RAG & Document Intelligence (`parser.py`, `vector_store.py`)**:
   - Parses Scanned PDFs, Images, Word, and Text documents with OCR (`PyMuPDF` + `Tesseract`).
   - Local semantic vector search via **ChromaDB** with exact page and clause-level citations.

3. **Real Deliverables Suite (`docx_generator.py`, `excel_generator.py`)**:
   - Generates formal Government of India / PSU Note Sheets & Approval Memorandums (`.docx`) with regulatory headers, discrepancy tables, and digital signature blocks.
   - Generates styled analytical spreadsheets (`.xlsx`) and high-resolution telemetry plots (`.png`).

4. **Isolated Code Sandbox (`sandbox.py`)**:
   - Executes AI-generated Python analytics inside an isolated workspace with memory/timeout caps and network sockets disabled (`socket.socket = None`).

5. **Role-Based Access Control (RBAC) & Cryptographic Audit Trail (`rbac.py`, `audit.py`)**:
   - Pre-configured clearance roles: `Admin` (Top Secret), `Officer` (Restricted Official), `Analyst` (Confidential), `Viewer` (Unclassified).
   - Immutable **SHA-256 Hash Chained** audit logs in SQLite/PostgreSQL for tamper-evident government verification.

6. **Zero-Egress Guardian (`zero_egress.py`)**:
   - Real-time socket sniffer verifying **0 Outbound WAN packets**. Proves 100% air-gap compliance on stage.

---

## 💻 Quick Start & Running Locally

### 1. Unified 1-Click Launch (Windows)
```powershell
.\run_workbench.bat
```

### 2. Manual Terminal Launch

#### Backend API (Port 8000)
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend Dashboard (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```

---

## 🛡️ Enterprise CLI Operations (`cli/sovereign_cli.py`)

```powershell
# Check System Status & Local Models
python cli/sovereign_cli.py status

# Inspect Network Sockets for Zero-Egress Compliance
python cli/sovereign_cli.py egress

# Verify Cryptographic SHA-256 Audit Trail Chaining
python cli/sovereign_cli.py audit verify

# Ingest Sovereign Documents with Department Clearance
python cli/sovereign_cli.py ingest datasets/defence_sops/SOP_TURBINE_MAINTENANCE_V4.txt --clearance RESTRICTED

# Execute Flagship Demos via Terminal
python cli/sovereign_cli.py demo 1
python cli/sovereign_cli.py demo 2
python cli/sovereign_cli.py demo 3
```

---

## 📊 Evaluation & Latency Benchmarks (`evals/`)

```powershell
# Run RAG Groundedness & Hallucination Benchmark
python evals/rag_evaluator.py

# Run Local Hardware Profiler (Routing Latency, Sandbox Latency, SHA-256 Throughput)
python evals/latency_benchmark.py
```

---

## 📦 Air-Gap Packaging & Offline Checksums (`infra/`)

```powershell
# Create Offline Air-Gap Signed Manifest
python infra/airgap-packaging/package_offline_bundle.py

# Verify Checksums Before Booting on Defence Infrastructure
python infra/airgap-packaging/verify_checksums.py
```

---

## 🏆 SIH Jury Checklist
- [x] 100% Air-Gapped / Zero External Cloud APIs
- [x] Dynamic Model Auto-Routing
- [x] Scanned Document & Multimodal RAG
- [x] Isolated Python Code Sandbox
- [x] Authentic File Deliverables (`.docx`, `.xlsx`, `.png`)
- [x] Tamper-Evident SHA-256 Chained Audit Trail
- [x] Live Zero-Egress Network Status Radar
- [x] Enterprise Operator CLI (`sovereign-cli`)
- [x] Defense-Grade Documentation & Compliance Matrices