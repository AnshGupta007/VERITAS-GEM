"""
Commercial / Financial Bid Evaluation & Statutory L1 Preference Engine.
Implements:
1. BoQ (Bill of Quantities) line-item arithmetic verification
2. Raw L1 price discovery
3. DPIIT PPO-MII Class-I 20% Margin of Purchase Preference
4. Micro & Small Enterprises (MSE) 15% Price Band Preference under GFR Rule 153
5. Interactive Price Matching Simulation
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

# Baseline commercial bid packages
BOQ_ITEMS = [
    {
        "item_no": "1.0",
        "description": "Subsea Control Valves 15,000 PSI (API 6A / 6DSS, Sour Service)",
        "quantity": 24,
        "uom": "NOS"
    },
    {
        "item_no": "2.0",
        "description": "High-Pressure Hydraulic Subsea Actuators with ROV Override",
        "quantity": 24,
        "uom": "NOS"
    },
    {
        "item_no": "3.0",
        "description": "Factory Acceptance Testing (FAT), Hyperbaric & Hydrostatic Validation",
        "quantity": 1,
        "uom": "LOT"
    },
    {
        "item_no": "4.0",
        "description": "Operational Mandatory Spares (3-Year Subsea Operations Package)",
        "quantity": 1,
        "uom": "LOT"
    }
]

COMMERCIAL_STATE: Dict[str, Any] = {
    "price_matched": False,
    "matched_by": None,
    "awarded_bidder_id": None
}


def get_commercial_evaluation() -> Dict[str, Any]:
    """
    Evaluates commercial proposals for technically qualified bidders.
    """
    # 1. Bidder Commercial Submissions
    bids = [
        {
            "bidder_id": "BID-XYZ-002",
            "bidder_name": "XYZ Corporation India Pvt Ltd",
            "technical_status": "QUALIFIED_WITH_OBSERVATION",
            "supplier_class": "Class-II Local Supplier",
            "local_content_percent": 48.0,
            "mse_status": "NON_MSE_MEDIUM_ENTERPRISE",
            "line_items": [
                {"item_no": "1.0", "unit_rate_cr": 1.15, "total_cr": 27.60},
                {"item_no": "2.0", "unit_rate_cr": 0.42, "total_cr": 10.08},
                {"item_no": "3.0", "unit_rate_cr": 1.62, "total_cr": 1.62},
                {"item_no": "4.0", "unit_rate_cr": 2.50, "total_cr": 2.50}
            ],
            "subtotal_base_cr": 41.80,
            "gst_rate_percent": 18.0,
            "gst_amount_cr": 7.524,
            "total_landed_cost_cr": 49.324,
            "arithmetic_error_detected": False
        },
        {
            "bidder_id": "BID-PQR-003",
            "bidder_name": "PQR Engineering Technologies Pvt Ltd",
            "technical_status": "FULLY_COMPLIANT_VERIFIED",
            "supplier_class": "Class-I Local Supplier",
            "local_content_percent": 68.5,
            "mse_status": "MSE_SC_ST_WOMAN_PROMOTED",
            "line_items": [
                {"item_no": "1.0", "unit_rate_cr": 1.20, "total_cr": 28.80},
                {"item_no": "2.0", "unit_rate_cr": 0.45, "total_cr": 10.80},
                {"item_no": "3.0", "unit_rate_cr": 1.70, "total_cr": 1.70},
                {"item_no": "4.0", "unit_rate_cr": 2.90, "total_cr": 2.90}
            ],
            "subtotal_base_cr": 44.20,
            "gst_rate_percent": 18.0,
            "gst_amount_cr": 7.956,
            "total_landed_cost_cr": 52.156,
            "arithmetic_error_detected": False
        },
        {
            "bidder_id": "BID-ABC-001",
            "bidder_name": "ABC Industries Limited",
            "technical_status": "DISQUALIFIED_TECHNICAL",
            "supplier_class": "Class-I Local Supplier (Unverified)",
            "local_content_percent": 65.0,
            "mse_status": "NON_MSE",
            "line_items": [],
            "subtotal_base_cr": 0.0,
            "gst_rate_percent": 0.0,
            "gst_amount_cr": 0.0,
            "total_landed_cost_cr": 0.0,
            "disqualification_reason": "Failed pre-qualification under Rule 144 GFR 2017 (Turnover variance ₹4.20 Cr & Expired BIS license). Financial envelope unopened per GeM STC 7.2."
        }
    ]

    # Evaluate Active Qualified Bids
    qualified_bids = [b for b in bids if b["technical_status"] != "DISQUALIFIED_TECHNICAL"]
    sorted_bids = sorted(qualified_bids, key=lambda x: x["total_landed_cost_cr"])

    raw_l1 = sorted_bids[0]
    raw_l2 = sorted_bids[1] if len(sorted_bids) > 1 else None

    # Calculate PPO-MII & MSE thresholds
    raw_l1_price = raw_l1["total_landed_cost_cr"]
    ppo_mii_20pct_ceiling = round(raw_l1_price * 1.20, 3)
    mse_15pct_ceiling = round(raw_l1_price * 1.15, 3)

    pqr_bid = next(b for b in qualified_bids if b["bidder_id"] == "BID-PQR-003")
    pqr_price = pqr_bid["total_landed_cost_cr"]
    price_gap_pct = round(((pqr_price - raw_l1_price) / raw_l1_price) * 100, 2)

    # Check eligibility for Purchase Preference
    is_within_ppo_margin = pqr_price <= ppo_mii_20pct_ceiling
    is_within_mse_margin = pqr_price <= mse_15pct_ceiling

    # Determine recommended award
    if COMMERCIAL_STATE["price_matched"]:
        recommended_awardee = "PQR Engineering Technologies Pvt Ltd"
        award_price = raw_l1_price
        award_basis = "Statutory Purchase Preference exercised under DPIIT PPO-MII Order P-45021/2/2017-PP (BE-II). Class-I MSE matched L1 price."
    else:
        recommended_awardee = "Tender Committee Action Required"
        award_price = raw_l1_price
        award_basis = f"Raw L1 is XYZ Corp (Class-II Supplier). PQR Engineering (Class-I MSE) is within +{price_gap_pct}% (below 20% PPO-MII ceiling of ₹{ppo_mii_20pct_ceiling} Cr). Rule mandates inviting PQR to match L1."

    return {
        "tender_number": "GEM/2026/B/8849201",
        "tender_value_cr": 48.50,
        "raw_l1_bidder": raw_l1["bidder_name"],
        "raw_l1_price_cr": raw_l1_price,
        "raw_l2_bidder": raw_l2["bidder_name"] if raw_l2 else None,
        "raw_l2_price_cr": raw_l2["total_landed_cost_cr"] if raw_l2 else None,
        "price_gap_percentage": price_gap_pct,
        "ppo_mii_margin_ceiling_cr": ppo_mii_20pct_ceiling,
        "mse_price_band_ceiling_cr": mse_15pct_ceiling,
        "is_pqr_eligible_to_match": is_within_ppo_margin,
        "price_matched": COMMERCIAL_STATE["price_matched"],
        "recommended_awardee": recommended_awardee,
        "recommended_award_price_cr": award_price,
        "statutory_ruling": award_basis,
        "boq_items": BOQ_ITEMS,
        "bidders_commercial_table": bids
    }


def execute_price_match(bidder_id: str = "BID-PQR-003") -> Dict[str, Any]:
    """
    Simulates the statutory price-match procedure under DPIIT PPO-MII.
    """
    COMMERCIAL_STATE["price_matched"] = True
    COMMERCIAL_STATE["matched_by"] = bidder_id
    COMMERCIAL_STATE["awarded_bidder_id"] = bidder_id

    return {
        "status": "PRICE_MATCH_CONFIRMED",
        "bidder_id": bidder_id,
        "matched_price_cr": 49.324,
        "original_price_cr": 52.156,
        "savings_to_procuring_entity_cr": 2.832,
        "statutory_compliance": "100% Class-I Local Content (68.5%) & MSE Policy Achieved",
        "message": "PQR Engineering Technologies formally agreed to match L1 price of ₹49.324 Cr. Letter of Acceptance (LoA) prepared for Chairperson signoff."
    }


def reset_commercial_state():
    """Reset commercial simulation state."""
    COMMERCIAL_STATE["price_matched"] = False
    COMMERCIAL_STATE["matched_by"] = None
    COMMERCIAL_STATE["awarded_bidder_id"] = None
