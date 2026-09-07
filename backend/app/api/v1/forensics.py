"""Advanced Forensics, Cartelization, Shell Detection, Committee Attestation, Legal Cure, and Commercial Evaluation."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ...dependencies import get_data_manager
from ...services.collusion_detector import (
    analyze_tender_collusion,
    get_entity_network_graph,
)
from ...services.commercial_evaluation import (
    execute_price_match,
    get_commercial_evaluation,
)
from ...services.committee_consensus import (
    get_committee_status,
    sign_committee_member,
)
from ...services.cure_verification import (
    get_representation,
    record_cure_decision,
    submit_representation,
)
from ...services.document_forensics import get_bidder_document_forensics
from ...services.historical_intelligence import get_historical_profile
from ...services.legal_notice_generator import generate_show_cause_notice
from ...services.shell_detector import evaluate_shell_risk
from ...services.customs_hsn_engine import get_hsn_customs_deconstruction

router = APIRouter(tags=["Forensics, Committee & Legal"])


class CommitteeSignRequest(BaseModel):
    member_id: str
    action: str
    comments: str


class RepresentationSubmitRequest(BaseModel):
    bidder_id: str
    rejoinder_text: str
    attached_documents: List[Dict[str, Any]] = []
    bidder_name: Optional[str] = None


class CureDecisionRequest(BaseModel):
    bidder_id: str
    officer_id: Optional[str] = "OFF-8821"
    action: str  # ACCEPT_CURE_QUALIFY or REJECT_CURE_DISQUALIFY
    justification: str


class PriceMatchRequest(BaseModel):
    bidder_id: Optional[str] = "BID-PQR-003"


@router.get("/forensics/collusion")
def get_collusion_analysis(data_manager=Depends(get_data_manager)) -> Dict[str, Any]:
    """Forensic analysis for cartelization, metadata collisions, and bid-rigging."""
    bidders = [b.model_dump() for b in data_manager.get_all_bidders()]
    return analyze_tender_collusion(bidders)


@router.get("/forensics/network")
def get_collusion_network() -> Dict[str, Any]:
    """Entity relationship graph mapping cross-bidder collusion links."""
    return get_entity_network_graph()


@router.get("/forensics/shell-risk/{bidder_id}")
def get_shell_risk(bidder_id: str) -> Dict[str, Any]:
    """Shell Company Probability Index triangulated with EPFO and MCA21."""
    return evaluate_shell_risk(bidder_id)


@router.get("/forensics/tampering/{bidder_id}")
def get_document_tampering_analysis(bidder_id: str) -> Dict[str, Any]:
    """PDF stream tampering heuristics, raster font mismatch, and ICAI UDIN check."""
    return get_bidder_document_forensics(bidder_id)


@router.get("/forensics/historical/{bidder_id}")
def get_bidder_cross_tender_history(bidder_id: str) -> Dict[str, Any]:
    """Cross-tender historical performance and multi-tender contradiction detection."""
    return get_historical_profile(bidder_id)


@router.get("/legal/show-cause/{bidder_id}")
def get_show_cause_notice(bidder_id: str) -> Dict[str, Any]:
    """Generates official bilingual Show-Cause Notice under Rule 144(xi) GFR 2017."""
    return generate_show_cause_notice(bidder_id)


@router.get("/committee/status")
def get_committee_review_status() -> Dict[str, Any]:
    """Multi-member Technical Evaluation Committee consensus status."""
    return get_committee_status()


@router.post("/committee/sign")
def post_committee_sign(payload: CommitteeSignRequest) -> Dict[str, Any]:
    """Records committee member digital attestation onto SHA-256 audit ledger."""
    try:
        return sign_committee_member(payload.member_id, payload.action, payload.comments)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/legal/representation/{bidder_id}")
def get_bidder_representation_details(bidder_id: str) -> Dict[str, Any]:
    """Fetch formal bidder representation responding to Show-Cause Notice."""
    rep = get_representation(bidder_id)
    if not rep:
        raise HTTPException(status_code=404, detail=f"No representation filed for bidder '{bidder_id}'.")
    return rep


@router.post("/legal/representation/submit")
def submit_bidder_representation(payload: RepresentationSubmitRequest) -> Dict[str, Any]:
    """Submits a curative representation rejoinder with attached documents."""
    return submit_representation(
        bidder_id=payload.bidder_id,
        rejoinder_text=payload.rejoinder_text,
        attached_documents=payload.attached_documents,
        bidder_name=payload.bidder_name,
    )


@router.post("/legal/representation/decide")
def decide_bidder_representation(payload: CureDecisionRequest) -> Dict[str, Any]:
    """Procurement officer formally signs decision on representation."""
    try:
        return record_cure_decision(
            bidder_id=payload.bidder_id,
            officer_id=payload.officer_id or "OFF-8821",
            action=payload.action,
            justification=payload.justification,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/commercial/evaluation")
@router.get("/commercial/evaluation/{tender_ref:path}")
def get_commercial_bid_evaluation(tender_ref: Optional[str] = None) -> Dict[str, Any]:
    """BoQ financial comparison, raw L1 discovery, and DPIIT PPO-MII purchase preference."""
    return get_commercial_evaluation()


@router.post("/commercial/match-price")
def post_commercial_price_match(payload: PriceMatchRequest) -> Dict[str, Any]:
    """Simulates statutory price matching under PPO-MII Class-I margin of preference."""
    return execute_price_match(payload.bidder_id or "BID-PQR-003")


@router.get("/commercial/hsn-deconstruction/{bidder_id}")
def get_bidder_hsn_customs_deconstruction(bidder_id: str) -> Dict[str, Any]:
    """Deconstructs Bill of Materials against HSN tariff codes and ICEGATE import returns."""
    return get_hsn_customs_deconstruction(bidder_id)

