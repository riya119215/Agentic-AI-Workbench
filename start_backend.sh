#!/usr/bin/env bash
# Sovereign AI Workbench — Linux Backend Runner
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/backend"

echo "========================================================"
echo " Starting Sovereign AI Workbench Backend (Port 8000)..."
echo "========================================================"

python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
