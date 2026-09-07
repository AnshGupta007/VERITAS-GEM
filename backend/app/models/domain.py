"""Pydantic Domain Models for VERITAS-GEM."""
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class Criticality(str, Enum):
    MANDATORY = "MANDATORY"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ValidationMethod(str, Enum):
    DETERMINISTIC = "DETERMINISTIC"
    NUMERIC_COMPARISON = "NUMERIC_COMPARISON"
    DATE_WINDOW = "DATE_WINDOW"
    SEMANTIC_MATCH = "SEMANTIC_MATCH"
    ENTITY_RESOLUTION = "ENTITY_RESOLUTION"
    SOURCE_CROSS_CHECK = "SOURCE_CROSS_CHECK"
    CROSS_DOCUMENT = "CROSS_DOCUMENT"
    HYBRID = "HYBRID"


class RiskCategory(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    VERIFIED = "VERIFIED"


class FindingStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    OVERRIDDEN = "OVERRIDDEN"
    ESCALATED = "ESCALATED"


class ProviderType(str, Enum):
    REAL = "REAL"
    MOCK = "MOCK"
    SIMULATED = "SIMULATED"
    CURATED = "CURATED"
    MANUAL = "MANUAL"


class Requirement(BaseModel):
    id: str
    clause_reference: str
    category: str  # Financial, Technical, Statutory, Certification, Local Content
    title: str
    description: str
    criticality: Criticality
    validation_method: ValidationMethod
    required_evidence_type: str
    applicable_rule: str
    threshold: Optional[str] = None


class TenderClause(BaseModel):
    id: str
    clause_no: str
    heading: str
    raw_text: str
    category: str
    criticality: Criticality
    requirements: List[Requirement] = []


class Tender(BaseModel):
    id: str
    tender_number: str
    title: str
    organization: str
    ministry: str
    estimated_value_inr: float
    published_date: str
    submission_deadline: str
    opening_date: str
    total_clauses: int
    mandatory_clauses_count: int
    high_criticality_count: int
    clauses: List[TenderClause] = []


class DocumentExcerpt(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    bounding_box: Optional[Dict[str, float]] = None  # {x, y, width, height}
    extracted_text: str
    field_label: str
    highlight_color: str = "#ef4444"


# Aliases for flexibility across pipeline and ingestion
Clause = TenderClause
EvidenceExcerpt = DocumentExcerpt


class Finding(BaseModel):
    id: str
    bidder_id: str
    requirement_id: str
    clause_reference: str
    category: str
    title: str
    severity: RiskCategory
    status: FindingStatus = FindingStatus.PENDING
    confidence_score: float  # 0.0 to 1.0
    validation_method: ValidationMethod
    ai_recommendation: str
    summary: str
    evidence_excerpts: List[DocumentExcerpt] = []
    source_verification_status: Optional[str] = None
    source_adapter: Optional[str] = None
    source_badge: Optional[ProviderType] = None
    decision_reason: Optional[str] = None
    decided_by: Optional[str] = None
    decided_at: Optional[str] = None


class Contradiction(BaseModel):
    id: str
    bidder_id: str
    dimension: str  # Turnover, Legal Name, Employee Count, Local Content
    title: str
    severity: RiskCategory
    gap_summary: str
    finding_id: Optional[str] = None
    doc_a: DocumentExcerpt
    doc_b: DocumentExcerpt
    analysis_text: str
    impact: str


class TemporalItem(BaseModel):
    id: str
    bidder_id: str
    certificate_name: str
    issuing_authority: str
    issue_date: str
    expiry_date: str
    validity_window_days: int
    status_on_submission_date: str  # VALID, EXPIRED, NOT_YET_ISSUED
    days_difference_on_submission: int
    current_status: str
    details: str
    warning_flag: bool = False


class DecomposedScorecard(BaseModel):
    mandatory_coverage_percent: float
    evidence_strength_percent: float
    source_verification_percent: float
    identity_consistency_percent: float
    temporal_validity_percent: float
    contradiction_risk_score: str  # HIGH, MEDIUM, LOW
    overall_confidence_percent: float


class Bidder(BaseModel):
    id: str
    legal_name: str
    trade_name: Optional[str] = None
    cin_or_reg_number: str
    gstin: str
    pan: str
    msme_status: str
    risk_category: RiskCategory
    scorecard: DecomposedScorecard
    total_findings: int
    high_risk_findings: int
    medium_risk_findings: int
    low_risk_findings: int
    contradictions_count: int
    temporal_violations_count: int
    documents_submitted: int
    submission_timestamp: str
    summary_verdict: str


class DecisionRequest(BaseModel):
    finding_id: str
    action: str  # ACCEPT_FINDING, OVERRIDE_FINDING, ESCALATE_TO_COMMITTEE
    officer_id: str = "OFF-8821"
    officer_name: str = "Sh. Rajesh Sharma"
    reason: Optional[str] = Field(None, description="Mandatory when overriding AI finding")


class DecisionResult(BaseModel):
    success: bool
    finding_id: str
    new_status: FindingStatus
    action: str
    audit_event_id: str
    timestamp: str
    message: str


class AuditEvent(BaseModel):
    event_id: str
    timestamp: str
    event_type: str
    officer_id: str
    finding_id: Optional[str] = None
    bidder_id: Optional[str] = None
    action_taken: str
    reason: Optional[str] = None
    model_version: str
    rule_version: str
    evidence_hash: str
    integrity_signature: str


class AdapterStatus(BaseModel):
    adapter_id: str
    name: str
    target_authority: str
    provider_type: ProviderType
    status: str  # ACTIVE, DEGRADED, SIMULATED
    latency_ms: int
    total_queries_served: int
    sample_identifier: str
    description: str


# Aliases for compatibility
Clause = TenderClause
EvidenceExcerpt = DocumentExcerpt

