"""
DPIIT PPO-MII Local Content Deconstruction & HSN / Customs Import Engine.

Cross-references bidder Bill of Materials (BoM) declarations against
statutory HSN tariff codes and simulated ICEGATE / DGFT Indian Customs
Bills of Entry to verify authentic domestic value addition.

Governing Regulations:
- DPIIT Order No. P-45021/2/2017-PP (BE-II) dated 16-Sep-2020
- Rule 153 GFR 2017 (Preference to Make in India)
- Customs Tariff Act, 1975 (HSN Classification)
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone


HSN_CATALOG = {
    "84818090": {
        "description": "Taps, cocks, valves and similar appliances - Other (Subsea Ball/Gate Valves 15K PSI)",
        "basic_customs_duty_percent": 7.5,
        "igst_percent": 18.0,
        "standard_domestic_va_target": 50.0
    },
    "84122100": {
        "description": "Hydraulic power engines and motors - Linear acting (Subsea Hydraulic Actuators)",
        "basic_customs_duty_percent": 7.5,
        "igst_percent": 18.0,
        "standard_domestic_va_target": 50.0
    },
    "73041910": {
        "description": "Line pipe of a kind used for oil or gas pipelines - Seamless (Sour Service Alloy)",
        "basic_customs_duty_percent": 10.0,
        "igst_percent": 18.0,
        "standard_domestic_va_target": 60.0
    },
    "90328990": {
        "description": "Automatic regulating or controlling instruments - Subsea Electronic Control Unit",
        "basic_customs_duty_percent": 7.5,
        "igst_percent": 18.0,
        "standard_domestic_va_target": 40.0
    }
}


BIDDER_CUSTOMS_LEDGER = {
    "BID-XYZ-002": {
        "bidder_id": "BID-XYZ-002",
        "bidder_name": "XYZ Corporation India Pvt Ltd",
        "declared_supplier_class": "Class-II Local Supplier",
        "declared_local_content_percent": 48.0,
        "total_quoted_cost_cr": 41.80,
        "bom_items": [
            {
                "sub_assembly": "Subsea 15,000 PSI Valve Shell & Trunnion Castings",
                "hsn_code": "84818090",
                "claimed_origin": "India (Domestic Foundry)",
                "component_cost_cr": 16.40,
                "customs_verification_status": "FLAGGED_DISGUISED_IMPORT",
                "customs_evidence": "ICEGATE Bill of Entry #BOE-MUM-SEA/2026/049182 shows 24 Units imported from Singapore as 'Semi-Finished Valve Shells' (CIF ₹14.80 Cr). Only surface machining performed in Pune facility.",
                "verified_imported_cif_cr": 14.80,
                "verified_domestic_va_cr": 1.60
            },
            {
                "sub_assembly": "ROV Hydraulic Actuators & Solenoid Pack",
                "hsn_code": "84122100",
                "claimed_origin": "India (Assembled at Rabale Works)",
                "component_cost_cr": 10.08,
                "customs_verification_status": "VERIFIED_PARTIAL_IMPORT",
                "customs_evidence": "ICEGATE Bill of Entry #BOE-JNPT/2026/119024 shows hydraulic seals and subsea manifolds imported from Germany (CIF ₹8.08 Cr).",
                "verified_imported_cif_cr": 8.08,
                "verified_domestic_va_cr": 2.00
            },
            {
                "sub_assembly": "High-Integrity Piping & Flange Spools",
                "hsn_code": "73041910",
                "claimed_origin": "India",
                "component_cost_cr": 8.50,
                "customs_verification_status": "FLAGGED_DISGUISED_IMPORT",
                "customs_evidence": "Customs import records confirm pre-bent spools imported from Korea (CIF ₹6.50 Cr).",
                "verified_imported_cif_cr": 6.50,
                "verified_domestic_va_cr": 2.00
            },
            {
                "sub_assembly": "FAT, Factory Testing, Hydrostatic & ROV Mockup",
                "hsn_code": "90328990",
                "claimed_origin": "India",
                "component_cost_cr": 6.82,
                "customs_verification_status": "VERIFIED_PARTIAL_IMPORT",
                "customs_evidence": "Foreign third-party inspection agency fees and overseas sensor kits (CIF ₹2.32 Cr).",
                "verified_imported_cif_cr": 2.32,
                "verified_domestic_va_cr": 4.50
            }
        ],
        "audit_finding": "Bidder inflated domestic value addition by 23.8%. Imported valve bodies were falsely classified as domestic value addition. Verified Domestic VA is 24.2% (Non-Local Supplier status under revised DPIIT criteria)."
    },
    "BID-PQR-003": {
        "bidder_id": "BID-PQR-003",
        "bidder_name": "PQR Engineering Technologies Pvt Ltd",
        "declared_supplier_class": "Class-I Local Supplier",
        "declared_local_content_percent": 68.5,
        "total_quoted_cost_cr": 44.20,
        "bom_items": [
            {
                "sub_assembly": "Subsea 15,000 PSI Valve Body (Forged F22 Alloy)",
                "hsn_code": "84818090",
                "claimed_origin": "India (Jindal Steel & Power Ltd, Angul)",
                "component_cost_cr": 18.20,
                "customs_verification_status": "VERIFIED_DOMESTIC",
                "customs_evidence": "Raw ingot procurement certified with JSPL Heat Numbers and NABL Lab reports. Fully machined at Coimbatore facility.",
                "verified_imported_cif_cr": 4.20,
                "verified_domestic_va_cr": 14.00
            },
            {
                "sub_assembly": "Hydraulic Subsea Actuators & ROV Overrides",
                "hsn_code": "84122100",
                "claimed_origin": "India (In-house Precision Engineering)",
                "component_cost_cr": 11.20,
                "customs_verification_status": "VERIFIED_PARTIAL_IMPORT",
                "customs_evidence": "Precision fluoro-elastomer seals imported under BOE-MAA/2026/00192 (CIF ₹3.20 Cr). Balance manufactured domestically.",
                "verified_imported_cif_cr": 3.20,
                "verified_domestic_va_cr": 8.00
            },
            {
                "sub_assembly": "Piping & Flange Connections",
                "hsn_code": "73041910",
                "claimed_origin": "India",
                "component_cost_cr": 8.00,
                "customs_verification_status": "VERIFIED_DOMESTIC",
                "customs_evidence": "Procured from Ratnamani Metals & Tubes Ltd (GSTIN e-invoices verified). Imported fittings CIF ₹2.50 Cr.",
                "verified_imported_cif_cr": 2.50,
                "verified_domestic_va_cr": 5.50
            },
            {
                "sub_assembly": "FAT Testing & Extended Spares Package",
                "hsn_code": "90328990",
                "claimed_origin": "India",
                "component_cost_cr": 6.80,
                "customs_verification_status": "VERIFIED_DOMESTIC",
                "customs_evidence": "Hydrostatic testing at L&T Heavy Engineering testbed, Hazira. Calibrated spares CIF ₹2.80 Cr.",
                "verified_imported_cif_cr": 2.80,
                "verified_domestic_va_cr": 4.00
            }
        ],
        "audit_finding": "Authentic Class-I Local Supplier. Verified Domestic Value Addition is 71.3% (exceeding declared 68.5% and DPIIT 50% threshold)."
    },
    "BID-ABC-001": {
        "bidder_id": "BID-ABC-001",
        "bidder_name": "ABC Industries Limited",
        "declared_supplier_class": "Class-I Local Supplier (Unverified)",
        "declared_local_content_percent": 65.0,
        "total_quoted_cost_cr": 46.50,
        "bom_items": [
            {
                "sub_assembly": "Subsea Valve Skid Packages",
                "hsn_code": "84818090",
                "claimed_origin": "India (Subcontracted)",
                "component_cost_cr": 26.00,
                "customs_verification_status": "FLAGGED_DISGUISED_IMPORT",
                "customs_evidence": "Customs manifests show consignment origin as Shenzhen/Hong Kong without Rule 144(xi) Land Border Registration Certificate.",
                "verified_imported_cif_cr": 22.10,
                "verified_domestic_va_cr": 3.90
            }
        ],
        "audit_finding": "Disqualified on technical grounds under Rule 144 GFR 2017. Local content declaration unverified due to lack of OEM certificates."
    }
}


def get_hsn_customs_deconstruction(bidder_id: str) -> Dict[str, Any]:
    """
    Computes verified domestic value addition against ICEGATE customs returns.
    """
    bidder_data = BIDDER_CUSTOMS_LEDGER.get(bidder_id)
    if not bidder_data:
        # Fallback default
        bidder_data = {
            "bidder_id": bidder_id,
            "bidder_name": "Generic Bidder Entity",
            "declared_supplier_class": "Class-II Local Supplier",
            "declared_local_content_percent": 45.0,
            "total_quoted_cost_cr": 40.0,
            "bom_items": [],
            "audit_finding": "No Bill of Materials filed in electronic envelope."
        }

    total_base = bidder_data.get("total_quoted_cost_cr", 40.0)
    bom_items = bidder_data.get("bom_items", [])
    
    total_imported_cif = sum(item.get("verified_imported_cif_cr", 0.0) for item in bom_items)
    total_domestic_va = sum(item.get("verified_domestic_va_cr", 0.0) for item in bom_items)
    
    verified_va_percent = round((total_domestic_va / total_base) * 100.0, 1) if total_base > 0 else 0.0
    
    # Statutory Classification per DPIIT criteria
    if verified_va_percent >= 50.0:
        verified_class = "Class-I Local Supplier (Verified)"
        purchase_preference_eligible = True
    elif verified_va_percent >= 20.0:
        verified_class = "Class-II Local Supplier (Verified)"
        purchase_preference_eligible = False
    else:
        verified_class = "Non-Local Supplier (<20% Local Content)"
        purchase_preference_eligible = False

    return {
        "bidder_id": bidder_id,
        "bidder_name": bidder_data["bidder_name"],
        "declared_supplier_class": bidder_data["declared_supplier_class"],
        "declared_local_content_percent": bidder_data["declared_local_content_percent"],
        "verified_supplier_class": verified_class,
        "verified_local_content_percent": verified_va_percent,
        "local_content_variance_percent": round(verified_va_percent - bidder_data["declared_local_content_percent"], 1),
        "total_quoted_cost_cr": total_base,
        "total_imported_cif_cr": round(total_imported_cif, 2),
        "total_domestic_va_cr": round(total_domestic_va, 2),
        "purchase_preference_eligible": purchase_preference_eligible,
        "dpiit_ruling": "Eligible for 20% Purchase Preference" if purchase_preference_eligible else "Ineligible for Purchase Preference (Must be Raw L1 to win)",
        "bom_deconstruction": bom_items,
        "audit_finding": bidder_data["audit_finding"],
        "verified_at": datetime.now(timezone.utc).isoformat()
    }
