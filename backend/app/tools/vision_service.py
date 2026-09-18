import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class VisionServiceError(Exception):
    pass

class VisionPreprocessor:
    """
    Image & Visual Metrology Preprocessing Service.
    Validates, calculates cryptographic hashes, and extracts metadata from engineering scans.
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

        return {
            "filename": file_path.name,
            "format": suffix.replace(".", "").upper(),
            "size_bytes": len(file_bytes),
            "sha256": file_sha256,
            "preprocessed_at": datetime.now(timezone.utc).isoformat(),
            "status": "PREPROCESSED_READY_FOR_MULTIMODAL"
        }

class VisionGateway:
    """
    Pluggable Vision Gateway Contract.
    Dispatches preprocessed image references to teammate's local multimodal vision model.
    """
    def __init__(self, preprocessor: Optional[VisionPreprocessor] = None):
        self.preprocessor = preprocessor or VisionPreprocessor()

    def prepare_vision_payload(self, image_path: Path, task_prompt: str) -> Dict[str, Any]:
        meta = self.preprocessor.preprocess_image(image_path)
        return {
            "image_metadata": meta,
            "image_path": str(image_path),
            "task_prompt": task_prompt,
            "gateway_status": "PAYLOAD_READY"
        }

vision_preprocessor = VisionPreprocessor()
vision_gateway = VisionGateway(vision_preprocessor)
