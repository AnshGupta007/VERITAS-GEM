#!/usr/bin/env python3
"""
Generate Stitch Screen and Poll Results
"""
import os
import urllib.request
import json
import time
import sys

STITCH_URL = os.environ.get("STITCH_URL", "https://stitch.googleapis.com/mcp")
API_KEY = os.environ.get("STITCH_API_KEY", "")

def call_mcp_raw(tool_name, arguments, timeout=300):
    payload = {
        "jsonrpc": "2.0",
        "id": int(time.time()),
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(STITCH_URL, data=data, headers=headers)
    
    print(f"[*] Calling {tool_name} with timeout {timeout}s...")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        return res

if __name__ == "__main__":
    project_id = sys.argv[1] if len(sys.argv) > 1 else "5549183315873612099"
    
    prompt = """
VERITAS-GEM: Government e-Marketplace (GeM) AI Bid Compliance Verification Platform for the Ministry of Petroleum & Natural Gas (MoPNG). High-tech modern dark-mode command center.
Top Navigation Bar:
- Logo: 'VERITAS-GEM' with gold Government of India emblem, tagline 'Integrated Procurement Compliance & Risk Intelligence Co-Pilot'.
- Live Active Tender Pill: GEM/2026/B/8849201 | Value: ₹48.50 Cr (High-Pressure Subsea Control Valves & Flow Control Skids for Deepwater Offshore).
- Evaluation Officer Profile: Sh. Rajesh Sharma (Chairperson, Technical Evaluation Committee).
- Top Action Buttons: Glowing cyan '⚡ Judge Demo Mode', '🔄 Reset Pipeline', and '🔒 Audit Hash Ledger'.

Main Navigation Tabs:
1. Multi-Bidder Leaderboard (Active)
2. Tender Clause Intelligence (47 clauses)
3. Contradiction Radar (4 red flags)
4. Compliance Time Machine (Timeline scrubber)
5. 3-Column Evidence Viewer
6. Immutable Audit Trail
7. Source Adapters (GSTN, MCA21, DigiLocker)

Dashboard Overview & KPI Cards:
- Card 1: 3 Bidders Evaluated (1 High Risk, 1 Medium Risk, 1 Verified Compliant)
- Card 2: 4 Material Contradictions Detected (including ₹4.20 Cr turnover variance)
- Card 3: 3 Temporal Invalidation Flags (BIS license expired prior to submission date)
- Card 4: 100% Cryptographic Ledger Integrity (SHA-256 block chain verified)

Multi-Bidder Leaderboard Cards:
- Bidder 1 (HIGH RISK - 71.4% Confidence): ABC Industries Limited. Red warning badge. Decomposed 6-dimension progress bars: Mandatory Coverage (100%), Evidence Strength (91.4%), Source Verification (84%), Legal Identity (68.5%), Temporal Validity (54%). Flags: 'Turnover Discrepancy: ₹12.40 Cr vs ₹8.20 Cr', 'Expired BIS License on 15-Sep-2026'. Buttons: 'Examine Evidence', 'Officer Override'.
- Bidder 2 (MEDIUM RISK - 86.8% Confidence): XYZ Corporation India Pvt Ltd. Yellow warning badge. 1 contradiction (Local Content declaration 62.4% vs BOM 48.0%).
- Bidder 3 (VERIFIED COMPLIANT - 98.2% Confidence): PQR Engineering Technologies Pvt Ltd. Glowing emerald verified badge. 0 contradictions, 0 temporal defects. Full statutory and DigiLocker corroboration.

Contradiction Spotlight Panel:
- Red border callout box showing side-by-side OCR comparison of Document A (Audited Financials Page 17: ₹12.40 Cr) vs Document B (Bid Declaration Page 3: ₹8.20 Cr) with clear delta explanation and Rule 144 GFR 2017 legal risk impact.
"""

    args = {
        "projectId": project_id,
        "deviceType": "DESKTOP",
        "prompt": prompt.strip()
    }
    
    try:
        res = call_mcp_raw("generate_screen_from_text", args, timeout=300)
        print(json.dumps(res, indent=2))
    except Exception as e:
        print(f"Error during generation: {e}")
