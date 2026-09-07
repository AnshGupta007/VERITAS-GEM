"""
Comprehensive Automated Test Suite for VERITAS-GEM Enterprise Platform.
Validates:
1. Document Forensics & ICAI 18-digit UDIN Validator
2. Bidder Representation & Cure Verification Lifecycle
3. Commercial BoQ Financial Evaluation & DPIIT PPO-MII L1 Price Preference
4. Dynamic Policy Sandbox & GFR Rule Toggles
5. Cross-Tender Historical Intelligence
6. Live PDF Parsing & Stream Ingestion Engine
"""
import sys
import io
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
import pypdf

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services.document_forensics import validate_udin

client = TestClient(app)


def test_udin_algorithmic_validation():
    # 1. Valid UDIN
    valid_res = validate_udin("26094123CERT894102")
    assert valid_res["is_valid"] is True
    assert valid_res["status"] == "VERIFIED_ACTIVE"
    assert valid_res["components"]["issuance_year"] == "2026"

    # 2. Invalid length
    short_res = validate_udin("26094123CERT")
    assert short_res["is_valid"] is False
    assert short_res["status"] == "INVALID_FORMAT"

    # 3. Invalid year (prior to 2019)
    past_res = validate_udin("15094123CERT894102")
    assert past_res["is_valid"] is False
    assert past_res["status"] == "INVALID_YEAR"

    # 4. Dummy synthetic sequence
    dummy_res = validate_udin("24058291AAAA000000")
    assert dummy_res["is_valid"] is False
    assert dummy_res["status"] == "SUSPECT_SYNTHETIC_UDIN"


def test_bidder_document_forensics():
    # High risk bidder ABC (Photoshop & synthetic UDIN)
    resp_abc = client.get("/api/forensics/tampering/BID-ABC-001")
    assert resp_abc.status_code == 200
    data_abc = resp_abc.json()
    assert data_abc["risk_classification"] == "CRITICAL_TAMPER_SUSPECT"
    assert data_abc["tamper_probability_percent"] > 60.0
    assert len(data_abc["evaluated_documents"]) >= 2

    # Clean bidder PQR (DigiLocker cryptographically verified)
    resp_pqr = client.get("/api/forensics/tampering/BID-PQR-003")
    assert resp_pqr.status_code == 200
    data_pqr = resp_pqr.json()
    assert data_pqr["risk_classification"] == "AUTHENTIC_VERIFIED"
    assert data_pqr["tamper_probability_percent"] < 5.0


def test_bidder_representation_and_cure_lifecycle():
    # 1. Get existing representation for ABC
    resp_get = client.get("/api/legal/representation/BID-ABC-001")
    assert resp_get.status_code == 200
    rep_abc = resp_get.json()
    assert rep_abc["ai_evaluation"]["status"] == "CURE_PARTIALLY_DEFICIENT"

    # 2. Submit new representation for a custom bidder
    sub_payload = {
        "bidder_id": "BID-XYZ-002",
        "rejoinder_text": "Submitting revised domestic value addition certificate with UDIN 26084129FINS481920",
        "attached_documents": [{"file_name": "Tier1_Cost_Audit.pdf", "udin": "26084129FINS481920"}],
        "bidder_name": "XYZ Corporation India Pvt Ltd"
    }
    resp_sub = client.post("/api/legal/representation/submit", json=sub_payload)
    assert resp_sub.status_code == 200
    assert resp_sub.json()["ai_evaluation"]["status"] == "CURE_SUFFICIENT_AND_VERIFIED"

    # 3. Officer signs decision on representation
    decide_payload = {
        "bidder_id": "BID-XYZ-002",
        "officer_id": "OFF-8821",
        "action": "ACCEPT_CURE_QUALIFY",
        "justification": "Cost Auditor UDIN certificate verified on ICAI registry. Reinstating Class-I local content status."
    }
    resp_decide = client.post("/api/legal/representation/decide", json=decide_payload)
    assert resp_decide.status_code == 200
    data_decide = resp_decide.json()
    assert data_decide["resulting_status"] == "REINSTATED_QUALIFIED"
    assert "audit_event_id" in data_decide


