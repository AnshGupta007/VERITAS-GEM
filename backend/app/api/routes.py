"""REST API Endpoints for VERITAS-GEM."""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, File, UploadFile, Form
from ..config import (
    APP_NAME,
    APP_DESCRIPTION,
    MODEL_VERSION,
    RULE_VERSION,
    DEFAULT_OFFICER_ID,
    DEFAULT_OFFICER_NAME,
)
from ..models import (
    Tender,
    Bidder,
    Finding,
    Contradiction,
    DecisionRequest,
    DecisionResult,
    AuditEvent,
    AdapterStatus,
)
from ..services import (
    DATA_MANAGER,
    AUDIT_LEDGER,
    get_all_adapters,
    test_adapter_query,
    get_all_contradictions,
    get_contradictions_by_bidder,
    get_contradiction_by_id,
    evaluate_temporal_state,
    get_temporal_items_by_bidder,
)

router = APIRouter(prefix="/api")


@router.get("/system/status")
def get_system_status() -> Dict[str, Any]:
    """Provides platform health, active governance rules, and officer session context."""
    ledger_audit = AUDIT_LEDGER.verify_integrity()
    return {
        "platform": APP_NAME,
        "description": APP_DESCRIPTION,
        "version": "0.9.3",
        "model_version": MODEL_VERSION,
        "rule_version": RULE_VERSION,
        "officer_session": {
            "officer_id": DEFAULT_OFFICER_ID,
            "name": DEFAULT_OFFICER_NAME,
            "role": "Procurement Evaluation Committee Chairperson",
            "department": "MoPNG / ONGC Subsea Drilling Procurement Division",
        },
        "audit_ledger": ledger_audit,
        "adapters_count": len(get_all_adapters()),
        "status": "OPERATIONAL",
    }


@router.get("/tenders", response_model=Optional[Tender])
def get_current_tender() -> Optional[Tender]:
    """Retrieve active tender details and parsed clauses."""
    tender = DATA_MANAGER.get_tender()
    if not tender:
        raise HTTPException(status_code=404, detail="No active tender loaded.")
    return tender


@router.get("/tenders/{tender_id}/clauses")
def get_tender_clauses(
    tender_id: str,
    category: Optional[str] = Query(None, description="Filter by clause category"),
    criticality: Optional[str] = Query(None, description="Filter by criticality level"),
) -> Dict[str, Any]:
    """Get structured tender clauses and compliance requirements."""
    tender = DATA_MANAGER.get_tender()
    if not tender or tender.id != tender_id:
        raise HTTPException(status_code=404, detail=f"Tender '{tender_id}' not found.")

    clauses = tender.clauses
    if category:
        clauses = [c for c in clauses if c.category.lower() == category.lower()]
    if criticality:
        clauses = [c for c in clauses if c.criticality.value.lower() == criticality.lower()]

    total_reqs = sum(len(c.requirements) for c in clauses)
    return {
        "tender_id": tender.id,
        "tender_number": tender.tender_number,
        "total_clauses": len(clauses),
        "total_requirements": total_reqs,
        "clauses": clauses,
    }


@router.get("/bidders", response_model=List[Bidder])
def list_bidders() -> List[Bidder]:
    """List all evaluated bidders with risk categories and decomposed scorecards."""
    return DATA_MANAGER.get_all_bidders()


@router.get("/bidders/{bidder_id}", response_model=Bidder)
def get_bidder(bidder_id: str) -> Bidder:
    """Retrieve single bidder profile and compliance scorecard."""
    bidder = DATA_MANAGER.get_bidder_by_id(bidder_id)
    if not bidder:
        raise HTTPException(status_code=404, detail=f"Bidder '{bidder_id}' not found.")
    return bidder


@router.get("/bidders/{bidder_id}/findings", response_model=List[Finding])
def get_bidder_findings(bidder_id: str) -> List[Finding]:
    """Retrieve prioritized compliance findings for a specific bidder."""
    bidder = DATA_MANAGER.get_bidder_by_id(bidder_id)
    if not bidder:
        raise HTTPException(status_code=404, detail=f"Bidder '{bidder_id}' not found.")
    return DATA_MANAGER.get_findings_for_bidder(bidder_id)


@router.get("/findings/{finding_id}/evidence")
def get_finding_evidence(finding_id: str) -> Dict[str, Any]:
    """Retrieve complete 3-column evidence inspection dossier for a finding."""
    finding = DATA_MANAGER.get_finding_by_id(finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail=f"Finding '{finding_id}' not found.")

    bidder = DATA_MANAGER.get_bidder_by_id(finding.bidder_id)
    tender = DATA_MANAGER.get_tender()

    # Find associated requirement
    req = None
    if tender:
        for cl in tender.clauses:
            for r in cl.requirements:
                if r.id == finding.requirement_id:
                    req = r
                    break
            if req:
                break

    return {
        "finding": finding,
        "bidder": {
            "id": bidder.id if bidder else finding.bidder_id,
            "name": bidder.legal_name if bidder else "Unknown",
            "pan": bidder.pan if bidder else "",
            "gstin": bidder.gstin if bidder else "",
        },
        "requirement": req,
        "dual_document_comparison": len(finding.evidence_excerpts) > 1,
        "excerpts": finding.evidence_excerpts,
    }


