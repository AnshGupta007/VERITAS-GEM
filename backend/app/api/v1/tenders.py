"""Tender management and document upload endpoints."""
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from pydantic import BaseModel

from ...dependencies import get_data_manager
from ...models import Tender
from ...services.live_ingestion import process_uploaded_pdf
from ...services.tender_ingestion import ingest_custom_tender

router = APIRouter(tags=["Tenders & Documents"])


class TenderIngestRequest(BaseModel):
    file_name: str
    tender_ref: Optional[str] = None
    value_cr: Optional[float] = None
    organization: Optional[str] = None
    title: Optional[str] = None


@router.get("/tenders", response_model=Optional[Tender])
def get_current_tender(data_manager=Depends(get_data_manager)):
    """Retrieve active tender details and parsed clauses."""
    tender = data_manager.get_tender()
    if not tender:
        raise HTTPException(status_code=404, detail="No active tender loaded.")
    return tender


@router.get("/tenders/{tender_id}/clauses")
def get_tender_clauses(
    tender_id: str,
    category: Optional[str] = Query(None, description="Filter by clause category"),
    criticality: Optional[str] = Query(None, description="Filter by criticality level"),
    data_manager=Depends(get_data_manager),
) -> Dict[str, Any]:
    """Get structured tender clauses and compliance requirements."""
    tender = data_manager.get_tender()
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


@router.post("/tenders/ingest")
def post_tender_ingest(
    payload: TenderIngestRequest,
    data_manager=Depends(get_data_manager),
) -> Dict[str, Any]:
    """Simulates autonomous multi-agent parsing of custom tender files and updates active tender."""
    return ingest_custom_tender(
        file_name=payload.file_name,
        tender_ref=payload.tender_ref or "GEM/2026/B/9928101",
        tender_value_cr=payload.value_cr or 45.0,
        organization=payload.organization,
        title=payload.title,
        data_manager=data_manager,
    )


@router.post("/documents/upload")
async def upload_pdf_document(
    file: UploadFile = File(...),
    data_manager=Depends(get_data_manager),
) -> Dict[str, Any]:
    """Live upload and entity extraction of any real PDF using pypdf."""
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    filename = file.filename or "uploaded.pdf"
    result = process_uploaded_pdf(contents, filename=filename)

    # If the uploaded file is a tender document, synchronize active platform tender
    if result.get("detected_role") == "TENDER_SPECIFICATION":
        extracted = result.get("extracted_entities", {})
        tender_refs = extracted.get("tender_refs") or []
        tender_ref = tender_refs[0] if len(tender_refs) > 0 else f"GEM/2026/B/{result['ingestion_id'][-7:]}"
        val_cr = extracted.get("turnover_cr") or 35.0
        ingest_custom_tender(
            file_name=filename,
            tender_ref=tender_ref,
            tender_value_cr=val_cr,
            data_manager=data_manager,
        )

    return result
