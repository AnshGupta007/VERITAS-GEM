"""VERITAS-GEM Core Infrastructure Package.

Provides the foundational architecture components:
- EventBus: Asynchronous publish/subscribe event distribution.
- CompliancePipeline: Staged, deterministic compliance evaluation engine.
- PipelineContext: Data container traversing pipeline stages.
- Structured Logging: Request-correlated JSON and console logging.
"""
from .events import DomainEvent, EventBus, EventHandler, EventPayload
from .context import PipelineContext, StageResult
from .pipeline import (
    CompliancePipeline,
    PipelineStage,
    TenderParsingStage,
    RequirementBindingStage,
    EvidenceExtractionStage,
    ContradictionDetectionStage,
    TemporalValidationStage,
    SourceVerificationStage,
    ScoringStage,
    AuditAnchoringStage,
)
from .logging import (
    configure_logging,
    get_logger,
    bind_request_context,
    clear_request_context,
)

__all__ = [
    # Events
    "DomainEvent",
    "EventBus",
    "EventHandler",
    "EventPayload",
    # Context
    "PipelineContext",
    "StageResult",
    # Pipeline
    "CompliancePipeline",
    "PipelineStage",
    "TenderParsingStage",
    "RequirementBindingStage",
    "EvidenceExtractionStage",
    "ContradictionDetectionStage",
    "TemporalValidationStage",
    "SourceVerificationStage",
    "ScoringStage",
    "AuditAnchoringStage",
    # Logging
    "configure_logging",
    "get_logger",
    "bind_request_context",
    "clear_request_context",
]
