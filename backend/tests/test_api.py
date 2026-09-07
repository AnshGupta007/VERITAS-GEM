"""Comprehensive Test Suite for VERITAS-GEM REST API & Compliance Engines."""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend to path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services import DATA_MANAGER, AUDIT_LEDGER

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_state():
    """Ensure each test runs with fresh sample state."""
    DATA_MANAGER.reset_demo_state()
    yield
    DATA_MANAGER.reset_demo_state()


def test_system_status():
    resp = client.get("/api/system/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["platform"] == "VERITAS-GEM"
    assert data["status"] == "OPERATIONAL"
    assert "officer_session" in data
    assert data["audit_ledger"]["chain_status"] == "INTACT"


def test_get_tender():
    resp = client.get("/api/tenders")
    assert resp.status_code == 200
    data = resp.json()
    assert data["tender_number"] == "GEM/2026/B/8849201"
    assert data["total_clauses"] == 47
    assert len(data["clauses"]) > 0


def test_get_tender_clauses_filtered():
    # Filter by category
    resp = client.get("/api/tenders/TND-MoPNG-2026-0428/clauses?category=Financial")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_clauses"] >= 2
    for cl in data["clauses"]:
        assert cl["category"] == "Financial"


def test_list_bidders():
    resp = client.get("/api/bidders")
    assert resp.status_code == 200
    bidders = resp.json()
    assert len(bidders) == 3
    # Check ABC is High Risk, XYZ Medium, PQR Low
    abc = next(b for b in bidders if b["id"] == "BID-ABC-001")
    xyz = next(b for b in bidders if b["id"] == "BID-XYZ-002")
    pqr = next(b for b in bidders if b["id"] == "BID-PQR-003")
    assert abc["risk_category"] == "HIGH"
    assert xyz["risk_category"] == "MEDIUM"
    assert pqr["risk_category"] == "LOW"
    # Check scorecard dimensions exist
    assert "scorecard" in abc
    assert "mandatory_coverage_percent" in abc["scorecard"]
    assert "temporal_validity_percent" in abc["scorecard"]


def test_get_bidder_findings():
    resp = client.get("/api/bidders/BID-ABC-001/findings")
    assert resp.status_code == 200
    findings = resp.json()
    assert len(findings) >= 5
    # Finding 1 should be the material turnover contradiction
    turnover_f = next((f for f in findings if f["id"] == "FIND-ABC-01"), None)
    assert turnover_f is not None
    assert turnover_f["severity"] == "HIGH"
    assert len(turnover_f["evidence_excerpts"]) == 2


def test_get_finding_evidence():
    resp = client.get("/api/findings/FIND-ABC-01/evidence")
    assert resp.status_code == 200
    data = resp.json()
    assert data["dual_document_comparison"] is True
    assert len(data["excerpts"]) == 2
    assert "requirement" in data
    assert data["requirement"]["title"] == "Minimum Annual Turnover Threshold"


def test_contradictions():
    resp = client.get("/api/contradictions")
    assert resp.status_code == 200
    contradictions = resp.json()
    assert len(contradictions) >= 3

    # Check turnover contradiction
    t_contra = next(c for c in contradictions if c["dimension"] == "Financial Turnover")
    assert "₹4,20,00,000" in t_contra["gap_summary"]
    assert t_contra["doc_a"]["page_number"] == 17
    assert t_contra["doc_b"]["page_number"] == 3


def test_temporal_time_machine_anchor_date():
    # Evaluate ABC on anchor bid date (2026-09-15)
    resp = client.get("/api/temporal/BID-ABC-001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_anchor_date"] is True
    certs = data["certificates"]
    bis_cert = next(c for c in certs if "BIS" in c["certificate_name"])
    # BIS expired on 2026-06-09, so on 2026-09-15 it MUST be EXPIRED
    assert bis_cert["status_on_evaluated_date"] == "EXPIRED"
    assert bis_cert["warning_flag"] is True
    assert bis_cert["days_difference"] < 0


def test_temporal_time_machine_slider_simulation():
    # Drag slider to early 2025 when BIS was still valid
    resp = client.get("/api/temporal/simulate?date=2025-01-15&bidder_id=BID-ABC-001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["evaluated_date"] == "2025-01-15"
    bis_cert = next(c for c in data["certificates"] if "BIS" in c["certificate_name"])
    # On 15-Jan-2025, BIS was VALID
    assert bis_cert["status_on_evaluated_date"] == "VALID"
    assert bis_cert["warning_flag"] is False


def test_verification_adapters():
    resp = client.get("/api/verification/adapters")
    assert resp.status_code == 200
    adapters = resp.json()
    assert len(adapters) >= 5
    gst_adapter = next(a for a in adapters if "GSTN" in a["name"])
    assert gst_adapter["provider_type"] == "MOCK"

    # Test live adapter query
    test_resp = client.post("/api/verification/adapters/test?adapter_id=ADAPT-GSTN-01&identifier=27AAACB1234A1Z5")
    assert test_resp.status_code == 200
    test_data = test_resp.json()
    assert test_data["result"]["status"] == "Active"
    assert "Limited" in test_data["result"]["legal_name"]


def test_decision_override_validation():
    # Attempt override WITHOUT reason -> MUST fail with 400
    bad_req = {
        "finding_id": "FIND-ABC-01",
        "action": "OVERRIDE_FINDING",
        "officer_id": "OFF-8821",
        "officer_name": "Sh. Rajesh Sharma",
        "reason": "short",  # Too short (< 8 chars)
    }
    resp = client.post("/api/decisions", json=bad_req)
    assert resp.status_code == 400
    assert "mandatory" in resp.json()["detail"].lower()

    # Valid override with proper reason
    good_req = {
        "finding_id": "FIND-ABC-01",
        "action": "OVERRIDE_FINDING",
        "officer_id": "OFF-8821",
        "officer_name": "Sh. Rajesh Sharma",
        "reason": "Chartered Accountant verified original UDIN certificate in person. Figures reconciled.",
    }
    resp = client.post("/api/decisions", json=good_req)
    assert resp.status_code == 200
    result = resp.json()
    assert result["success"] is True
    assert result["new_status"] == "OVERRIDDEN"

    # Verify audit ledger recorded the override
    audit_resp = client.get("/api/audit")
    assert audit_resp.status_code == 200
    events = audit_resp.json()
    override_ev = next(e for e in events if e["finding_id"] == "FIND-ABC-01")
    assert override_ev["action_taken"] == "OVERRIDE_FINDING"
    assert "UDIN certificate" in override_ev["reason"]


def test_audit_integrity():
    resp = client.get("/api/audit/verify")
    assert resp.status_code == 200
    data = resp.json()
    assert data["chain_status"] == "INTACT"
    assert data["integrity_score"] == 100.0


def test_bidder_report():
    resp = client.get("/api/reports/BID-ABC-001")
    assert resp.status_code == 200
    report = resp.json()
    assert report["bidder"]["id"] == "BID-ABC-001"
    assert "findings" in report
    assert "contradictions" in report
    assert "temporal_validity" in report
    assert "signoff_block" in report


def test_v1_versioned_endpoints():
    """Verify newly decomposed /api/v1 endpoints operate identically to legacy endpoints."""
    # 1. System status
    resp = client.get("/api/v1/system/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["platform"] == "VERITAS-GEM"
    assert data["status"] == "OPERATIONAL"

    # 2. Bidders
    resp_bidders = client.get("/api/v1/bidders")
    assert resp_bidders.status_code == 200
    assert len(resp_bidders.json()) == 3

    # 3. Forensics
    resp_collusion = client.get("/api/v1/forensics/collusion")
    assert resp_collusion.status_code == 200

    # 4. Copilot Query
    resp_copilot = client.post("/api/v1/copilot/query", json={"query": "What is the turnover requirement?"})
    assert resp_copilot.status_code == 200
    assert "answer" in resp_copilot.json()


def test_request_id_and_tracing_headers():
    """Verify RequestIDMiddleware adds tracing headers and respects custom correlation IDs."""
    # Default generated ID
    resp = client.get("/api/v1/system/status")
    assert "X-Request-ID" in resp.headers
    assert len(resp.headers["X-Request-ID"]) > 10
    assert "X-Response-Time-Ms" in resp.headers
    assert "X-Powered-By" in resp.headers

    # Custom correlation ID propagation
    custom_id = "trace-sih-2026-xyz-001"
    resp_custom = client.get("/api/v1/system/status", headers={"X-Request-ID": custom_id})
    assert resp_custom.headers["X-Request-ID"] == custom_id


def test_standardized_error_envelope():
    """Verify global error handler normalizes errors into standardized JSON envelope."""
    resp = client.get("/api/findings/NON_EXISTENT_FINDING_XYZ/evidence")
    assert resp.status_code == 404
    data = resp.json()
    assert data["error"] is True
    assert data["code"] == "NOT_FOUND"
    assert "not found" in data["message"].lower()
    assert "request_id" in data
    assert "timestamp" in data

