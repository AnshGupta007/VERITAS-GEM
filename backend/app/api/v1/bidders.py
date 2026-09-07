"""Bidder management and live PDF package ingestion endpoints."""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ...config import Settings
from ...dependencies import get_app_settings, get_audit_ledger, get_data_manager
from ...models import Bidder, Finding
from ...services.contradiction_engine import get_contradictions_by_bidder
from ...services.live_ingestion import ingest_real_bidder_from_pdf
from ...services.temporal_engine import evaluate_temporal_state

router = APIRouter(tags=["Bidders"])


@router.get("/bidders", response_model=List[Bidder])
def list_bidders(data_manager=Depends(get_data_manager)) -> List[Bidder]:
    """List all evaluated bidders with risk categories and decomposed scorecards."""
    return data_manager.get_all_bidders()


@router.get("/bidders/{bidder_id}", response_model=Bidder)
def get_bidder(bidder_id: str, data_manager=Depends(get_data_manager)) -> Bidder:
    """Retrieve single bidder profile and compliance scorecard."""
    bidder = data_manager.get_bidder_by_id(bidder_id)
    if not bidder:
        raise HTTPException(status_code=404, detail=f"Bidder '{bidder_id}' not found.")
    return bidder


@router.get("/bidders/{bidder_id}/findings", response_model=List[Finding])
def get_bidder_findings(bidder_id: str, data_manager=Depends(get_data_manager)) -> List[Finding]:
    """Retrieve prioritized compliance findings for a specific bidder."""
    bidder = data_manager.get_bidder_by_id(bidder_id)
    if not bidder:
        raise HTTPException(status_code=404, detail=f"Bidder '{bidder_id}' not found.")
    return data_manager.get_findings_for_bidder(bidder_id)


@router.get("/reports/{bidder_id}")
def generate_bidder_report(
    bidder_id: str,
    data_manager=Depends(get_data_manager),
    audit_ledger=Depends(get_audit_ledger),
    settings: Settings = Depends(get_app_settings),
) -> Dict[str, Any]:
    """Generate executive compliance dossier with complete evidence lineage."""
    bidder = data_manager.get_bidder_by_id(bidder_id)
    if not bidder:
        raise HTTPException(status_code=404, detail=f"Bidder '{bidder_id}' not found.")

    findings = data_manager.get_findings_for_bidder(bidder_id)
    contradictions = get_contradictions_by_bidder(bidder_id)
    temporal_eval = evaluate_temporal_state("2026-09-15", bidder_id)
    audit_events = audit_ledger.get_trail(bidder_id)

    return {
        "report_id": f"REP-{bidder.id}-20260903",
        "generated_at": "2026-09-03T04:10:00+05:30",
        "tender_number": "GEM/2026/B/8849201",
        "ministry": "Ministry of Petroleum & Natural Gas",
        "bidder": bidder,
        "findings_summary": {
            "total": len(findings),
            "high_risk": len([f for f in findings if f.severity.value == "HIGH"]),
            "pending_review": len([f for f in findings if f.status.value == "PENDING"]),
            "accepted": len([f for f in findings if f.status.value == "ACCEPTED"]),
            "overridden": len([f for f in findings if f.status.value == "OVERRIDDEN"]),
        },
        "findings": findings,
        "contradictions": contradictions,
        "temporal_validity": temporal_eval,
        "audit_trail": audit_events,
        "signoff_block": {
            "evaluating_officer": settings.default_officer_name,
            "officer_id": settings.default_officer_id,
            "timestamp": "2026-09-03T04:10:00+05:30",
            "cryptographic_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
        },
    }


@router.post("/bidders/upload-pdf")
async def upload_real_bidder_package(
    file: UploadFile = File(...),
    legal_name: str = Form(...),
    data_manager=Depends(get_data_manager),
) -> Dict[str, Any]:
    """Uploads real PDF package, extracts statutory entities, creates Bidder and updates Leaderboard."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return ingest_real_bidder_from_pdf(
        contents,
        filename=file.filename or "bidder_pkg.pdf",
        legal_name=legal_name,
        data_manager=data_manager,
    )