@router.get("/contradictions", response_model=List[Contradiction])
def list_contradictions() -> List[Contradiction]:
    """List all cross-document contradictions detected across submissions."""
    return get_all_contradictions()


@router.get("/contradictions/{bidder_id}", response_model=List[Contradiction])
def get_contradictions_for_bidder(bidder_id: str) -> List[Contradiction]:
    """Get detected contradictions for a specific bidder."""
    return get_contradictions_by_bidder(bidder_id)


@router.get("/temporal/simulate")
def simulate_temporal_date(
    date: str = Query(..., description="Target date in YYYY-MM-DD format"),
    bidder_id: Optional[str] = Query(None, description="Optional bidder ID"),
) -> Dict[str, Any]:
    """Reconstruct compliance certificate validity states for any scrubbed date on Time Machine slider."""
    return evaluate_temporal_state(target_date_str=date, bidder_id=bidder_id)


@router.get("/temporal/{bidder_id}")
def get_temporal_timeline(bidder_id: str) -> Dict[str, Any]:
    """Get baseline certificate timeline evaluated against bid submission anchor date (15-Sep-2026)."""
    return evaluate_temporal_state(target_date_str="2026-09-15", bidder_id=bidder_id)


@router.get("/verification/adapters", response_model=List[AdapterStatus])
def list_adapters() -> List[AdapterStatus]:
    """List external source verification adapters and health status."""
    return get_all_adapters()


@router.post("/verification/adapters/test")
def test_adapter(adapter_id: str = Query(...), identifier: str = Query(...)) -> Dict[str, Any]:
    """Execute live simulated query against verification adapter."""
    res = test_adapter_query(adapter_id, identifier)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/decisions", response_model=DecisionResult)
def submit_decision(req: DecisionRequest) -> DecisionResult:
    """Submit human officer decision (Accept / Override / Escalate) to immutable ledger."""
    try:
        res = DATA_MANAGER.process_decision(req)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal decision processing error: {str(e)}")


@router.get("/audit", response_model=List[AuditEvent])
def get_audit_trail(bidder_id: Optional[str] = Query(None)) -> List[AuditEvent]:
    """Retrieve immutable cryptographic audit ledger."""
    return AUDIT_LEDGER.get_trail(bidder_id)


@router.get("/audit/verify")
def verify_audit_ledger() -> Dict[str, Any]:
    """Cryptographic verification of audit ledger block integrity."""
    return AUDIT_LEDGER.verify_integrity()


@router.get("/reports/{bidder_id}")
def generate_bidder_report(bidder_id: str) -> Dict[str, Any]:
    """Generate executive compliance dossier with complete evidence lineage."""
    bidder = DATA_MANAGER.get_bidder_by_id(bidder_id)
    if not bidder:
        raise HTTPException(status_code=404, detail=f"Bidder '{bidder_id}' not found.")

    findings = DATA_MANAGER.get_findings_for_bidder(bidder_id)
    contradictions = get_contradictions_by_bidder(bidder_id)
    temporal_eval = evaluate_temporal_state("2026-09-15", bidder_id)
    audit_events = AUDIT_LEDGER.get_trail(bidder_id)

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
            "evaluating_officer": DEFAULT_OFFICER_NAME,
            "officer_id": DEFAULT_OFFICER_ID,
            "timestamp": "2026-09-03T04:10:00+05:30",
            "cryptographic_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
        },
    }


@router.post("/demo/reset")
def reset_demo() -> Dict[str, Any]:
    """Reset all decisions and state back to fresh demonstration state."""
    DATA_MANAGER.reset_demo_state()
    reset_committee_state()
    reset_commercial_state()
    return {"message": "Demo state successfully reset to initial baseline."}


# =========================================================================
# NEW ADVANCED FORENSIC & CO-PILOT ENDPOINTS (SIH26100 Next-Gen Features)
# =========================================================================

from ..services import (
    analyze_tender_collusion,
    get_entity_network_graph,
    evaluate_shell_risk,
    generate_show_cause_notice,
    query_copilot,
    ingest_custom_tender,
    get_committee_status,
    sign_committee_member,
    reset_committee_state,
    validate_udin,
    analyze_pdf_stream,
    get_bidder_document_forensics,
    get_representation,
    submit_representation,
    evaluate_cure_sufficiency,
    record_cure_decision,
    get_commercial_evaluation,
    execute_price_match,
    reset_commercial_state,
    get_policy_config,
    update_policy_config,
    get_policy_impact_summary,
    get_historical_profile,
    process_uploaded_pdf,
    ingest_real_bidder_from_pdf,
)
from pydantic import BaseModel

