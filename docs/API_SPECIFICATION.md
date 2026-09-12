# 📡 Sovereign Agentic AI Workbench: API Specification

The backend exposes a high-performance REST API built on FastAPI.

**Base URL:** `http://127.0.0.1:8000`

---

## 1. Chat & Agentic Execution

### `POST /api/chat/task`
Dispatches a user goal to the autonomous Sovereign Agent.

**Request Body:**
```json
{
  "prompt": "Analyze Unit 7 inspection report and draft approval note.",
  "user_id": "officer_sharma",
  "attachments": ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
}
```

**Response:**
```json
{
  "status": "COMPLETED",
  "model_routing": {
    "selected_model": "qwen2.5:7b",
    "rationale": "Policy reasoning and official document synthesis"
  },
  "steps": [
    { "step": 1, "action": "OCR & Document Parsing", "status": "DONE" },
    { "step": 2, "action": "SOP Vector Cross-Query", "status": "DONE" },
    { "step": 3, "action": "Generate Note Sheet .docx", "status": "DONE" }
  ],
  "citations": [
    { "doc": "SOP-TURB-IND-2026-V4", "clause": "Section 2.1", "page": 1 }
  ],
  "artifacts": [
    { "filename": "Approval_Note_DEF_IND_QA-88_2026_UNIT-07.docx", "type": "docx" }
  ]
}
```

---

## 2. Document Intelligence & Knowledge Base

### `POST /api/docs/ingest`
Ingests a document (PDF, TXT, DOCX, Image) into local ChromaDB vector storage.

### `GET /api/docs/list`
Lists indexed documents with their department tags and classification levels.

---

## 3. Cryptographic Audit & Integrity

### `GET /api/audit/logs`
Retrieves chronological audit trail records.

### `GET /api/audit/verify`
Calculates and verifies the cryptographic SHA-256 hash chaining of all recorded system transactions.

---

## 4. Zero-Egress Network Radar

### `GET /api/egress/status`
Returns real-time network socket telemetry proving 0 WAN packets.

