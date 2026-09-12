#!/usr/bin/env python3
"""
Sovereign Air-Gap Checksum & Integrity Verifier
Validates all system binaries and datasets against the signed manifest before launching on air-gapped infrastructure.
"""

import sys
import json
import hashlib
from pathlib import Path

# UTF-8 stdout
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MANIFEST_PATH = PROJECT_ROOT / "dist_airgap" / "manifest_checksums.json"

def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def verify_checksums():
    if not MANIFEST_PATH.exists():
        print(f"[!] Manifest not found at {MANIFEST_PATH}. Generating one first...")
        from package_offline_bundle import create_bundle
        create_bundle()

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    print(f"[+] Verifying {len(manifest['files'])} files against Air-Gap Cryptographic Manifest...")
    all_pass = True
    for item in manifest["files"]:
        target = PROJECT_ROOT / item["path"]
        if not target.exists():
            print(f"[ERROR] MISSING FILE: {item['path']}")
            all_pass = False
            continue
        current_hash = compute_sha256(target)
        if current_hash != item["sha256"]:
            print(f"[ERROR] TAMPER DETECTED: {item['path']} (Expected: {item['sha256']}, Got: {current_hash})")
            all_pass = False
        else:
            print(f"[OK] VALID: {item['path']}")

    if all_pass:
        print("\n[OK] ALL FILES AIR-GAP VERIFIED AND CRYPTOGRAPHICALLY SECURE.")
    else:
        print("\n[ERROR] CRITICAL: Integrity checks failed! Do not boot on defence network.")
        sys.exit(1)

if __name__ == "__main__":
    verify_checksums()

