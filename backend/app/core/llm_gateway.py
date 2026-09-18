import httpx
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.config import OLLAMA_BASE_URL, REASONING_MODEL, CODING_MODEL, VISION_MODEL

logger = logging.getLogger(__name__)

class LLMUnavailableError(Exception):
    pass

class LLMGateway:
    """
    Pluggable Local LLM Gateway Adapter.
    Defines a strict provider-independent contract for teammate's local LLM service.
    Handles inference dispatch, tool-calling format negotiation, and connection health.
    Zero external cloud calls.
    """
    def __init__(self, base_url: str = OLLAMA_BASE_URL):
        self.base_url = base_url
        self.default_model = REASONING_MODEL

    async def check_health(self) -> Dict[str, Any]:
        """
        Checks connectivity with the local LLM runtime daemon.
        """
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models = [m.get("name") for m in res.json().get("models", [])]
                    return {
                        "status": "ONLINE",
                        "endpoint": self.base_url,
                        "available_models": models,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
        except Exception as e:
            logger.info(f"Local LLM runtime check: {e}")

        return {
            "status": "LLM_UNAVAILABLE",
            "endpoint": self.base_url,
            "error": "Local inference service is offline or unreachable.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def generate(
        self,
        prompt: str,
        system_context: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.1
    ) -> Dict[str, Any]:
        target_model = model or self.default_model
        payload = {
            "model": target_model,
            "prompt": prompt,
            "system": system_context or "You are the Sovereign On-Premise AI assistant for sensitive engineering analysis.",
            "stream": False,
            "options": {"temperature": temperature}
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "success": True,
                        "response": data.get("response", ""),
                        "model": target_model,
                        "total_duration_ms": round(data.get("total_duration", 0) / 1e6, 2)
                    }
        except Exception as e:
            logger.warning(f"Local LLM generation failed: {e}")

        raise LLMUnavailableError(f"LLM_UNAVAILABLE: Could not connect to local inference engine at {self.base_url}")

llm_gateway = LLMGateway()

# ---------------------------------------------------------------------------
# Test-Only Deterministic Integration Stub
# (STRICTLY for automated unit & CI integration tests without live models)
# ---------------------------------------------------------------------------
class MockLocalLLMAdapter(LLMGateway):
    """
    Deterministic stub strictly isolated for unit testing non-LLM pipelines.
    Never exposed or presented as production intelligence.
    """
    async def check_health(self) -> Dict[str, Any]:
        return {
            "status": "TEST_STUB_ACTIVE",
            "endpoint": "mock://127.0.0.1/test_adapter",
            "available_models": ["mock-qwen-test"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    async def generate(
        self,
        prompt: str,
        system_context: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.0
    ) -> Dict[str, Any]:
        return {
            "success": True,
            "response": f"[DETERMINISTIC_TEST_OUTPUT: Verified prompt length {len(prompt)} chars]",
            "model": model or "mock-qwen-test",
            "total_duration_ms": 1.0
        }
