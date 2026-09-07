"""Scoring Engine and State Manager for Bidders and Findings.

Manages active tender compliance findings, human officer decisions,
and dynamically recalculates bidder risk scorecards. Supports dependency
injection of AuditLedger and EventBus, emitting domain events on decisions.
"""
import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..config import DATA_DIR
from ..core.events import DomainEvent, EventBus, EventPayload
from ..models import (
    Bidder,
    DecisionRequest,
    DecisionResult,
    Finding,
    FindingStatus,
    RiskCategory,
    Tender,
)
from .audit_ledger import AUDIT_LEDGER, AuditLedger

STATE_FINDINGS_FILE = DATA_DIR / "current_findings.json"
STATE_BIDDERS_FILE = DATA_DIR / "current_bidders.json"
STATE_TENDER_FILE = DATA_DIR / "current_tender.json"


class ProcurementDataManager:
    """State manager and scorecard engine with DI and event publishing."""

    def __init__(
        self,
        audit_ledger: Optional[AuditLedger] = None,
        event_bus: Optional[EventBus] = None,
    ):
        self._lock = threading.RLock()
        self.audit_ledger = audit_ledger or AUDIT_LEDGER
        self.event_bus = event_bus
        self.tender: Optional[Tender] = None
        self.bidders: List[Bidder] = []
        self.findings: List[Finding] = []
        self._initialize()

    def _initialize(self) -> None:
        with self._lock:
            # Load tender (from state file or fallback to sample)
            tender_path = STATE_TENDER_FILE if STATE_TENDER_FILE.exists() else DATA_DIR / "sample_tender.json"
            if tender_path.exists():
                with open(tender_path, "r", encoding="utf-8") as f:
                    self.tender = Tender(**json.load(f))

            # Load findings (from state file or fallback to sample)
            findings_path = STATE_FINDINGS_FILE if STATE_FINDINGS_FILE.exists() else DATA_DIR / "sample_findings.json"
            if findings_path.exists():
                with open(findings_path, "r", encoding="utf-8") as f:
                    self.findings = [Finding(**item) for item in json.load(f)]

            # Load bidders
            bidders_path = STATE_BIDDERS_FILE if STATE_BIDDERS_FILE.exists() else DATA_DIR / "sample_bidders.json"
            if bidders_path.exists():
                with open(bidders_path, "r", encoding="utf-8") as f:
                    self.bidders = [Bidder(**item) for item in json.load(f)]

    def _save_state(self) -> None:
        with self._lock:
            with open(STATE_FINDINGS_FILE, "w", encoding="utf-8") as f:
                json.dump([item.model_dump() for item in self.findings], f, indent=2)
            with open(STATE_BIDDERS_FILE, "w", encoding="utf-8") as f:
                json.dump([item.model_dump() for item in self.bidders], f, indent=2)
            if self.tender:
                with open(STATE_TENDER_FILE, "w", encoding="utf-8") as f:
                    json.dump(self.tender.model_dump(), f, indent=2)

    def get_tender(self) -> Optional[Tender]:
        with self._lock:
            return self.tender

    def set_tender(self, tender: Tender) -> None:
        """Update the active tender, persist state, and notify event bus."""
        with self._lock:
            self.tender = tender
            self._save_state()
            if self.event_bus:
                self.event_bus.publish_sync(
                    EventPayload(
                        event=DomainEvent.TENDER_INGESTED,
                        source="scoring_engine",
                        data={
                            "tender_id": tender.id,
                            "tender_number": tender.tender_number,
                            "estimated_value_inr": tender.estimated_value_inr,
                        },
                    )
                )

    def get_all_bidders(self) -> List[Bidder]:
        with self._lock:
            return self.bidders

    def get_bidder_by_id(self, bidder_id: str) -> Optional[Bidder]:
        with self._lock:
            for b in self.bidders:
                if b.id == bidder_id:
                    return b
            return None

    def get_findings_for_bidder(self, bidder_id: str) -> List[Finding]:
        with self._lock:
            return [f for f in self.findings if f.bidder_id == bidder_id]

    def get_finding_by_id(self, finding_id: str) -> Optional[Finding]:
        with self._lock:
            for f in self.findings:
                if f.id == finding_id:
                    return f
            return None

    def process_decision(self, req: DecisionRequest) -> DecisionResult:
        with self._lock:
            finding = self.get_finding_by_id(req.finding_id)
            if not finding:
                raise ValueError(f"Finding with ID '{req.finding_id}' does not exist.")

            # Mandatory override reason enforcement
            if req.action == "OVERRIDE_FINDING" and (not req.reason or len(req.reason.strip()) < 8):
                raise ValueError(
                    "A documented justification reason (minimum 8 characters) is legally mandatory "
                    "when overriding an AI compliance finding."
                )

            now_str = datetime.now().astimezone().isoformat()

            if req.action == "ACCEPT_FINDING":
                finding.status = FindingStatus.ACCEPTED
                event_type = "FINDING_ACCEPTED"
                msg = "Finding accepted. AI recommendation confirmed by officer."
            elif req.action == "OVERRIDE_FINDING":
                finding.status = FindingStatus.OVERRIDDEN
                event_type = "FINDING_OVERRIDDEN"
                msg = f"Finding overridden by officer. Reason: {req.reason}"
            elif req.action == "ESCALATE_TO_COMMITTEE":
                finding.status = FindingStatus.ESCALATED
                event_type = "FINDING_ESCALATED"
                msg = "Finding referred to Tender Evaluation Committee for collective review."
            else:
                raise ValueError(f"Unknown action: {req.action}")

            finding.decided_by = req.officer_id
            finding.decided_at = now_str
            finding.decision_reason = req.reason or msg

            # Record immutable audit event via injected audit ledger
            audit_event = self.audit_ledger.record_decision_event(
                event_type=event_type,
                officer_id=req.officer_id,
                finding_id=finding.id,
                bidder_id=finding.bidder_id,
                action_taken=req.action,
                reason=req.reason or msg,
            )

            self._recalculate_bidder(finding.bidder_id)
            self._save_state()

            # Emit event to EventBus if wired
            if self.event_bus:
                self.event_bus.publish_sync(
                    EventPayload(
                        event=DomainEvent.DECISION_RECORDED,
                        source="scoring_engine",
                        data={
                            "finding_id": finding.id,
                            "bidder_id": finding.bidder_id,
                            "action": req.action,
                            "officer_id": req.officer_id,
                            "audit_event_id": audit_event.event_id,
                        },
                    )
                )

            return DecisionResult(
                success=True,
                finding_id=finding.id,
                new_status=finding.status,
                action=req.action,
                audit_event_id=audit_event.event_id,
                timestamp=now_str,
                message=msg,
            )

    def _recalculate_bidder(self, bidder_id: str) -> None:
        bidder = self.get_bidder_by_id(bidder_id)
        if not bidder:
            return
        b_findings = self.get_findings_for_bidder(bidder_id)
        active_high = [
            f for f in b_findings
            if f.severity == RiskCategory.HIGH and f.status != FindingStatus.OVERRIDDEN
        ]
        bidder.high_risk_findings = len(active_high)

        if self.event_bus:
            self.event_bus.publish_sync(
                EventPayload(
                    event=DomainEvent.FINDING_EVALUATED,
                    source="scoring_engine",
                    data={
                        "bidder_id": bidder_id,
                        "high_risk_findings": len(active_high),
                    },
                )
            )

    def reset_demo_state(self) -> None:
        """Reset all data back to clean demonstration defaults."""
        with self._lock:
            if STATE_FINDINGS_FILE.exists():
                STATE_FINDINGS_FILE.unlink()
            if STATE_BIDDERS_FILE.exists():
                STATE_BIDDERS_FILE.unlink()
            if STATE_TENDER_FILE.exists():
                STATE_TENDER_FILE.unlink()
            self.audit_ledger.reset_to_initial()
            self._initialize()


# Singleton for backward compatibility
DATA_MANAGER = ProcurementDataManager()
