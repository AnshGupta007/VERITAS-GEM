"""
Dynamic Procurement Policy Sandbox & Rule Engine.
Configures policy parameters per General Financial Rules (GFR) 2017 & GeM Special Terms:
1. Startup India Prior Turnover & Experience Exemption (GFR Rule 173(i))
2. Rule 144(xi) Land Border Sharing Security Restriction
3. DPIIT Class-I Minimum Local Content Threshold (40% - 60%)
4. MSME 25% Procurement Reservation & 15% Price Preference (GFR Rule 153)
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from .audit_ledger import AUDIT_LEDGER

POLICY_CONFIG: Dict[str, Any] = {
    "startup_india_exemption": False,
    "gfr_144_xi_land_border_enforced": True,
    "class_1_local_content_threshold": 50.0,
    "msme_reservation_enabled": True,
    "strict_bis_temporal_deadline": True,
    "last_updated_by": "Sh. Rajesh Sharma (Chairperson)",
    "last_updated_at": "2026-09-04T05:00:00Z"
}


def get_policy_config() -> Dict[str, Any]:
    """Retrieve active procurement policy rules."""
    return POLICY_CONFIG.copy()


def update_policy_config(new_config: Dict[str, Any], officer_id: str = "OFF-8821") -> Dict[str, Any]:
    """
    Updates policy sandbox configuration and records event on audit ledger.
    """
    now_str = datetime.now(timezone.utc).isoformat()

    for k, v in new_config.items():
        if k in POLICY_CONFIG and k not in ["last_updated_by", "last_updated_at"]:
            POLICY_CONFIG[k] = v

    POLICY_CONFIG["last_updated_by"] = officer_id
    POLICY_CONFIG["last_updated_at"] = now_str

    # Record policy change in audit ledger
    audit_event = AUDIT_LEDGER.record_decision_event(
        event_type="POLICY_RULES_AMENDED",
        officer_id=officer_id,
        finding_id="POLICY-SANDBOX",
        bidder_id="ALL_BIDDERS",
        action_taken="UPDATE_CONFIG",
        reason=f"Procurement policy sandbox updated: StartupExempt={POLICY_CONFIG['startup_india_exemption']}, MII_Threshold={POLICY_CONFIG['class_1_local_content_threshold']}%"
    )

    return {
        "status": "POLICY_UPDATED",
        "active_config": POLICY_CONFIG.copy(),
        "audit_event_id": audit_event.event_id,
        "impact_summary": get_policy_impact_summary()
    }


def get_policy_impact_summary() -> Dict[str, Any]:
    """
    Simulates real-time impact of active policy toggles on the evaluated bidders.
    """
    impacts = []

    # 1. Startup Exemption Impact
    if POLICY_CONFIG["startup_india_exemption"]:
        impacts.append({
            "bidder_id": "BID-ABC-001",
            "bidder_name": "ABC Industries Limited",
            "clause": "Section IV - Clause 4.2 (Turnover Requirement)",
            "effect": "Turnover threshold requirement (₹10.00 Cr) WAIVED under GFR Rule 173(i) Startup India exemption.",
            "resulting_risk": "Reduced from HIGH to MEDIUM"
        })
    else:
        impacts.append({
            "bidder_id": "BID-ABC-001",
            "bidder_name": "ABC Industries Limited",
            "clause": "Section IV - Clause 4.2 (Turnover Requirement)",
            "effect": "Mandatory ₹10.00 Cr turnover strictly enforced. ABC Industries remains non-compliant.",
            "resulting_risk": "HIGH RISK (Disqualification)"
        })

    # 2. Local Content Threshold Impact
    threshold = float(POLICY_CONFIG["class_1_local_content_threshold"])
    if threshold <= 48.0:
        impacts.append({
            "bidder_id": "BID-XYZ-002",
            "bidder_name": "XYZ Corporation India Pvt Ltd",
            "clause": "Section III - Clause 3.2 (PPO-MII Preference)",
            "effect": f"Threshold reduced to {threshold}%. XYZ's verified 48.0% local content now QUALIFIES as Class-I Local Supplier!",
            "resulting_risk": "Promoted to Class-I Purchase Preference"
        })
    else:
        impacts.append({
            "bidder_id": "BID-XYZ-002",
            "bidder_name": "XYZ Corporation India Pvt Ltd",
            "clause": "Section III - Clause 3.2 (PPO-MII Preference)",
            "effect": f"Threshold at {threshold}%. XYZ's 48.0% local content remains classified as Class-II Local Supplier.",
            "resulting_risk": "No Purchase Preference"
        })

    return {
        "active_threshold": threshold,
        "startup_exemption_active": POLICY_CONFIG["startup_india_exemption"],
        "simulated_impacts": impacts
    }
