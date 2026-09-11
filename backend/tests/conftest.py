"""Pytest fixtures and configuration for VERITAS-GEM test suites."""
import os
import sys
from pathlib import Path

# Mark test environment so deterministic test assertions are preserved
os.environ["IS_PYTEST_RUN"] = "1"

import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in python path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.core.events import EventBus
from app.core.context import PipelineContext
from app.core.pipeline import CompliancePipeline
from app.services.audit_ledger import AuditLedger
from app.services.scoring_engine import ProcurementDataManager


@pytest.fixture
def client():
    """FastAPI TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def event_bus():
    """Isolated EventBus instance."""
    return EventBus()


@pytest.fixture
def sample_context():
    """Fresh sample PipelineContext for pipeline testing."""
    return PipelineContext(
        tender_id="TND-TEST-001",
        tender_data={
            "tender_number": "GEM/2026/TEST/001",
            "clauses": [
                {
                    "clause_no": "CL-01",
                    "heading": "Technical Qualification",
                    "requirements": [
                        {"id": "REQ-01", "title": "Minimum Annual Turnover", "threshold": 50.0},
                        {"id": "REQ-02", "title": "ISO 9001 Certification", "threshold": "Mandatory"},
                    ],
                }
            ],
        },
        bidder_ids=["BID-001", "BID-002"],
        raw_documents=[
            {"doc_id": "DOC-01", "name": "Balance_Sheet.pdf"},
            {"doc_id": "DOC-02", "name": "ISO_Cert.pdf"},
        ],
    )


@pytest.fixture
def pipeline(event_bus):
    """CompliancePipeline instance with injected EventBus."""
    return CompliancePipeline(event_bus=event_bus)


@pytest.fixture
def fresh_audit_ledger():
    """AuditLedger instance reset to clean sample state."""
    ledger = AuditLedger()
    ledger.reset_to_initial()
    return ledger


@pytest.fixture
def fresh_data_manager(fresh_audit_ledger, event_bus):
    """ProcurementDataManager with injected dependencies."""
    dm = ProcurementDataManager(audit_ledger=fresh_audit_ledger, event_bus=event_bus)
    dm.reset_demo_state()
    return dm
