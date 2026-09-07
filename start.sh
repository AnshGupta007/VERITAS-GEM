#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo "    __     _______ ____  ___ _____  _    ____        ____ _____ __  __ "
echo "    \ \   / / ____|  _ \|_ _|_   _|/ \  / ___|      / ___| ____|  \/  |"
echo "     \ \ / /|  _| | |_) || |  | | / _ \ \___ \ ____| |  _|  _| | |\/| |"
echo "      \ V / | |___|  _ < | |  | |/ ___ \ ___) |_____| |_| | |___| |  | |"
echo "       \_/  |_____|_| \_\___| |_/_/   \_\____/       \____|_____|_|  |_|"
echo "======================================================================"
echo "  SIH26100: AI-Powered Integrated Bid Compliance Verification Platform"
echo "  Ministry of Petroleum & Natural Gas · Government of India"
echo "======================================================================"

# Ensure Python dependencies
echo "Checking Python environment..."
python3 -c "import fastapi, uvicorn, pydantic" 2>/dev/null || {
  echo "Installing required Python dependencies..."
  python3 -m pip install -r backend/requirements.txt --break-system-packages
}

# Check and clean up any existing process on port 8000
if lsof -i :8000 >/dev/null 2>&1; then
  echo "Notice: Port 8000 is currently occupied. Freeing port 8000..."
  fuser -k 8000/tcp 2>/dev/null || true
  sleep 1
fi

echo ""
echo "🚀 Launching VERITAS-GEM Platform on http://localhost:8000 ..."
echo "📖 Swagger API Docs available at http://localhost:8000/api/docs"
echo "⚡ Press Ctrl+C to terminate server."
echo ""

export PYTHONPATH="$DIR/backend:$PYTHONPATH"
exec python3 backend/run.py
