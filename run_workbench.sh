#!/usr/bin/env bash
# Sovereign AI Workbench — Full Stack Launcher (Linux)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================================"
echo " Sovereign AI Workbench — Starting Full Stack (Linux)..."
echo "========================================================"

# Launch Backend in background
cd "$DIR/backend"
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Launch Frontend
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT
wait
