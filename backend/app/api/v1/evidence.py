"""Evidence inspection and contradiction endpoints."""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException

from ...dependencies import get_data_manager
from ...models import Contradiction
from ...services.contradiction_engine import (
    get_all_contradictions,
    get_contradictions_by_bidder,
)

router = APIRouter(tags=["Evidence & Contradictions"])


@router.get("/findings/{finding_id}/evidence")
def get_finding_evidence(finding_id: str, data_manager=Depends(get_data_manager)) -> Dict[str, Any]:
    """Retrieve complete 3-column evidence inspection dossier for a finding."""
    finding = data_manager.get_finding_by_id(finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail=f"Finding '{finding_id}' not found.")

    bidder = data_manager.get_bidder_by_id(finding.bidder_id)
    tender = data_manager.get_tender()

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
