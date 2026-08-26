import sys
from pathlib import Path

# Make imports work consistently in Vercel's Python function sandbox.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app

__all__ = ["app"]
