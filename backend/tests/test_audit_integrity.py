"""Test Suite for Cryptographic Audit Ledger Integrity & Concurrency."""
import concurrent.futures
from pathlib import Path
from app.services.audit_ledger import AuditLedger


def test_chain_integrity_verification(fresh_audit_ledger):
    """Verify clean ledger passes cryptographic validation 100%."""
    res = fresh_audit_ledger.verify_integrity()
    assert res["chain_status"] == "INTACT"
    assert res["integrity_score"] == 100.0
    assert res["verified_blocks"] == res["total_blocks"]
    assert res["total_blocks"] >= 3
    assert res["tampered_block_id"] is None


def test_decision_event_chaining(tmp_path):
    """Test sequential event appending and cryptographic hash chaining."""
    log_file = tmp_path / "test_audit.json"
    ledger = AuditLedger(log_file=log_file)
    ledger.events = []  # Start completely empty

    # Append Event 1
    ev1 = ledger.record_decision_event(
        event_type="FINDING_ACCEPTED",
        officer_id="OFF-001",
        finding_id="FIND-01",
        bidder_id="BID-01",
        action_taken="ACCEPT_FINDING",
        reason="Verified against GSTN",
    )
    assert ev1.integrity_signature.startswith("sig-sha256-")

    # Append Event 2
    ev2 = ledger.record_decision_event(
        event_type="FINDING_OVERRIDDEN",
        officer_id="OFF-001",
        finding_id="FIND-02",
        bidder_id="BID-01",
        action_taken="OVERRIDE_FINDING",
        reason="Chartered accountant confirmation verified",
    )
    assert ev2.integrity_signature.startswith("sig-sha256-")
    assert ev1.integrity_signature != ev2.integrity_signature

    # Verify chain
    res = ledger.verify_integrity()
    assert res["chain_status"] == "INTACT"
    assert res["verified_blocks"] == 2
    assert res["integrity_score"] == 100.0


def test_tamper_detection_content_modification(fresh_audit_ledger):
    """Ensure tampering with an event's reason is immediately caught."""
    # Modify second event reason
    target_event = fresh_audit_ledger.events[1]
    target_id = target_event.event_id
    target_event.reason = "FORGED REASON INSERTED BY ADVERSARY"

    res = fresh_audit_ledger.verify_integrity()
    assert res["chain_status"] == "CORRUPTED"
    assert res["integrity_score"] == 0.0
    assert res["tampered_block_id"] == target_id
    assert "Signature mismatch" in res["tamper_reason"]


def test_tamper_detection_signature_modification(fresh_audit_ledger):
    """Ensure tampering with an event's cryptographic signature is caught."""
    fresh_audit_ledger.events[0].integrity_signature = "sig-sha256-00000000000000000000000000000000"

    res = fresh_audit_ledger.verify_integrity()
    assert res["chain_status"] == "CORRUPTED"
    assert res["tampered_block_id"] == fresh_audit_ledger.events[0].event_id


def test_thread_safe_concurrent_recording(tmp_path):
    """Verify thread-safe concurrent recording of audit events."""
    log_file = tmp_path / "concurrent_audit.json"
    ledger = AuditLedger(log_file=log_file)
    ledger.events = []

    def record_action(idx: int):
        ledger.record_decision_event(
            event_type="FINDING_ACCEPTED",
            officer_id=f"OFF-{idx:03d}",
            finding_id=f"FIND-{idx:03d}",
            bidder_id="BID-PQR-003",
            action_taken="ACCEPT_FINDING",
            reason=f"Concurrent verification worker {idx}",
        )

    num_threads = 15
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(record_action, i) for i in range(num_threads)]
        for f in concurrent.futures.as_completed(futures):
            f.result()

    assert len(ledger.events) == num_threads

    # Verify that the entire chain is cryptographically intact with zero corruptions
    res = ledger.verify_integrity()
    assert res["chain_status"] == "INTACT"
    assert res["verified_blocks"] == num_threads
    assert res["integrity_score"] == 100.0