def test_commercial_financial_evaluation_and_l1_matching():
    # 1. Get commercial evaluation
    resp_eval = client.get("/api/commercial/evaluation")
    assert resp_eval.status_code == 200
    comm_data = resp_eval.json()

    # Raw L1 is XYZ Corp at ₹49.324 Cr
    assert comm_data["raw_l1_bidder"] == "XYZ Corporation India Pvt Ltd"
    assert comm_data["raw_l1_price_cr"] == 49.324

    # PQR is within 20% PPO-MII margin
    assert comm_data["is_pqr_eligible_to_match"] is True
    assert comm_data["price_gap_percentage"] < 10.0

    # ABC is disqualified and envelope unopened
    abc_bid = next(b for b in comm_data["bidders_commercial_table"] if b["bidder_id"] == "BID-ABC-001")
    assert abc_bid["technical_status"] == "DISQUALIFIED_TECHNICAL"

    # 2. Simulate statutory price match by PQR
    resp_match = client.post("/api/commercial/match-price", json={"bidder_id": "BID-PQR-003"})
    assert resp_match.status_code == 200
    match_data = resp_match.json()
    assert match_data["matched_price_cr"] == 49.324
    assert match_data["savings_to_procuring_entity_cr"] > 2.0


def test_policy_sandbox_toggles():
    # 1. Fetch current policy
    resp_get = client.get("/api/policy/config")
    assert resp_get.status_code == 200
    policy_data = resp_get.json()
    assert "startup_india_exemption" in policy_data["policy"]

    # 2. Update policy toggle (Enable Startup Exemption)
    update_payload = {
        "config": {
            "startup_india_exemption": True,
            "class_1_local_content_threshold": 45.0
        },
        "officer_id": "OFF-8821"
    }
    resp_upd = client.post("/api/policy/config", json=update_payload)
    assert resp_upd.status_code == 200
    upd_data = resp_upd.json()
    assert upd_data["status"] == "POLICY_UPDATED"
    assert upd_data["active_config"]["startup_india_exemption"] is True
    assert len(upd_data["impact_summary"]["simulated_impacts"]) >= 2


def test_cross_tender_historical_intelligence():
    resp_hist = client.get("/api/forensics/historical/BID-ABC-001")
    assert resp_hist.status_code == 200
    hist_data = resp_hist.json()
    assert hist_data["integrity_risk_index"] > 70.0
    assert len(hist_data["past_tender_history"]) >= 2
    assert len(hist_data["cross_tender_anomalies"]) >= 1
    assert "CROSS_TENDER_TURNOVER_INFLATION" in str(hist_data)


def test_live_pdf_upload_and_extraction():
    # Create a synthetic in-memory PDF with statutory text
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    pdf_bytes = pdf_buffer.getvalue()

    # Upload PDF via REST endpoint
    files = {"file": ("ONGC_Tender_Amendment_2026.pdf", pdf_bytes, "application/pdf")}
    resp_upload = client.post("/api/documents/upload", files=files)
    assert resp_upload.status_code == 200
    upload_data = resp_upload.json()
    assert upload_data["filename"] == "ONGC_Tender_Amendment_2026.pdf"
    assert "forensic_report" in upload_data
    assert "ingestion_id" in upload_data


def test_live_bidder_pdf_ingest_and_leaderboard_update():
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    pdf_buffer = io.BytesIO()
    writer.write(pdf_buffer)
    pdf_bytes = pdf_buffer.getvalue()

    files = {"file": ("Kirloskar_Subsea_Pack.pdf", pdf_bytes, "application/pdf")}
    data = {"legal_name": "Kirloskar Subsea Solutions Pvt Ltd"}

    resp_ingest = client.post("/api/bidders/upload-pdf", files=files, data=data)
    assert resp_ingest.status_code == 200
    ingest_data = resp_ingest.json()
    assert ingest_data["status"] == "BIDDER_CREATED"
    assert ingest_data["bidder"]["legal_name"] == "Kirloskar Subsea Solutions Pvt Ltd"

    # Verify newly created bidder is retrievable on leaderboard
    resp_bidders = client.get("/api/bidders")
    assert resp_bidders.status_code == 200
    bidder_names = [b["legal_name"] for b in resp_bidders.json()]
    assert "Kirloskar Subsea Solutions Pvt Ltd" in bidder_names
