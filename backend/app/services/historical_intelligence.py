"""
Cross-Tender Historical Intelligence & Repeat Offender Radar.
Tracks multi-tender bidder behavior across Central PSUs (ONGC, IOCL, GAIL, BPCL, HPCL)
to detect cross-tender factual contradictions, turnover inflation, and past debarment records.
"""
from typing import Dict, Any, List, Optional

HISTORICAL_DATABASE: Dict[str, Dict[str, Any]] = {
    "BID-ABC-001": {
        "bidder_id": "BID-ABC-001",
        "bidder_name": "ABC Industries Limited",
        "pan": "AAACA1234A",
        "cin": "U23201MH2015PLC268912",
        "tenders_participated_count": 8,
        "past_tender_history": [
            {
                "tender_ref": "GAIL/2026/VALVE/9102",
                "organization": "GAIL (India) Limited",
                "tender_title": "City Gas Distribution High-Pressure Ball Valves",
                "bid_date": "14-Feb-2026",
                "declared_turnover_cr": 15.80,
                "declared_local_content_percent": 72.0,
                "outcome": "Awarded Contract (Partial Default in Delivery)",
                "observation": "Submitted turnover of ₹15.80 Cr in Feb 2026. Directly contradicts current ONGC declaration of ₹8.20 Cr for the same FY24-25 period (₹7.60 Cr discrepancy across tenders)."
            },
            {
                "tender_ref": "IOCL/REF/2025/SUB/4412",
                "organization": "Indian Oil Corporation Limited",
                "tender_title": "Mathura Refinery Expansion Valve Skid Package",
                "bid_date": "22-Sep-2025",
                "declared_turnover_cr": 14.10,
                "declared_local_content_percent": 68.0,
                "outcome": "Technically Disqualified",
                "observation": "Disqualified due to unverified subcontractor credentials."
            }
        ],
        "cross_tender_anomalies": [
            {
                "severity": "CRITICAL",
                "type": "CROSS_TENDER_TURNOVER_INFLATION",
                "description": "Bidder stated FY24-25 turnover as ₹15.80 Cr in GAIL tender (Feb 2026), but declared ₹8.20 Cr in ONGC tender (Sep 2026). Material misrepresentation across public procurement portals."
            },
            {
                "severity": "MEDIUM",
                "type": "INCIDENT_RECORD_ACTIVE",
                "description": "Show-cause warning on GeM Incident Management Portal (Incident #GEM-INC-2025-9912) for 45-day delay in pipeline valve delivery to GAIL."
            }
        ],
        "integrity_risk_index": 84.5
    },
    "BID-XYZ-002": {
        "bidder_id": "BID-XYZ-002",
        "bidder_name": "XYZ Corporation India Pvt Ltd",
        "pan": "AAACX5678B",
        "cin": "U29253DL2018PTC339101",
        "tenders_participated_count": 5,
        "past_tender_history": [
            {
                "tender_ref": "BPCL/MUM/2025/OFF/2291",
                "organization": "Bharat Petroleum Corporation Ltd",
                "tender_title": "Offshore Platform Actuator Replacement",
                "bid_date": "10-Nov-2025",
                "declared_turnover_cr": 22.40,
                "declared_local_content_percent": 46.5,
                "outcome": "L2 Bidder (Not Awarded)",
                "observation": "Local content consistently declared in 45-48% band, confirming status as Class-II Local Supplier."
            }
        ],
        "cross_tender_anomalies": [],
        "integrity_risk_index": 24.0
    },
    "BID-PQR-003": {
        "bidder_id": "BID-PQR-003",
        "bidder_name": "PQR Engineering Technologies Pvt Ltd",
        "pan": "AAACP9012C",
        "cin": "U74999TN2012PTC085123",
        "tenders_participated_count": 14,
        "past_tender_history": [
            {
                "tender_ref": "ONGC/KGD6/2025/DEEP/1104",
                "organization": "Oil & Natural Gas Corporation Ltd",
                "tender_title": "KG-D6 Deepwater Subsea Wellhead Assembly",
                "bid_date": "18-Aug-2025",
                "declared_turnover_cr": 31.80,
                "declared_local_content_percent": 69.2,
                "outcome": "Successfully Executed & Commissioned",
                "observation": "100% on-time milestone delivery. Perfect documentary consistency with zero past debarments or liquidated damages."
            }
        ],
        "cross_tender_anomalies": [],
        "integrity_risk_index": 2.5
    }
}


def get_historical_profile(bidder_id: str) -> Dict[str, Any]:
    """
    Retrieves cross-tender performance and contradiction history for a bidder.
    """
    if bidder_id in HISTORICAL_DATABASE:
        return HISTORICAL_DATABASE[bidder_id]

    return {
        "bidder_id": bidder_id,
        "bidder_name": "New Market Entrant",
        "tenders_participated_count": 1,
        "past_tender_history": [],
        "cross_tender_anomalies": [],
        "integrity_risk_index": 15.0
    }
