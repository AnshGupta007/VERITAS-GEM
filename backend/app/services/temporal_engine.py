"""Temporal Compliance Engine — The Compliance Time Machine.

Reconstructs historical and projected compliance states for all bidder certificates
as of any target date. Uses in-memory caching to optimize repetitive Time Machine queries.
"""
import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..config import DATA_DIR
from ..models import TemporalItem

BID_SUBMISSION_ANCHOR_DATE = "2026-09-15"

_lock = threading.RLock()
_items_cache: Optional[List[TemporalItem]] = None
_by_bidder_cache: Dict[str, List[TemporalItem]] = {}
_evaluation_cache: Dict[str, Dict[str, Any]] = {}


def _ensure_loaded() -> None:
    global _items_cache, _by_bidder_cache
    with _lock:
        if _items_cache is not None:
            return
        filepath = DATA_DIR / "sample_temporal.json"
        if not filepath.exists():
            _items_cache = []
            _by_bidder_cache = {}
            return

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            items = [TemporalItem(**item) for item in data]

        _items_cache = items
        _by_bidder_cache = {}
        for item in items:
            _by_bidder_cache.setdefault(item.bidder_id, []).append(item)


def clear_temporal_cache() -> None:
    """Clear all cached temporal certificates and evaluation results."""
    global _items_cache, _by_bidder_cache, _evaluation_cache
    with _lock:
        _items_cache = None
        _by_bidder_cache = {}
        _evaluation_cache = {}


def load_temporal_items() -> List[TemporalItem]:
    """Retrieve all loaded temporal certificates (cached)."""
    _ensure_loaded()
    assert _items_cache is not None
    return list(_items_cache)


def get_temporal_items_by_bidder(bidder_id: str) -> List[TemporalItem]:
    """Indexed lookup of certificates belonging to a specific bidder."""
    _ensure_loaded()
    return list(_by_bidder_cache.get(bidder_id, []))


def evaluate_temporal_state(target_date_str: str, bidder_id: Optional[str] = None) -> Dict[str, Any]:
    """Reconstruct compliance certificate validity states as of target_date_str (cached)."""
    cache_key = f"{target_date_str}:{bidder_id or 'ALL'}"
    with _lock:
        if cache_key in _evaluation_cache:
            return _evaluation_cache[cache_key]

    try:
        target_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
    except ValueError:
        target_date = datetime.strptime(BID_SUBMISSION_ANCHOR_DATE, "%Y-%m-%d").date()
        target_date_str = BID_SUBMISSION_ANCHOR_DATE

    _ensure_loaded()
    if bidder_id:
        all_items = get_temporal_items_by_bidder(bidder_id)
    else:
        all_items = load_temporal_items()

    reconstructed_items = []
    total_certificates = len(all_items)
    valid_count = 0
    expired_count = 0
    not_yet_issued_count = 0

    for item in all_items:
        issue = datetime.strptime(item.issue_date, "%Y-%m-%d").date()
        expiry = datetime.strptime(item.expiry_date, "%Y-%m-%d").date()

        days_diff = (expiry - target_date).days

        if target_date < issue:
            state = "NOT_YET_ISSUED"
            not_yet_issued_count += 1
            warning = True
            detail_msg = f"Not yet issued on {target_date_str}. Issued later on {item.issue_date}."
        elif target_date > expiry:
            state = "EXPIRED"
            expired_count += 1
            warning = True
            days_expired = (target_date - expiry).days
            detail_msg = f"EXPIRED {days_expired} days before {target_date_str}. Expiry was on {item.expiry_date}."
        else:
            state = "VALID"
            valid_count += 1
            warning = False
            detail_msg = f"VALID on {target_date_str}. Active through {item.expiry_date} ({days_diff} days remaining)."

        reconstructed_items.append(
            {
                "id": item.id,
                "bidder_id": item.bidder_id,
                "certificate_name": item.certificate_name,
                "issuing_authority": item.issuing_authority,
                "issue_date": item.issue_date,
                "expiry_date": item.expiry_date,
                "validity_window_days": item.validity_window_days,
                "evaluated_date": target_date_str,
                "status_on_evaluated_date": state,
                "days_difference": days_diff,
                "warning_flag": warning,
                "reconstructed_details": detail_msg,
            }
        )

    compliance_ratio = (valid_count / total_certificates * 100.0) if total_certificates > 0 else 0.0

    result = {
        "evaluated_date": target_date_str,
        "bid_submission_anchor_date": BID_SUBMISSION_ANCHOR_DATE,
        "is_anchor_date": target_date_str == BID_SUBMISSION_ANCHOR_DATE,
        "total_certificates_evaluated": total_certificates,
        "valid_count": valid_count,
        "expired_count": expired_count,
        "not_yet_issued_count": not_yet_issued_count,
        "temporal_compliance_percent": round(compliance_ratio, 1),
        "certificates": reconstructed_items,
    }

    with _lock:
        _evaluation_cache[cache_key] = result

    return result
