"""Contradiction Detection Engine for Cross-Document Evidence Comparison.

Caches parsed contradiction datasets in-memory to prevent redundant disk I/O
and provides indexed lookups by contradiction ID and bidder ID.
"""
import json
import threading
from pathlib import Path
from typing import Dict, List, Optional

from ..config import DATA_DIR
from ..models import Contradiction

_lock = threading.RLock()
_cache: Optional[List[Contradiction]] = None
_by_bidder: Dict[str, List[Contradiction]] = {}
_by_id: Dict[str, Contradiction] = {}


def _ensure_loaded() -> None:
    global _cache, _by_bidder, _by_id
    with _lock:
        if _cache is not None:
            return
        filepath = DATA_DIR / "sample_contradictions.json"
        if not filepath.exists():
            _cache = []
            _by_bidder = {}
            _by_id = {}
            return

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            items = [Contradiction(**item) for item in data]

        _cache = items
        _by_bidder = {}
        _by_id = {}
        for item in items:
            _by_id[item.id] = item
            _by_bidder.setdefault(item.bidder_id, []).append(item)


def clear_contradictions_cache() -> None:
    """Invalidate contradiction in-memory cache."""
    global _cache, _by_bidder, _by_id
    with _lock:
        _cache = None
        _by_bidder = {}
        _by_id = {}


def load_contradictions() -> List[Contradiction]:
    """Retrieve all loaded contradictions (cached)."""
    _ensure_loaded()
    assert _cache is not None
    return list(_cache)


def get_all_contradictions() -> List[Contradiction]:
    """List all cross-document contradictions across submissions."""
    return load_contradictions()


def get_contradictions_by_bidder(bidder_id: str) -> List[Contradiction]:
    """Fast indexed lookup of contradictions for a specific bidder."""
    _ensure_loaded()
    return list(_by_bidder.get(bidder_id, []))


def get_contradiction_by_id(contra_id: str) -> Optional[Contradiction]:
    """Fast indexed lookup of a single contradiction by its ID."""
    _ensure_loaded()
    return _by_id.get(contra_id)
