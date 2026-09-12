import os
from pathlib import Path

# Paths
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
DATA_DIR = BACKEND_DIR / "data"

KNOWLEDGE_BASE_DIR = DATA_DIR / "knowledge_base"
DELIVERABLES_DIR = DATA_DIR / "deliverables"
CHROMA_DIR = DATA_DIR / "chroma_db"
AUDIT_DIR = DATA_DIR / "audit_logs"
SAMPLE_DATASETS_DIR = DATA_DIR / "sample_datasets"
SANDBOX_DIR = DATA_DIR / "sandbox_workspace"

for d in [KNOWLEDGE_BASE_DIR, DELIVERABLES_DIR, CHROMA_DIR, AUDIT_DIR, SAMPLE_DATASETS_DIR, SANDBOX_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Local Ollama Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

# Model Palette
REASONING_MODEL = os.getenv("REASONING_MODEL", "qwen2.5:7b")
CODING_MODEL = os.getenv("CODING_MODEL", "qwen2.5-coder:7b")
VISION_MODEL = os.getenv("VISION_MODEL", "qwen2-vl:7b")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "bge-m3:latest")

# Fallback Mode: if specific 7B model is not downloaded locally yet, use available local model or intelligent local simulation
ALLOW_SIMULATED_FALLBACK = True
