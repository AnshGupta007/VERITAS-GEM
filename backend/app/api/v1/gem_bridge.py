"""
GeM API Webhook Bridge Router.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from ...services.gem_bridge import simulate_gem_inbound_bid

router = APIRouter(tags=["GeM Integration Bridge"])


class WebhookPayload(BaseModel):
    event_type: Optional[str] = "BID_SUBMISSION"
    tender_number: Optional[str] = "GEM/2026/B/8849201"
    bidder_package: Optional[Dict[str, Any]] = None


@router.post("/gem/webhook")
def receive_gem_webhook(
    payload: WebhookPayload,
    x_gem_signature: Optional[str] = Header(default=None)
) -> Dict[str, Any]:
    """
    Receives authoritative event webhooks pushed from the GeM portal.
    """
    return simulate_gem_inbound_bid(payload.tender_number or "GEM/2026/B/8849201")


@router.post("/gem/simulate-bid")
def trigger_gem_simulated_bid(tender_number: Optional[str] = "GEM/2026/B/8849201") -> Dict[str, Any]:
    """
    Simulates an incoming bid from GeM to demonstrate real-time pipeline ingestion.
    """
    return simulate_gem_inbound_bid(tender_number)
