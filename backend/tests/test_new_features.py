import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

def test_collusion_analysis():
    response = client.get("/api/forensics/collusion")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "EVALUATED"
    assert data["overall_collusion_score"] > 70.0
    assert len(data["metadata_evidence"]) >= 3
    assert len(data["plagiarism_matrix"]) >= 2

def test_collusion_network_graph():
    response = client.get("/api/forensics/network")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "links" in data
    assert len(data["nodes"]) >= 8
    assert len(data["links"]) >= 8

def test_shell_company_risk():
    # Test high-risk bidder
    resp_abc = client.get("/api/forensics/shell-risk/BID-ABC-001")
    assert resp_abc.status_code == 200
    data_abc = resp_abc.json()
    assert data_abc["shell_probability_percent"] > 75.0
    assert data_abc["risk_classification"] == "HIGH_SHELL_RISK"
    
    # Test clean bidder
    resp_pqr = client.get("/api/forensics/shell-risk/BID-PQR-003")
    assert resp_pqr.status_code == 200
    data_pqr = resp_pqr.json()
    assert data_pqr["shell_probability_percent"] < 10.0
    assert data_pqr["risk_classification"] == "VERIFIED_ECONOMIC_SUBSTANCE"

def test_show_cause_notice_generation():
    response = client.get("/api/legal/show-cause/BID-ABC-001")
    assert response.status_code == 200
    data = response.json()
    assert "SCN-ABC-001" in data["notice_ref"]
    assert "कारण बताओ नोटिस" in data["hindi_title"]
    assert len(data["findings"]) >= 2
    assert "qr_verification_token" in data
    assert data["cure_deadline_hours"] == 48

def test_copilot_queries():
    # Query about turnover discrepancy
    resp_turnover = client.post("/api/copilot/query", json={"query": "What is the turnover discrepancy for ABC Industries?"})
    assert resp_turnover.status_code == 200
    data = resp_turnover.json()
    assert "4,20,00,000" in data["answer"]
    assert len(data["citations"]) >= 1

    # Query about cartelization
    resp_cartel = client.post("/api/copilot/query", json={"query": "Is there any cartelization or bid rigging detected?"})
    assert resp_cartel.status_code == 200
    assert "81.5%" in resp_cartel.json()["answer"]

def test_custom_tender_ingest():
    payload = {
        "file_name": "ONGC_Subsea_Wellhead_Package_2026.pdf",
        "tender_ref": "GEM/2026/B/9944111",
        "value_cr": 72.0
    }
    response = client.post("/api/tenders/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "PROCESSED"
    assert len(data["pipeline_stages"]) == 4

def test_committee_consensus_and_sign():
    # 1. Get status
    resp_status = client.get("/api/committee/status")
    assert resp_status.status_code == 200
    data = resp_status.json()
    assert data["signed_count"] >= 2
    assert data["quorum_reached"] is True

    # 2. Sign member
    sign_payload = {
        "member_id": "MEM-FIN-03",
        "action": "CONCUR_WITH_REJECTION",
        "comments": "Financial scrutiny confirms material variance. Concur with chairperson's decision."
    }
    resp_sign = client.post("/api/committee/sign", json=sign_payload)
    assert resp_sign.status_code == 200
    data_sign = resp_sign.json()
    assert data_sign["status"] == "SUCCESS"
    assert "audit_event_id" in data_sign
    assert "integrity_signature" in data_sign

def test_audit_bugfixes():
    # 1. Verify invalid API route returns 404 JSON, not HTML index.html
    resp_404 = client.get("/api/nonexistent_endpoint")
    assert resp_404.status_code == 404
    assert resp_404.headers["content-type"].startswith("application/json")
    assert "not found" in resp_404.json()["detail"].lower()

    # 2. Verify invalid adapter ID returns 404
    resp_bad_adapter = client.post("/api/verification/adapters/test?adapter_id=INVALID-ID&identifier=ABC")
    assert resp_bad_adapter.status_code == 404

    # 3. Verify demo reset restores committee consensus baseline
    resp_reset = client.post("/api/demo/reset")
    assert resp_reset.status_code == 200
    
    resp_comm = client.get("/api/committee/status")
    assert resp_comm.status_code == 200
    members = resp_comm.json()["members"]
    assert members[2]["member_id"] == "MEM-FIN-03"
    assert members[2]["status"] == "PENDING"

