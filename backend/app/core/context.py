"""
VERITAS-GEM Pipeline Context.

Immutable-ish data container that flows through the compliance pipeline stages.
Each stage reads from and writes to this context, maintaining a clear audit trail
of what data was available at each processing step.
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class StageResult:
    """Result of a single pipeline stage execution."""
    stage_name: str
    status: str  # COMPLETED, SKIPPED, FAILED
    started_at: str = ""
    completed_at: str = ""
    duration_ms: float = 0.0
    output_summary: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None


@dataclass
class PipelineContext:
    """
    Carries all data through the compliance evaluation pipeline.

    Each stage receives this context, reads what it needs, and writes
    its results back. The stage_results list provides a complete
    execution trace for debugging and audit purposes.
    """
    # Identity
    pipeline_id: str = ""
    correlation_id: str = ""
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    # Input Data
    tender_id: Optional[str] = None
    tender_data: Optional[Dict[str, Any]] = None
    bidder_ids: List[str] = field(default_factory=list)
    bidders_data: List[Dict[str, Any]] = field(default_factory=list)
    raw_documents: List[Dict[str, Any]] = field(default_factory=list)

    # Intermediate Results (populated by stages)
    parsed_clauses: List[Dict[str, Any]] = field(default_factory=list)
    bound_requirements: List[Dict[str, Any]] = field(default_factory=list)
    extracted_evidence: List[Dict[str, Any]] = field(default_factory=list)
    detected_contradictions: List[Dict[str, Any]] = field(default_factory=list)
    temporal_evaluations: List[Dict[str, Any]] = field(default_factory=list)
    source_verifications: List[Dict[str, Any]] = field(default_factory=list)
    computed_scores: List[Dict[str, Any]] = field(default_factory=list)
    findings: List[Dict[str, Any]] = field(default_factory=list)

    # Pipeline Execution Trace
    stage_results: List[StageResult] = field(default_factory=list)
    current_stage: Optional[str] = None
    completed_at: Optional[str] = None

    # Metadata
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_completed(self) -> bool:
        return self.completed_at is not None

    @property
    def failed_stages(self) -> List[StageResult]:
        return [s for s in self.stage_results if s.status == "FAILED"]

    @property
    def execution_summary(self) -> Dict[str, Any]:
        total_ms = sum(s.duration_ms for s in self.stage_results)
        return {
            "pipeline_id": self.pipeline_id,
            "tender_id": self.tender_id,
            "total_stages": len(self.stage_results),
            "completed_stages": len([s for s in self.stage_results if s.status == "COMPLETED"]),
            "failed_stages": len(self.failed_stages),
            "total_duration_ms": round(total_ms, 2),
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "findings_generated": len(self.findings),
            "contradictions_detected": len(self.detected_contradictions),
        }
