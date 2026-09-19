#!/usr/bin/env bash
# Sovereign AI Workbench — Linux Frontend Runner
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR/frontend"

echo "========================================================"
echo " Starting Sovereign AI Workbench Frontend (Port 5173)..."
echo "========================================================"

npm run dev
