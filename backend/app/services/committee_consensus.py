"""
Tender Evaluation Committee Consensus Multi-Signoff Service.
Tracks individual digital signatures across Technical, Financial, and Executive members
and anchors committee quorum decisions to the SHA-256 audit ledger.
"""
from typing import Dict, List, Any
from datetime import datetime, timezone
import hashlib
from .audit_ledger import AUDIT_LEDGER

MEMBERS = [
    {
        "member_id": "MEM-CHAIR-01",
        "name": "Sh. Rajesh Sharma",
        "designation": "Director (Technical Evaluation) & Chairperson",
        "department": "MoPNG Procurement Oversight",
        "role": "CHAIRPERSON",
        "status": "SIGNED",
        "signed_at": "2026-09-02 21:30 IST",
        "signature_hash": "A7B9C1E2F4D65890",
        "comments": "Agreed with AI finding on ABC Industries. Discrepancy of ₹4.20 Cr turnover cannot be condoned under GFR 144."
    },
    {
        "member_id": "MEM-TECH-02",
        "name": "Dr. Anita Sen",
        "designation": "Chief General Manager (Subsea Engineering)",
        "department": "ONGC Deepwater Operations",
        "role": "TECHNICAL_MEMBER",
        "status": "SIGNED",
        "signed_at": "2026-09-02 21:45 IST",
        "signature_hash": "F8E7D6C5B4A39281",
        "comments": "Technical verification of PQR Engineering's API 6DSS hyperbaric test reports is satisfactory. ABC fails due to expired BIS license."
    },
    {
        "member_id": "MEM-FIN-03",
        "name": "Sh. K. V. Raman",
        "designation": "Joint Financial Advisor",
        "department": "Finance Division, MoPNG",
        "role": "FINANCIAL_MEMBER",
        "status": "PENDING",
        "signed_at": None,
        "signature_hash": None,
        "comments": None
    }
]

def get_committee_status() -> Dict[str, Any]:
    """
    Returns the current multi-member signoff state.
    """
    signed_count = sum(1 for m in MEMBERS if m["status"] == "SIGNED")
    total_count = len(MEMBERS)
    quorum_reached = signed_count >= 2 # 2/3 Quorum required

    return {
        "tender_number": "GEM/2026/B/8849201",
        "committee_name": "MoPNG High-Value Procurement Standing Committee (Subsea)",
        "quorum_required": "2 of 3 Members (66.7%)",
        "signed_count": signed_count,
        "total_count": total_count,
        "quorum_reached": quorum_reached,
        "consensus_verdict": "REJECT_ABC_AWARD_PQR_SUBJECT_TO_FINANCIAL_OPENING" if quorum_reached else "PENDING_QUORUM",
        "members": MEMBERS
    }

def sign_committee_member(member_id: str, action: str, comments: str) -> Dict[str, Any]:
    """
    Records a committee member's digital signature and commits it to the audit ledger.
    """
    member = next((m for m in MEMBERS if m["member_id"] == member_id), None)
    if not member:
        raise ValueError(f"Unknown committee member ID: {member_id}")

    now = datetime.now(timezone.utc)
    sig_payload = f"{member_id}|{action}|{comments}|{now.isoformat()}"
    sig_hash = hashlib.sha256(sig_payload.encode()).hexdigest()[:16].upper()

    member["status"] = "SIGNED"
    member["signed_at"] = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    member["signature_hash"] = sig_hash
    member["comments"] = comments

    # Anchor onto cryptographic audit ledger
    audit_event = AUDIT_LEDGER.record_decision_event(
        event_type="COMMITTEE_MULTISIG_SIGN",
        officer_id=member_id,
        finding_id="COMMITTEE_QUORUM",
        bidder_id="ALL_BIDDERS",
        action_taken=action,
        reason=f"[{member['role']}] {comments} (Sig: {sig_hash})"
    )

    return {
        "status": "SUCCESS",
        "member_id": member_id,
        "member_name": member["name"],
        "signature_hash": sig_hash,
        "audit_event_id": audit_event.event_id,
        "integrity_signature": audit_event.integrity_signature
    }

def reset_committee_state():
    """Resets committee signoff status back to default demonstration baseline."""
    global MEMBERS
    MEMBERS = [
        {
            "member_id": "MEM-CHAIR-01",
            "name": "Sh. Rajesh Sharma",
            "designation": "Director (Technical Evaluation) & Chairperson",
            "department": "MoPNG Procurement Oversight",
            "role": "CHAIRPERSON",
            "status": "SIGNED",
            "signed_at": "2026-09-02 21:30 IST",
            "signature_hash": "A7B9C1E2F4D65890",
            "comments": "Agreed with AI finding on ABC Industries. Discrepancy of ₹4.20 Cr turnover cannot be condoned under GFR 144."
        },
        {
            "member_id": "MEM-TECH-02",
            "name": "Dr. Anita Sen",
            "designation": "Chief General Manager (Subsea Engineering)",
            "department": "ONGC Deepwater Operations",
            "role": "TECHNICAL_MEMBER",
            "status": "SIGNED",
            "signed_at": "2026-09-02 21:45 IST",
            "signature_hash": "F8E7D6C5B4A39281",
            "comments": "Technical verification of PQR Engineering's API 6DSS hyperbaric test reports is satisfactory. ABC fails due to expired BIS license."
        },
        {
            "member_id": "MEM-FIN-03",
            "name": "Sh. K. V. Raman",
            "designation": "Joint Financial Advisor",
            "department": "Finance Division, MoPNG",
            "role": "FINANCIAL_MEMBER",
            "status": "PENDING",
            "signed_at": None,
            "signature_hash": None,
            "comments": None
        }
    ]

