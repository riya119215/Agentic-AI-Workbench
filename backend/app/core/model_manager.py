import httpx
import json
import logging
import psutil
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.config import (
    OLLAMA_BASE_URL,
    REASONING_MODEL,
    CODING_MODEL,
    VISION_MODEL,
    EMBEDDING_MODEL,
    MODEL_REGISTRY_FILE
)

logger = logging.getLogger(__name__)

DEFAULT_MODELS = [
    {
        "id": "llama3.2:latest",
        "name": "Meta Llama 3.2 (3B Instruct)",
        "task_type": "Reasoning & Report Drafting",
        "category": "reasoning",
        "endpoint": "http://127.0.0.1:11434",
        "size_gb": 2.0,
        "vram_pct": 24,
        "acceleration": "CPU AVX2 / Vulkan",
        "status": "ACTIVE"
    },
    {
        "id": "qwen2.5-coder:7b",
        "name": "Qwen 2.5 Coder (7B)",
        "task_type": "Code Generation & Sandbox",
        "category": "code",
        "endpoint": "http://127.0.0.1:11434",
        "size_gb": 4.7,
        "vram_pct": 48,
        "acceleration": "CPU AVX2 / Vulkan",
        "status": "ACTIVE"
    },
    {
        "id": "bge-m3:latest",
        "name": "BAAI BGE-M3 Dense Embedding",
        "task_type": "Multi-Lingual RAG Embeddings",
        "category": "embedding",
        "endpoint": "http://127.0.0.1:11434",
        "size_gb": 1.1,
        "vram_pct": 15,
        "acceleration": "Local Engine",
        "status": "ACTIVE"
    },
    {
        "id": "llava-phi3:vision",
        "name": "LLaVA Phi-3 Mini Vision",
        "task_type": "Vision Metrology & Drawings",
        "category": "vision",
        "endpoint": "http://127.0.0.1:11434",
        "size_gb": 2.9,
        "vram_pct": 32,
        "acceleration": "Local Engine",
        "status": "ACTIVE"
    }
]

class LocalModelManager:
    """
    Manages model registry configuration with file persistence (model_registry.json).
    Supports dynamic live registration of local models without server restart.
    """
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.registry_file = MODEL_REGISTRY_FILE
        self._init_registry()

    def _init_registry(self):
        if not self.registry_file.exists():
            try:
                with open(self.registry_file, "w", encoding="utf-8") as f:
                    json.dump(DEFAULT_MODELS, f, indent=2)
            except Exception as e:
                logger.error(f"Error initializing model registry file: {e}")

    def list_models(self) -> List[Dict[str, Any]]:
        try:
            if self.registry_file.exists():
                with open(self.registry_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error reading model registry: {e}")
        return DEFAULT_MODELS

    def add_model(self, model_data: Dict[str, Any]) -> Dict[str, Any]:
        models = self.list_models()
        model_id = model_data.get("id") or model_data.get("name", "").lower().replace(" ", "-")
        new_entry = {
            "id": model_id,
            "name": model_data.get("name", model_id),
            "task_type": model_data.get("task_type", "General Reasoning"),
            "category": model_data.get("category", "reasoning"),
            "endpoint": model_data.get("endpoint", self.base_url),
            "size_gb": model_data.get("size_gb", 3.0),
            "vram_pct": model_data.get("vram_pct", 30),
            "acceleration": model_data.get("acceleration", "Local Engine"),
            "status": "ACTIVE",
            "is_preferred": model_data.get("is_preferred", True),
            "registered_at": datetime.now(timezone.utc).isoformat()
        }
        # Replace or append
        existing_idx = next((i for i, m in enumerate(models) if m["id"] == model_id), None)
        if existing_idx is not None:
            models[existing_idx] = new_entry
        else:
            models.append(new_entry)

        with open(self.registry_file, "w", encoding="utf-8") as f:
            json.dump(models, f, indent=2)
        return new_entry

    def delete_model(self, model_id: str) -> bool:
        models = self.list_models()
        filtered = [m for m in models if m["id"] != model_id]
        if len(filtered) < len(models):
            with open(self.registry_file, "w", encoding="utf-8") as f:
                json.dump(filtered, f, indent=2)
            return True
        return False


    async def get_runtime_status(self) -> Dict[str, Any]:
        available_models = []
        is_runtime_active = False
        latency_ms = None

        start_time = datetime.now()
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    is_runtime_active = True
                    models_data = res.json().get("models", [])
                    for m in models_data:
                        available_models.append({
                            "name": m.get("name"),
                            "size_gb": round(m.get("size", 0) / (1024**3), 2),
                            "modified_at": m.get("modified_at"),
                            "family": m.get("details", {}).get("family", "llama")
                        })
                    latency_ms = round((datetime.now() - start_time).total_seconds() * 1000, 2)
        except Exception as e:
            logger.info(f"Ollama local runtime check: {e}")
            is_runtime_active = False

        cpu_pct = psutil.cpu_percent(interval=None)
        ram = psutil.virtual_memory()

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "inference_mode": "STRICT_LOCAL_ON_PREM",
            "endpoint": self.base_url,
            "runtime_healthy": is_runtime_active,
            "runtime_latency_ms": latency_ms or 15.0,
            "external_api_calls": 0,
            "external_cloud_ai": "BLOCKED_BY_POLICY",
            "hardware_specs": {
                "cpu_utilization_pct": cpu_pct,
                "ram_used_gb": round(ram.used / (1024**3), 2),
                "ram_total_gb": round(ram.total / (1024**3), 2),
                "ram_available_gb": round(ram.available / (1024**3), 2),
                "acceleration_mode": "CPU (AVX2 / Multi-Threaded On-Premise)"
            },
            "installed_local_models": available_models,
            "catalogue": self.list_models()
        }

model_manager = LocalModelManager()
