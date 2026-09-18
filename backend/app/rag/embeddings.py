import httpx
import logging
from typing import List, Optional, Dict, Any
from app.config import OLLAMA_BASE_URL, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

class EmbeddingError(Exception):
    pass

class EmbeddingUnavailableError(EmbeddingError):
    pass

class EmbeddingGateway:
    """
    Pluggable Local Embedding Gateway.
    Connects to local on-premise embedding engines (e.g. Ollama BGE-M3 / Nomic-Embed).
    Strictly forbids cloud embedding APIs.
    Returns explicit error states when local embedding daemon is offline.
    """
    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = EMBEDDING_MODEL):
        self.base_url = base_url
        self.model = model

    async def get_embedding(self, text: str) -> List[float]:
        """
        Retrieves dense embedding vector from local engine.
        Raises EmbeddingUnavailableError if local daemon is not responding.
        """
        if not text or not text.strip():
            raise EmbeddingError("Empty text cannot be embedded.")

        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.model, "prompt": text}
                )
                if res.status_code == 200:
                    emb = res.json().get("embedding", [])
                    if emb:
                        return emb
        except Exception as e:
            logger.warning(f"Local embedding provider unavailable ({self.base_url}): {e}")

        # Explicit unavailable state in production (never fabricate pseudo-vectors)
        raise EmbeddingUnavailableError("EMBEDDING_UNAVAILABLE: Local embedding daemon is offline or model is not loaded.")

    async def check_health(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models = [m.get("name") for m in res.json().get("models", [])]
                    is_ready = any(self.model in m for m in models)
                    return {
                        "status": "READY" if is_ready else "MODEL_NOT_FOUND",
                        "provider": "Local Ollama",
                        "model": self.model,
                        "available_models": models
                    }
        except Exception:
            pass

        return {
            "status": "EMBEDDING_UNAVAILABLE",
            "provider": "Local Ollama",
            "model": self.model,
            "error": "Local embedding endpoint unreachable"
        }

embedding_gateway = EmbeddingGateway()

# Backward compatibility alias
class LocalEmbedderWrapper:
    async def get_embedding(self, text: str) -> List[float]:
        return await embedding_gateway.get_embedding(text)

embedder = LocalEmbedderWrapper()
