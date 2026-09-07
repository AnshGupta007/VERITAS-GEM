"""
Automated tests for Real Tender Ingestion, Platform State Mutation,
and Dynamic Veritas Copilot Conversational Reasoning.
"""
import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)


def test_real_tender_ingest_state_mutation():
    """Ingesting a tender updates the active tender in the system."""
    payload = {
        "file_name": "GAIL_Gandhar_MOV_Valves_Tender_GEM2024B5351424.pdf",
        "tender_ref": "GEM/2024/B/5351424",
        "value_cr": 28.50,
        "organization": "GAIL (India) Limited (Gandhar LPG Plant / Western Region)",
        "title": "Supply, Testing and Commissioning of High-Pressure Motor Operated Valves (MOV) Package"
    }
    response = client.post("/api/tenders/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PROCESSED"
    assert data["tender_reference"] == "GEM/2024/B/5351424"
    assert data["estimated_value_cr"] == 28.50
    assert data["turnover_benchmark_cr"] == 8.55
    tender_id = data["tender_id"]

    # Verify GET /api/tenders returns the newly ingested tender
    t_resp = client.get("/api/tenders")
    assert t_resp.status_code == 200
    active_t = t_resp.json()
    assert active_t["tender_number"] == "GEM/2024/B/5351424"
    assert "GAIL" in active_t["organization"]
    assert active_t["estimated_value_inr"] == 285000000.0

    # Verify clauses are queryable
    c_resp = client.get(f"/api/tenders/{tender_id}/clauses")
    assert c_resp.status_code == 200
    c_data = c_resp.json()
    assert c_data["total_clauses"] >= 4
    assert any("4.2" in c["clause_no"] for c in c_data["clauses"])


def test_copilot_queries_with_active_tender():
    """Copilot answers queries dynamically based on the active tender and bidders."""
    # 1. Ask about the active tender
    resp_tender = client.post("/api/copilot/query", json={"query": "What is the active tender and its estimated value?"})
    assert resp_tender.status_code == 200
    data_t = resp_tender.json()
    assert data_t["found"] is True
    assert "GEM/2024/B/5351424" in data_t["answer"]
    assert "GAIL" in data_t["answer"]
    assert "28.50" in data_t["answer"]

    # 2. Ask about turnover requirement
    resp_turnover = client.post("/api/copilot/query", json={"query": "What is the turnover requirement for tender GEM/2024/B/5351424?"})
    assert resp_turnover.status_code == 200
    data_to = resp_turnover.json()
    assert "8.55" in data_to["answer"]
    assert "Rule 144" in data_to["answer"]

    # 3. Ask about bidder disqualification risk
    resp_risk = client.post("/api/copilot/query", json={"query": "Which bidder has the highest risk of disqualification?"})
    assert resp_risk.status_code == 200
    data_r = resp_risk.json()
    assert "ABC Industries" in data_r["answer"]
    assert "HIGH RISK" in data_r["answer"]

    # 4. Ask about compliant bidder
    resp_comp = client.post("/api/copilot/query", json={"query": "Which is the top-ranked compliant bidder?"})
    assert resp_comp.status_code == 200
    data_c = resp_comp.json()
    assert "PQR" in data_c["answer"]


def test_demo_reset_reverts_tender():
    """Resetting demo state reverts back to the baseline ONGC tender."""
    reset_resp = client.post("/api/demo/reset")
    assert reset_resp.status_code == 200

    # Check tender is back to ONGC
    t_resp = client.get("/api/tenders")
    assert t_resp.status_code == 200
    active_t = t_resp.json()
    assert active_t["tender_number"] == "GEM/2026/B/8849201"
    assert "ONGC" in active_t["organization"]
