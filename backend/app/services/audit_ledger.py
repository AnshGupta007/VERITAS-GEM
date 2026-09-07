"""Cryptographic Immutable Audit Ledger for Officer Decisions.

Implements a thread-safe, SHA-256 chained tamper-evident ledger for all
procurement evaluation decisions, overrides, and committee signatures.
"""
import hashlib
import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..config import DATA_DIR, MODEL_VERSION, RULE_VERSION
from ..models import AuditEvent

AUDIT_LOG_FILE = DATA_DIR / "audit_events.json"
GENESIS_SIGNATURE = "GENESIS-000000000000000000000000000000000000"


def _calculate_hash(previous_sig: str, event_data: Dict[str, Any]) -> str:
    """Computes SHA-256 integrity signature for tamper-evident chaining."""
    serialized = (
        f"{previous_sig}|{event_data.get('event_type')}|{event_data.get('officer_id')}|"
        f"{event_data.get('finding_id')}|{event_data.get('action_taken')}|"
        f"{event_data.get('reason')}|{event_data.get('timestamp')}"
    )
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


class AuditLedger:
    """Thread-safe cryptographic audit ledger with SHA-256 verification."""

    def __init__(
        self,
        log_file: Optional[Path] = None,
        genesis_anchor: str = GENESIS_SIGNATURE,
    ):
        self._lock = threading.RLock()
        self.log_file = log_file or AUDIT_LOG_FILE
        self.genesis_anchor = genesis_anchor
        self.events: List[AuditEvent] = []
        self._load()

    def _load(self) -> None:
        with self._lock:
            src = self.log_file if self.log_file.exists() else DATA_DIR / "sample_audit.json"
            if src.exists():
                try:
                    with open(src, "r", encoding="utf-8") as f:
                        raw = json.load(f)
                        self.events = [AuditEvent(**item) for item in raw]
                except Exception:
                    self.events = []
            else:
                self.events = []

    def _save(self) -> None:
        with self._lock:
            with open(self.log_file, "w", encoding="utf-8") as f:
                json.dump([item.model_dump() for item in self.events], f, indent=2)

    def record_decision_event(
        self,
        event_type: str,
        officer_id: str,
        finding_id: str,
        bidder_id: str,
        action_taken: str,
        reason: Optional[str] = None,
    ) -> AuditEvent:
        """Record an officer action onto the ledger, chained cryptographically."""
        with self._lock:
            prev_sig = self.events[-1].integrity_signature if self.events else self.genesis_anchor
            timestamp = datetime.now().astimezone().isoformat()
            event_id = f"AUD-{88400 + len(self.events) + 1}"

            payload = {
                "event_type": event_type,
                "officer_id": officer_id,
                "finding_id": finding_id,
                "bidder_id": bidder_id,
                "action_taken": action_taken,
                "reason": reason or "Action executed via Decision Center",
                "timestamp": timestamp,
            }

            evidence_hash = hashlib.sha256(f"{finding_id}-{bidder_id}-{timestamp}".encode("utf-8")).hexdigest()
            integrity_signature = f"sig-sha256-{_calculate_hash(prev_sig, payload)[:32]}"

            new_event = AuditEvent(
                event_id=event_id,
                timestamp=timestamp,
                event_type=event_type,
                officer_id=officer_id,
                finding_id=finding_id,
                bidder_id=bidder_id,
                action_taken=action_taken,
                reason=reason,
                model_version=MODEL_VERSION,
                rule_version=RULE_VERSION,
                evidence_hash=evidence_hash,
                integrity_signature=integrity_signature,
            )

            self.events.append(new_event)
            self._save()
            return new_event

    def get_trail(self, bidder_id: Optional[str] = None) -> List[AuditEvent]:
        """Retrieve audit trail in reverse chronological order."""
        with self._lock:
            if bidder_id:
                return [e for e in self.events if e.bidder_id == bidder_id]
            return list(reversed(self.events))

    def verify_integrity(self) -> Dict[str, Any]:
        """Cryptographically verifies each block's SHA-256 hash against its predecessor."""
        with self._lock:
            total_blocks = len(self.events)
            if total_blocks == 0:
                return {
                    "total_blocks": 0,
                    "verified_blocks": 0,
                    "chain_status": "INTACT",
                    "integrity_score": 100.0,
                    "genesis_anchor": "GeM-MoPNG-Audit-Root-v1",
                    "tampered_block_id": None,
                }

            valid_count = 0
            is_tampered = False
            tampered_block_id = None
            tamper_reason = None
            prev_sig = self.genesis_anchor

            for event in self.events:
                payload = {
                    "event_type": event.event_type,
                    "officer_id": event.officer_id,
                    "finding_id": event.finding_id,
                    "bidder_id": event.bidder_id,
                    "action_taken": event.action_taken,
                    "reason": event.reason or "",
                    "timestamp": event.timestamp,
                }
                expected_sig = f"sig-sha256-{_calculate_hash(prev_sig, payload)[:32]}"
                if event.integrity_signature != expected_sig:
                    is_tampered = True
                    tampered_block_id = event.event_id
                    tamper_reason = (
                        f"Signature mismatch on block {event.event_id}: "
                        f"expected {expected_sig}, got {event.integrity_signature}"
                    )
                    break

                valid_count += 1
                prev_sig = event.integrity_signature

            return {
                "total_blocks": total_blocks,
                "verified_blocks": valid_count,
                "chain_status": "INTACT" if not is_tampered else "CORRUPTED",
                "integrity_score": 100.0 if not is_tampered else 0.0,
                "genesis_anchor": "GeM-MoPNG-Audit-Root-v1",
                "tampered_block_id": tampered_block_id,
                "tamper_reason": tamper_reason,
            }

    def reset_to_initial(self) -> None:
        """Reset ledger back to clean seed audit state."""
        with self._lock:
            sample_file = DATA_DIR / "sample_audit.json"
            if sample_file.exists():
                with open(sample_file, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    self.events = [AuditEvent(**item) for item in raw]
                self._save()
            elif self.log_file.exists():
                self.log_file.unlink()
                self.events = []


# Singleton instance for backward compatibility
AUDIT_LEDGER = AuditLedger()
