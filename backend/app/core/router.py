import httpx
import json
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator
from app.config import OLLAMA_BASE_URL, REASONING_MODEL, CODING_MODEL, VISION_MODEL
from app.core.model_manager import model_manager

logger = logging.getLogger(__name__)

class ModelRouter:
    """
    Intelligent Local Model Dispatcher.
    Routes tasks to specialized local models based on task category, input data type, and context.
    Executes 100% locally through Ollama with zero external cloud fallback.
    """
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL

    async def get_available_local_models(self) -> List[str]:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models = res.json().get("models", [])
                    return [m.get("name") for m in models]
        except Exception as e:
            logger.warning(f"Could not connect to Ollama: {e}")
        return []

    def classify_and_route(self, prompt: str, attached_files: List[str] = None) -> Dict[str, Any]:
        """
        Dynamically selects the best local model according to task category, registry entries, and attachments.
        Prioritizes user-registered models, explicit capability tags (e.g. 14b, enterprise), and preferred flags.
        """
        attached_files = attached_files or []
        has_images = any(f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp')) for f in attached_files)
        has_scanned_pdf = any("scanned" in f.lower() or "drawing" in f.lower() or "photo" in f.lower() for f in attached_files)
        
        prompt_lower = prompt.lower()
        code_keywords = ["python", "code", "script", "csv", "plot", "chart", "analyze data", "pandas", "algorithm", "sql", "telemetry"]

        # Fetch registered models and sort so preferred or newly registered models win tie-breakers
        registered = model_manager.list_models()
        
        def get_model_priority(m):
            is_pref = 1 if m.get("is_preferred") else 0
            has_reg_time = 1 if m.get("registered_at") else 0
            reg_time = m.get("registered_at", "")
            return (is_pref, has_reg_time, reg_time)

        sorted_models = sorted(registered, key=get_model_priority, reverse=True)

        # Check for explicit model hint or tag in prompt
        explicit_match = None
        for m in sorted_models:
            m_id = m.get("id", "").lower()
            m_name = m.get("name", "").lower()
            # Match if model ID or key distinguishing tokens are in prompt
            if m_id in prompt_lower or m_name.lower() in prompt_lower:
                explicit_match = m
                break
            # Match capability tokens like 14b, enterprise, deepseek
            if any(tok in prompt_lower for tok in ["14b", "enterprise", "deepseek"]) and any(tok in m_id for tok in ["14b", "enterprise", "deepseek"]):
                explicit_match = m
                break

        if explicit_match:
            cat = explicit_match.get("category", "reasoning")
            task_type = "Code" if cat == "code" else ("Vision" if cat == "vision" else "Reasoning")
            task_icon = "terminal" if cat == "code" else ("eye" if cat == "vision" else "cpu")
            return {
                "selected_model": explicit_match["id"],
                "task_type": task_type,
                "task_icon": task_icon,
                "rationale": f"Explicit capability match in prompt. Dispatched directly to registered model ({explicit_match['id']}).",
                "backend": f"ollama-local ({self.base_url})"
            }

        vision_m = next((m["id"] for m in sorted_models if m.get("category") == "vision"), VISION_MODEL)
        code_m = next((m["id"] for m in sorted_models if m.get("category") == "code"), CODING_MODEL)
        reason_m = next((m["id"] for m in sorted_models if m.get("category") == "reasoning"), REASONING_MODEL)

        if has_images or has_scanned_pdf or "drawing" in prompt_lower or "diagram" in prompt_lower or "photo" in prompt_lower or "cavitation" in prompt_lower:
            selected_model = vision_m
            task_type = "Vision"
            task_icon = "eye"
            rationale = f"Visual/Metrology artifact detected. Dispatched to multimodal specialist ({selected_model})."
        elif any(kw in prompt_lower for kw in code_keywords):
            selected_model = code_m
            task_type = "Code"
            task_icon = "terminal"
            rationale = f"Code synthesis & isolated sandbox task. Dispatched to local code specialist ({selected_model})."
        else:
            selected_model = reason_m
            task_type = "Reasoning"
            task_icon = "cpu"
            rationale = f"Standard SOP compliance & reasoning task. Dispatched to sovereign reasoning engine ({selected_model})."

        return {
            "selected_model": selected_model,
            "task_type": task_type,
            "task_icon": task_icon,
            "rationale": rationale,
            "backend": f"ollama-local ({self.base_url})"
        }

    async def generate_response(
        self,
        model: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        images: Optional[List[str]] = None,
        temperature: float = 0.1
    ) -> str:
        """
        Calls local Ollama instance asynchronously with fallback to primary reasoning model.
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature}
        }
        if system_prompt:
            payload["system"] = system_prompt
        if images and len(images) > 0:
            payload["images"] = images

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    return res.json().get("response", "")
                elif res.status_code == 404 or "not found" in res.text.lower():
                    logger.warning(f"Model {model} not found in Ollama, falling back to {REASONING_MODEL}")
                    payload["model"] = REASONING_MODEL
                    # If image provided and fallback is text-only, remove images
                    if images and REASONING_MODEL == "llama3.2:latest":
                        payload.pop("images", None)
                    fallback_res = await client.post(f"{self.base_url}/api/generate", json=payload)
                    if fallback_res.status_code == 200:
                        return fallback_res.json().get("response", "")
                
                err_msg = f"Ollama returned HTTP {res.status_code}: {res.text}"
                logger.error(err_msg)
                raise RuntimeError(f"LOCAL_INFERENCE_ERROR: {err_msg}")
        except httpx.ConnectError:
            raise RuntimeError(f"LOCAL_INFERENCE_OFFLINE: Could not connect to local Ollama daemon at {self.base_url}. Please ensure Ollama is running.")
        except Exception as e:
            logger.error(f"Error calling local Ollama model {model}: {e}")
            raise RuntimeError(f"LOCAL_INFERENCE_FAILED: {str(e)}")

    async def stream_response(
        self,
        model: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        images: Optional[List[str]] = None,
        temperature: float = 0.1
    ) -> AsyncGenerator[str, None]:
        """
        Streams tokens from local Ollama asynchronously.
        """
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True,
            "options": {"temperature": temperature}
        }
        if system_prompt:
            payload["system"] = system_prompt
        if images and len(images) > 0:
            payload["images"] = images

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=2.0)) as client:
                async with client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
                    if response.status_code == 404:
                        # Fallback to REASONING_MODEL
                        payload["model"] = REASONING_MODEL
                        if images and REASONING_MODEL == "llama3.2:latest":
                            payload.pop("images", None)
                        async with client.stream("POST", f"{self.base_url}/api/generate", json=payload) as fb_response:
                            async for line in fb_response.aiter_lines():
                                if line:
                                    try:
                                        data = json.loads(line)
                                        token = data.get("response", "")
                                        yield token
                                        if data.get("done", False):
                                            break
                                    except Exception:
                                        pass
                        return

                    if response.status_code != 200:
                        yield f"[ERROR]: Ollama returned HTTP {response.status_code}"
                        return
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                token = data.get("response", "")
                                yield token
                                if data.get("done", False):
                                    break
                            except Exception:
                                pass
        except Exception as e:
            logger.info(f"Ollama streaming connection note: {e}")
            raise RuntimeError(f"Ollama local inference unavailable: {e}")

router = ModelRouter()
