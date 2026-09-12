import httpx
import hashlib
import numpy as np
from typing import List
from app.config import OLLAMA_BASE_URL, EMBEDDING_MODEL

class LocalEmbedder:
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.model = EMBEDDING_MODEL

    async def get_embedding(self, text: str) -> List[float]:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.model, "prompt": text}
                )
                if res.status_code == 200:
                    return res.json().get("embedding", [])
        except Exception:
            pass
        
        # Fallback: Deterministic local pseudo-embedding (384 dimensions)
        return self._deterministic_vector(text)

    def _deterministic_vector(self, text: str, dim: int = 384) -> List[float]:
        seed = int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16) % (2**32)
        rng = np.random.RandomState(seed)
        vec = rng.randn(dim)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedder = LocalEmbedder()
