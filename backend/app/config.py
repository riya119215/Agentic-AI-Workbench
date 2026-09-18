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

WORKSPACES_DIR = DATA_DIR / "workspaces"

for d in [KNOWLEDGE_BASE_DIR, DELIVERABLES_DIR, CHROMA_DIR, AUDIT_DIR, SAMPLE_DATASETS_DIR, SANDBOX_DIR, WORKSPACES_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Local Ollama Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

# Model Palette (Configured for local Ollama)
REASONING_MODEL = os.getenv("REASONING_MODEL", "llama3.2:latest")
CODING_MODEL = os.getenv("CODING_MODEL", "llama3.2:latest")
VISION_MODEL = os.getenv("VISION_MODEL", "llama3.2:latest")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "bge-m3:latest")

# Fallback Mode: if specific model is temporarily unavailable, provide fallback
ALLOW_SIMULATED_FALLBACK = True

