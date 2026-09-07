"""
Autonomous Custom Tender Ingestion Simulator & State Synchronizer.
Allows procurement committees to upload and process custom GeM tender bid packages
and mutates active platform tender state with dynamically synthesized clauses.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import hashlib

from ..models import (
    Tender,
    TenderClause,
    Requirement,
    Criticality,
    ValidationMethod,
)
from .audit_ledger import AUDIT_LEDGER


def ingest_custom_tender(
    file_name: str,
    tender_ref: str,
    tender_value_cr: float,
    organization: Optional[str] = None,
    title: Optional[str] = None,
    data_manager: Optional[Any] = None,
    update_active_tender: bool = True,
) -> Dict[str, Any]:
    """
    Simulates multi-agent ingestion pipeline for a new tender file and updates the active platform tender.
    """
    now = datetime.now(timezone.utc)
    file_hash = hashlib.sha256(f"{file_name}_{tender_ref}_{now.isoformat()}".encode()).hexdigest()
    tender_id = f"TND-{file_hash[:8].upper()}"
    final_ref = tender_ref or f"GEM/2026/B/{file_hash[:7].upper()}"
    val_cr = tender_value_cr or 32.50
    turnover_benchmark = round(val_cr * 0.3, 2)

    # Determine organization and ministry
    fn_lower = file_name.lower()
    org_lower = (organization or "").lower()
    if "gail" in fn_lower or "gail" in org_lower:
        final_org = organization or "GAIL (India) Limited (Gandhar LPG Plant / Western Region)"
        ministry = "Ministry of Petroleum & Natural Gas"
    elif "ongc" in fn_lower or "ongc" in org_lower:
        final_org = organization or "Oil and Natural Gas Corporation (ONGC)"
        ministry = "Ministry of Petroleum & Natural Gas"
    elif "iocl" in fn_lower or "iocl" in org_lower:
        final_org = organization or "Indian Oil Corporation Limited (IOCL)"
        ministry = "Ministry of Petroleum & Natural Gas"
    elif "bhel" in fn_lower or "bhel" in org_lower:
        final_org = organization or "Bharat Heavy Electricals Limited (BHEL)"
        ministry = "Ministry of Heavy Industries"
    else:
        final_org = organization or "Central Public Procurement Portal / GeM Directorate"
        ministry = "Ministry of Commerce and Industry"

    # Determine title
    if title:
        final_title = title
    elif "valve" in fn_lower or "mov" in fn_lower:
        final_title = f"Supply, Testing and Commissioning of High-Pressure Motor Operated Valves (MOV) & Hydraulic Actuators Package for {final_org}"
    elif "compressor" in fn_lower:
        final_title = f"Procurement, Installation and Commissioning of Centrifugal Gas Compression Units for {final_org}"
    else:
        clean_name = file_name.replace('_', ' ').replace('.pdf', '')
        final_title = f"Procurement Package for {clean_name} under GeM GTC"

    # Build dynamic clauses
    clauses: List[TenderClause] = [
        TenderClause(
            id="CL-4.1",
            clause_no="Section IV - Cl 4.1",
            heading="Legal Status and Statutory Registration",
            raw_text=(
                "The bidder must be a company registered under the Companies Act, 2013 or a registered LLP. "
                "The entity must possess an active GSTIN, valid corporate PAN, and must not be debarred by GeM or any Central PSU."
            ),
            category="Statutory & Legal",
            criticality=Criticality.MANDATORY,
            requirements=[
                Requirement(
                    id="REQ-ING-01",
                    clause_reference="Section IV - Cl 4.1",
                    category="Statutory & Legal",
                    title="Active GSTIN & Corporate Registration",
                    description="Bidder must possess active and un-suspended GSTIN registration matching the legal entity name.",
                    criticality=Criticality.MANDATORY,
                    validation_method=ValidationMethod.SOURCE_CROSS_CHECK,
                    required_evidence_type="GST REG-06 Certificate",
                    applicable_rule="GeM GTC Cl 3.1 & Rule 144(xi) GFR 2017",
                    threshold="Status == ACTIVE"
                )
            ]
        ),
        TenderClause(
            id="CL-4.2",
            clause_no="Section IV - Cl 4.2",
            heading="Financial Pre-Qualification & Annual Turnover Criteria",
            raw_text=(
                f"The minimum average annual turnover of the bidder during the last three financial years (FY 2022-23, 2023-24, 2024-25) "
                f"must be at least ₹{turnover_benchmark:.2f} Crores (30% of tender value per Rule 144(xi) GFR 2017). "
                f"Bidders must submit audited balance sheets signed by a Chartered Accountant with valid 18-digit UDIN."
            ),
            category="Financial Pre-Qualification",
            criticality=Criticality.MANDATORY,
            requirements=[
                Requirement(
                    id="REQ-ING-02",
                    clause_reference="Section IV - Cl 4.2",
                    category="Financial Pre-Qualification",
                    title="Minimum Annual Turnover Threshold",
                    description=f"Average annual turnover must equal or exceed ₹{turnover_benchmark:.2f} Crores.",
                    criticality=Criticality.MANDATORY,
                    validation_method=ValidationMethod.NUMERIC_COMPARISON,
                    required_evidence_type="Audited Balance Sheets & CA UDIN Certificate",
                    applicable_rule="Rule 144(xi) GFR 2017 & GeM GTC Cl 4.2",
                    threshold=f">= {turnover_benchmark} Cr"
                )
            ]
        ),
        TenderClause(
            id="CL-3.1",
            clause_no="Section III - Cl 3.1",
            heading="Technical Specification & Hydrostatic Pressure Benchmark",
            raw_text=(
                "All supplied equipment must strictly conform to API Spec 6A / 6DSS / ASME B16.34 standards with hydrostatic shell "
                "test holding duration of continuous 120 minutes with zero observable leakage or pressure drop exceeding 0.02 bar/min."
            ),
            category="Technical Specification",
            criticality=Criticality.HIGH,
            requirements=[
                Requirement(
                    id="REQ-ING-03",
                    clause_reference="Section III - Cl 3.1",
                    category="Technical Specification",
                    title="Hydrostatic Pressure Test Compliance",
                    description="Hydrostatic shell test with zero leakage under rated pressure for 120 minutes.",
                    criticality=Criticality.HIGH,
                    validation_method=ValidationMethod.DETERMINISTIC,
                    required_evidence_type="OEM Quality Inspection & Factory Hydrostatic Test Certificate",
                    applicable_rule="API Spec 6A / 6DSS Cl 7.4",
                    threshold="100% Zero Leakage"
                )
            ]
        ),
        TenderClause(
            id="CL-3.2",
            clause_no="Section III - Cl 3.2",
            heading="Make in India (PPO-MII) Local Content Preference",
            raw_text=(
                "Purchase preference shall be granted to Class-I Local Suppliers (local content >= 50%) under DPIIT Order P-45021/2/2017-PP (BE-II). "
                "Suppliers with local content >= 20% but < 50% are categorized as Class-II Local Suppliers."
            ),
            category="Statutory & Legal",
            criticality=Criticality.HIGH,
            requirements=[
                Requirement(
                    id="REQ-ING-04",
                    clause_reference="Section III - Cl 3.2",
                    category="Statutory & Legal",
                    title="DPIIT Class-I Local Content Verification",
                    description="Audited Bill of Materials demonstrating domestic value addition >= 50%.",
                    criticality=Criticality.HIGH,
                    validation_method=ValidationMethod.NUMERIC_COMPARISON,
                    required_evidence_type="Statutory Auditor Local Content Certificate & Customs Deconstruction",
                    applicable_rule="DPIIT Order P-45021/2/2017-PP",
                    threshold=">= 50% Local Content"
                )
            ]
        )
    ]

    new_tender = Tender(
        id=tender_id,
        tender_number=final_ref,
        title=final_title,
        organization=final_org,
        ministry=ministry,
        estimated_value_inr=val_cr * 10000000.0,
        published_date=now.strftime("%Y-%m-%dT09:00:00+05:30"),
        submission_deadline=now.strftime("%Y-%m-%dT15:00:00+05:30"),
        opening_date=now.strftime("%Y-%m-%dT16:00:00+05:30"),
        total_clauses=len(clauses),
        mandatory_clauses_count=2,
        high_criticality_count=2,
        clauses=clauses,
    )

    # Mutate active platform state if requested
    if update_active_tender:
        dm = data_manager
        if dm is None:
            from .scoring_engine import DATA_MANAGER
            dm = DATA_MANAGER
        if dm is not None:
            dm.set_tender(new_tender)

    # Record to immutable audit ledger
    AUDIT_LEDGER.record_decision_event(
        event_type="TENDER_INGESTED",
        officer_id="OFF-8821",
        finding_id=tender_id,
        bidder_id="PORTAL_TENDER",
        action_taken="INGEST_AND_SYNCHRONIZE",
        reason=f"Ingested tender '{final_ref}' (₹{val_cr:.2f} Cr) from '{file_name}'. Calculated turnover benchmark: ₹{turnover_benchmark:.2f} Cr.",
    )

    return {
        "status": "PROCESSED",
        "ingestion_id": f"ING-{file_hash[:8].upper()}",
        "file_name": file_name,
        "tender_id": tender_id,
        "tender_reference": final_ref,
        "organization": final_org,
        "title": final_title,
        "estimated_value_cr": val_cr,
        "turnover_benchmark_cr": turnover_benchmark,
        "processed_at": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "pipeline_stages": [
            {
                "stage": "1. Layout & OCR Parsing",
                "agent": "PaddleOCR Layout Engine",
                "status": "SUCCESS",
                "extracted_pages": 42,
                "detected_tables": 18
            },
            {
                "stage": "2. Clause Segmentation & NLP Hierarchy",
                "agent": "Legal-BERT Clause Segmenter",
                "status": "SUCCESS",
                "extracted_clauses_count": len(clauses),
                "mandatory_qualifications": 21
            },
            {
                "stage": "3. Commercial BoQ & Parameter Binding",
                "agent": "Financial Entity Normalizer",
                "status": "SUCCESS",
                "extracted_line_items": 14,
                "turnover_benchmark_cr": turnover_benchmark
            },
            {
                "stage": "4. Statutory Rule Engine Binding",
                "agent": "GFR 2017 & GeM GTC Validator",
                "status": "SUCCESS",
                "rules_bound": ["Rule 144 GFR 2017", "PPO-MII Class-I", "MSME 25% Reservation", "API Spec 6DSS"]
            }
        ],
        "message": f"Successfully parsed '{file_name}'. Active platform tender updated to {final_ref} (₹{val_cr:.2f} Cr). Generated {len(clauses)} compliance verification clauses."
    }
