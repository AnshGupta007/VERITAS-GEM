"""Temporal compliance (Time Machine) endpoints."""
from typing import Any, Dict, Optional
from fastapi import APIRouter, Query

from ...services.temporal_engine import evaluate_temporal_state

router = APIRouter(tags=["Temporal Compliance"])


@router.get("/temporal/simulate")
def simulate_temporal_date(
    date: str = Query(..., description="Target date in YYYY-MM-DD format"),
    bidder_id: Optional[str] = Query(None, description="Optional bidder ID"),
) -> Dict[str, Any]:
    """Reconstruct compliance certificate validity for any date on the Time Machine slider."""
    return evaluate_temporal_state(target_date_str=date, bidder_id=bidder_id)


@router.get("/temporal/{bidder_id}")
def get_temporal_timeline(bidder_id: str) -> Dict[str, Any]:
    """Get baseline certificate timeline evaluated against bid submission anchor date (15-Sep-2026)."""
    return evaluate_temporal_state(target_date_str="2026-09-15", bidder_id=bidder_id)
