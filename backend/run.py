"""Launcher script for VERITAS-GEM FastAPI server."""
import sys
import uvicorn
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import HOST, PORT, DEBUG

if __name__ == "__main__":
    print(f"============================================================")
    print(f"  VERITAS-GEM — Evidence-Backed AI Compliance Platform")
    print(f"  Ministry of Petroleum & Natural Gas (SIH26100)")
    print(f"  Starting server on http://{HOST}:{PORT}")
    print(f"  API Documentation: http://{HOST}:{PORT}/api/docs")
    print(f"============================================================")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)