class CopilotQueryRequest(BaseModel):
    query: str
    api_key: Optional[str] = None
    model: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None

class TenderIngestRequest(BaseModel):
    file_name: str
    tender_ref: Optional[str] = None
    value_cr: Optional[float] = None

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

class PolicyUpdateRequest(BaseModel):
    config: Dict[str, Any]
    officer_id: Optional[str] = "OFF-8821"


@router.get("/forensics/collusion")
def get_collusion_analysis() -> Dict[str, Any]:
    """Forensic analysis for cartelization, metadata collisions, and bid-rigging."""
    bidders = [b.model_dump() for b in DATA_MANAGER.get_all_bidders()]
    return analyze_tender_collusion(bidders)


@router.get("/forensics/network")
def get_collusion_network() -> Dict[str, Any]:
    """Entity relationship graph mapping cross-bidder collusion links."""
    return get_entity_network_graph()


@router.get("/forensics/shell-risk/{bidder_id}")
def get_shell_risk(bidder_id: str) -> Dict[str, Any]:
    """Shell Company Probability Index triangulated with EPFO and MCA21."""
    return evaluate_shell_risk(bidder_id)


@router.get("/legal/show-cause/{bidder_id}")
def get_show_cause_notice(bidder_id: str) -> Dict[str, Any]:
    """Generates official bilingual Show-Cause Notice under Rule 144(xi) GFR 2017."""
    return generate_show_cause_notice(bidder_id)


@router.post("/copilot/query")
def post_copilot_query(payload: CopilotQueryRequest) -> Dict[str, Any]:
    """'Ask Veritas' conversational forensic assistant query endpoint."""
    return query_copilot(
        payload.query,
        api_key=payload.api_key,
        model=payload.model,
        history=payload.history,
    )


@router.post("/tenders/ingest")
def post_tender_ingest(payload: TenderIngestRequest) -> Dict[str, Any]:
    """Simulates autonomous multi-agent parsing of custom tender files."""
    return ingest_custom_tender(
        file_name=payload.file_name,
        tender_ref=payload.tender_ref or "GEM/2026/B/9928101",
        tender_value_cr=payload.value_cr or 45.0
    )


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


# =========================================================================
# ADVANCED NEXT-GEN SUITE (Forensics, Cure, Commercial, Policy, Real Ingest)
# =========================================================================

@router.get("/forensics/tampering/{bidder_id}")
def get_document_tampering_analysis(bidder_id: str) -> Dict[str, Any]:
    """PDF stream tampering heuristics, raster font mismatch, and ICAI UDIN check."""
    return get_bidder_document_forensics(bidder_id)


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
        bidder_name=payload.bidder_name
    )


@router.post("/legal/representation/decide")
def decide_bidder_representation(payload: CureDecisionRequest) -> Dict[str, Any]:
    """Procurement officer formally signs decision on representation."""
    try:
        return record_cure_decision(
            bidder_id=payload.bidder_id,
            officer_id=payload.officer_id or "OFF-8821",
            action=payload.action,
            justification=payload.justification
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/commercial/evaluation")
def get_commercial_bid_evaluation() -> Dict[str, Any]:
    """BoQ financial comparison, raw L1 discovery, and DPIIT PPO-MII purchase preference."""
    return get_commercial_evaluation()


@router.post("/commercial/match-price")
def post_commercial_price_match(payload: PriceMatchRequest) -> Dict[str, Any]:
    """Simulates statutory price matching under PPO-MII Class-I margin of preference."""
    return execute_price_match(payload.bidder_id or "BID-PQR-003")


@router.get("/policy/config")
def get_procurement_policy_configuration() -> Dict[str, Any]:
    """Fetches active GFR 2017 & GeM policy sandbox configuration and impact preview."""
    return {
        "policy": get_policy_config(),
        "impact": get_policy_impact_summary()
    }


@router.post("/policy/config")
def update_procurement_policy_configuration(payload: PolicyUpdateRequest) -> Dict[str, Any]:
    """Updates policy toggles and recalculates compliance impact."""
    return update_policy_config(payload.config, payload.officer_id or "OFF-8821")


@router.get("/forensics/historical/{bidder_id}")
def get_bidder_cross_tender_history(bidder_id: str) -> Dict[str, Any]:
    """Cross-tender historical performance and multi-tender contradiction detection."""
    return get_historical_profile(bidder_id)


@router.post("/documents/upload")
async def upload_pdf_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Live upload and entity extraction of any real PDF using pypdf."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return process_uploaded_pdf(contents, filename=file.filename or "uploaded.pdf")


@router.post("/bidders/upload-pdf")
async def upload_real_bidder_package(
    file: UploadFile = File(...),
    legal_name: str = Form(...)
) -> Dict[str, Any]:
    """Uploads real PDF package, extracts statutory entities, creates Bidder and updates Leaderboard."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return ingest_real_bidder_from_pdf(contents, filename=file.filename or "bidder_pkg.pdf", legal_name=legal_name, data_manager=DATA_MANAGER)


