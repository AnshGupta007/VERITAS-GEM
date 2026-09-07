"""Test Suite for VERITAS-GEM Compliance Pipeline Engine & Core Infrastructure."""
import pytest
from app.core.events import DomainEvent, EventBus, EventPayload
from app.core.context import PipelineContext, StageResult
from app.core.pipeline import (
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


def test_pipeline_context_initialization():
    """Verify PipelineContext default properties and summary calculation."""
    ctx = PipelineContext(tender_id="TND-INIT-001")
    assert ctx.tender_id == "TND-INIT-001"
    assert ctx.is_completed is False
    assert len(ctx.stage_results) == 0
    assert len(ctx.failed_stages) == 0

    # Add a mock stage result
    ctx.stage_results.append(
        StageResult(
            stage_name="mock_stage",
            status="COMPLETED",
            duration_ms=12.5,
        )
    )
    summary = ctx.execution_summary
    assert summary["total_stages"] == 1
    assert summary["completed_stages"] == 1
    assert summary["failed_stages"] == 0
    assert summary["total_duration_ms"] == 12.5


@pytest.mark.anyio
async def test_individual_stages(sample_context):
    """Test unit execution of discrete pipeline stages."""
    # 1. Tender Parsing
    parse_stage = TenderParsingStage()
    ctx = await parse_stage.execute(sample_context)
    assert len(ctx.parsed_clauses) == 1
    assert ctx.parsed_clauses[0]["clause_no"] == "CL-01"

    # 2. Requirement Binding
    bind_stage = RequirementBindingStage()
    ctx = await bind_stage.execute(ctx)
    assert len(ctx.bound_requirements) == 2
    assert ctx.bound_requirements[0]["clause_reference"] == "CL-01"

    # 3. Evidence Extraction
    evidence_stage = EvidenceExtractionStage()
    ctx = await evidence_stage.execute(ctx)
    assert len(ctx.extracted_evidence) == 2


@pytest.mark.anyio
async def test_full_pipeline_execution(pipeline, sample_context):
    """Execute complete 8-stage compliance pipeline."""
    result_ctx = await pipeline.run(sample_context)

    assert result_ctx.is_completed is True
    assert result_ctx.pipeline_id.startswith("PL-")
    assert len(result_ctx.stage_results) == 8

    # Ensure all default stages completed successfully
    for res in result_ctx.stage_results:
        assert res.status == "COMPLETED"
        assert res.duration_ms >= 0
        assert res.error is None

    summary = result_ctx.execution_summary
    assert summary["total_stages"] == 8
    assert summary["completed_stages"] == 8
    assert summary["failed_stages"] == 0
    assert summary["total_duration_ms"] > 0


@pytest.mark.anyio
async def test_pipeline_event_emission(sample_context):
    """Verify pipeline emits PIPELINE_STAGE_COMPLETED and PIPELINE_COMPLETED events."""
    bus = EventBus()
    received_stages = []
    received_completion = []

    def on_stage_completed(payload: EventPayload):
        received_stages.append(payload.data["stage"])

    def on_pipeline_completed(payload: EventPayload):
        received_completion.append(payload.data)

    bus.subscribe(DomainEvent.PIPELINE_STAGE_COMPLETED, on_stage_completed)
    bus.subscribe(DomainEvent.PIPELINE_COMPLETED, on_pipeline_completed)

    pipe = CompliancePipeline(event_bus=bus)
    await pipe.run(sample_context)

    # 8 stages should emit 8 events
    assert len(received_stages) == 8
    assert "tender_parsing" in received_stages
    assert "audit_anchoring" in received_stages

    # 1 completion event
    assert len(received_completion) == 1
    assert received_completion[0]["completed_stages"] == 8


@pytest.mark.anyio
async def test_pipeline_stage_failure_isolation(sample_context):
    """Ensure pipeline isolates stage exceptions and halts execution cleanly."""
    class CrashingStage(PipelineStage):
        def __init__(self):
            super().__init__("crashing_stage", "Fails deliberately for test")

        async def execute(self, context: PipelineContext) -> PipelineContext:
            raise RuntimeError("Database connection timeout simulation")

    custom_pipeline = CompliancePipeline(
        stages=[
            TenderParsingStage(),
            CrashingStage(),
            RequirementBindingStage(),
        ]
    )

    result_ctx = await custom_pipeline.run(sample_context)

    # Tender parsing completed, crashing stage failed, requirement binding never ran
    assert len(result_ctx.stage_results) == 2
    assert result_ctx.stage_results[0].status == "COMPLETED"
    assert result_ctx.stage_results[1].status == "FAILED"
    assert "Database connection timeout simulation" in result_ctx.stage_results[1].error
    assert len(result_ctx.failed_stages) == 1
