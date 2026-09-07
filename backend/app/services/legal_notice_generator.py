"""
Automated Statutory Legal Notice & Show-Cause Generator.
Drafts official Government of India / Ministry of Petroleum & Natural Gas notices
under Rule 144(xi) GFR 2017 & GeM STC Clause 7.2.
"""
from typing import Dict, Any
from datetime import datetime, timezone
import hashlib

def generate_show_cause_notice(bidder_id: str) -> Dict[str, Any]:
    """
    Generates structured, official Show-Cause Notice for a given bidder.
    """
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%d-%b-%Y")
    notice_ref = f"MoPNG/GEM/EVAL/2026/SCN-{bidder_id.replace('BID-', '')}-01"
    
    if bidder_id == "BID-ABC-001":
        bidder_name = "ABC Industries Limited"
        cin = "U23201MH2015PLC268912"
        address = "Plot 44, MIDC Industrial Area, Andheri (East), Mumbai 400093"
        findings = [
            {
                "clause": "Section IV - Clause 4.2 (Financial Pre-Qualification)",
                "violation": "Direct material discrepancy of INR 4,20,00,000 between Audited Financial Statements and Sworn Declaration",
                "evidence_a": "Audited Financial Statement FY24-25, Page 17 (Schedule 18): INR 12,40,00,000",
                "evidence_b": "Schedule IV Vendor Declaration, Page 3 (Item 4b): INR 8,20,00,000",
                "rule": "Rule 144 GFR 2017 & GeM STC Clause 7.2 (Misrepresentation / Ineligible Turnover)"
            },
            {
                "clause": "Section II - Clause 2.1 (Mandatory Quality Certifications)",
                "violation": "Temporal Invalidity of BIS Quality License (Expired 98 days prior to bid deadline)",
                "evidence_a": "BIS License Registration Certificate: Expiry Date: 09-Jun-2026",
                "evidence_b": "Tender Submission Anchor Date: 15-Sep-2026 (Expired at time of submission)",
                "rule": "GeM GTC Clause 4.19 (Certificates must be valid on date of tender opening)"
            }
        ]
        recommended_action = "REJECTION_UNLESS_REBUTTED"
        deadline_hours = 48
    elif bidder_id == "BID-XYZ-002":
        bidder_name = "XYZ Corporation India Pvt Ltd"
        cin = "U29253DL2018PTC339101"
        address = "Tower B, DLF Cyber City, Sector 25, Gurugram, Haryana 122002"
        findings = [
            {
                "clause": "Section III - Clause 3.2 (Public Procurement Preference to Make in India - PPO-MII)",
                "violation": "Class-I Local Content declaration variance: 62.4% declared vs 48.0% verified in Bill of Materials",
                "evidence_a": "Vendor Local Content Affidavit: Declared 62.4%",
                "evidence_b": "Audited Bill of Materials: Imported subsea titanium forged blocks account for 52.0% of input cost",
                "rule": "DPIIT Order P-45021/2/2017-PP (BE-II) dated 16-Sep-2020"
            }
        ]
        recommended_action = "CLARIFICATION_REQUIRED"
        deadline_hours = 72
    else:
        bidder_name = "PQR Engineering Technologies Pvt Ltd"
        cin = "U74999TN2012PTC085123"
        address = "Guindy Industrial Estate, Chennai, Tamil Nadu 600032"
        findings = []
        recommended_action = "FULLY_COMPLIANT_NO_ACTION"
        deadline_hours = 0

    # Generate QR verification payload hash
    qr_payload = f"VERITAS-GOV-IN|{notice_ref}|{bidder_name}|{date_str}|{cin}|GFR-144"
    qr_hash = hashlib.sha256(qr_payload.encode()).hexdigest()[:16].upper()

    return {
        "notice_ref": notice_ref,
        "date": date_str,
        "tender_number": "GEM/2026/B/8849201",
        "tender_title": "High-Pressure Subsea Control Valves & Flow Control Skids",
        "ministry": "Ministry of Petroleum & Natural Gas",
        "department": "Technical Evaluation Committee (Subsea Infrastructure Division)",
        "bidder_id": bidder_id,
        "bidder_name": bidder_name,
        "cin": cin,
        "address": address,
        "status": "DRAFT_READY" if findings else "NO_DEFECTS",
        "cure_deadline_hours": deadline_hours,
        "cure_deadline_date": "05-Sep-2026 17:00 IST",
        "qr_verification_token": f"GOV-IN-VERITAS-{qr_hash}",
        "hindi_title": "कारण बताओ नोटिस / अहर्ता स्पष्टीकरण ज्ञापन",
        "english_title": "SHOW-CAUSE NOTICE & STATUTORY INELIGIBILITY MEMORANDUM",
        "statutory_mandate": "Issued under Rule 144(xi) and Rule 175 of General Financial Rules (GFR) 2017 read with GeM Special Terms & Conditions Clause 7.2.",
        "findings": findings,
        "signatory": {
            "name": "Sh. Rajesh Sharma",
            "designation": "Director (Procurement & Technical Evaluation)",
            "officer_id": "OFF-8821",
            "department": "Ministry of Petroleum & Natural Gas, Government of India"
        }
    }
