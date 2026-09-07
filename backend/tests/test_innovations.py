"""
Automated Test Suite for Groundbreaking Innovations in VERITAS-GEM.
Covers:
1. DPIIT PPO-MII Local Content & HSN Customs Deconstruction Engine
2. ICEGATE Import Reconciliation & Value Addition Formulas
3. GeM Webhook Integration Bridge & Inbound Bid Stream Pipeline
4. National Cross-PSU Inter-Agency Contradiction Memory
"""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services.customs_hsn_engine import (
    get_hsn_customs_deconstruction,
    HSN_CATALOG
)
from app.services.gem_bridge import simulate_gem_inbound_bid
from app.services.scoring_engine import DATA_MANAGER
from app.services.audit_ledger import AUDIT_LEDGER

client = TestClient(app)


def test_hsn_catalog_definitions():
    """Validates statutory HSN codes and duty percentages."""
    assert "84818090" in HSN_CATALOG
    assert "84122100" in HSN_CATALOG
    assert HSN_CATALOG["84818090"]["basic_customs_duty_percent"] == 7.5
    assert HSN_CATALOG["84818090"]["standard_domestic_va_target"] == 50.0


def test_hsn_customs_deconstruction_xyz_disguised_import():
    """
    Verifies that XYZ Corp's claimed 48.0% local content is deconstructed
    against ICEGATE Bills of Entry to reveal 24.2% verified domestic VA.
    """
    res = get_hsn_customs_deconstruction("BID-XYZ-002")
    assert res["bidder_id"] == "BID-XYZ-002"
    assert res["declared_local_content_percent"] == 48.0
    assert res["verified_local_content_percent"] == 24.2
    assert res["purchase_preference_eligible"] is False
    assert "Disguised" in res["audit_finding"] or "falsely classified" in res["audit_finding"]
    
    # Check BoM items
    assert len(res["bom_deconstruction"]) == 4
    valve_item = res["bom_deconstruction"][0]
    assert valve_item["customs_verification_status"] == "FLAGGED_DISGUISED_IMPORT"
    assert valve_item["verified_imported_cif_cr"] == 14.80


def test_hsn_customs_deconstruction_pqr_genuine_local_supplier():
    """
    Verifies that PQR Engineering is authenticated as a genuine Class-I
    domestic manufacturer with 71.3% verified domestic value addition.
    """
    res = get_hsn_customs_deconstruction("BID-PQR-003")
    assert res["bidder_id"] == "BID-PQR-003"
    assert res["declared_local_content_percent"] == 68.5
    assert res["verified_local_content_percent"] == 71.3
    assert res["purchase_preference_eligible"] is True
    assert "Class-I Local Supplier (Verified)" in res["verified_supplier_class"]


def test_hsn_customs_api_endpoints():
    """Tests GET /api/commercial/hsn-deconstruction/{bidder_id}."""
    resp = client.get("/api/commercial/hsn-deconstruction/BID-XYZ-002")
    assert resp.status_code == 200
    data = resp.json()
    assert data["verified_local_content_percent"] == 24.2
    assert data["purchase_preference_eligible"] is False

    resp_pqr = client.get("/api/commercial/hsn-deconstruction/BID-PQR-003")
    assert resp_pqr.status_code == 200
    assert resp_pqr.json()["purchase_preference_eligible"] is True


def test_gem_webhook_bid_stream_and_audit():
    """
    Tests simulated GeM webhook push, pipeline execution, and ledger entry.
    """
    resp = client.post("/api/gem/simulate-bid")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["bidder_id"] == "BID-HPC-004"
    assert data["verification"]["supplier_class"] == "Class-I Local Supplier (62.0% Local Content)"

    # Verify bidder is in DATA_MANAGER
    assert any(b.id == "BID-HPC-004" for b in DATA_MANAGER.bidders)
    b = next(b for b in DATA_MANAGER.bidders if b.id == "BID-HPC-004")
    assert b.legal_name == "Hindustan Petro Controls Pvt Ltd"

    # Verify event on AUDIT_LEDGER
    trail = AUDIT_LEDGER.get_trail()
    gem_events = [e for e in trail if e.event_type == "GEM_WEBHOOK_BID_INGESTION"]
    assert len(gem_events) >= 1
    latest_gem = gem_events[0]
    assert latest_gem.bidder_id == "BID-HPC-004"
    assert "GeM-SYSTEM-GATEWAY" in latest_gem.officer_id


def test_cross_psu_historical_intelligence():
    """
    Tests cross-tender contradiction memory across ONGC, GAIL, and IOCL.
    """
    resp = client.get("/api/forensics/historical/BID-ABC-001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["pan"] == "AAACA1234A"
    assert len(data["past_tender_history"]) >= 2
    assert len(data["cross_tender_anomalies"]) >= 1
    turnover_anomaly = [a for a in data["cross_tender_anomalies"] if a["type"] == "CROSS_TENDER_TURNOVER_INFLATION"]
    assert len(turnover_anomaly) == 1
    assert "GAIL" in turnover_anomaly[0]["description"]
