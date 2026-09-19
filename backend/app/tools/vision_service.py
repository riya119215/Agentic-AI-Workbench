import base64
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class VisionServiceError(Exception):
    pass

class VisionPreprocessor:
    """
    Image & Visual Metrology Preprocessing Service.
    Validates, computes cryptographic hashes, extracts dimensions, and encodes base64 payloads for local multimodal models.
    """
    def preprocess_image(self, file_path: Path) -> Dict[str, Any]:
        if not file_path.exists():
            raise VisionServiceError(f"Image file not found: {file_path}")

        suffix = file_path.suffix.lower()
        if suffix not in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
            raise VisionServiceError(f"Unsupported image format: {suffix}")

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        file_sha256 = hashlib.sha256(file_bytes).hexdigest()
        b64_str = base64.b64encode(file_bytes).decode("utf-8")

        return {
            "filename": file_path.name,
            "format": suffix.replace(".", "").upper(),
            "size_bytes": len(file_bytes),
            "sha256": file_sha256,
            "base64_data": b64_str,
            "preprocessed_at": datetime.now(timezone.utc).isoformat(),
            "status": "PREPROCESSED_READY_FOR_MULTIMODAL"
        }

class VisionGateway:
    """
    Pluggable Vision Gateway.
    Dispatches preprocessed image data to local on-premise vision inference.
    """
    def __init__(self, preprocessor: Optional[VisionPreprocessor] = None):
        self.preprocessor = preprocessor or VisionPreprocessor()

    def prepare_vision_payload(self, image_path: Path, task_prompt: str) -> Dict[str, Any]:
        meta = self.preprocessor.preprocess_image(image_path)
        return {
            "image_metadata": {k: v for k, v in meta.items() if k != "base64_data"},
            "base64_image": meta["base64_data"],
            "image_path": str(image_path),
            "task_prompt": task_prompt,
            "gateway_status": "PAYLOAD_READY"
        }

vision_preprocessor = VisionPreprocessor()
vision_gateway = VisionGateway(vision_preprocessor)
