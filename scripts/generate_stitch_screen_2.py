#!/usr/bin/env python3
"""
Generate Screen 2: 3-Column Grounded Evidence Inspector and Compliance Time Machine
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
        return json.loads(resp.read().decode("utf-8"))

if __name__ == "__main__":
    project_id = "5549183315873612099"
    prompt = """
VERITAS-GEM: Three-Column Grounded Evidence Inspector & Compliance Time Machine for GeM Procurement.
Dark mode interface for the Ministry of Petroleum & Natural Gas.
Top Bar: Back button '← Return to Evaluation Queue', Tender Ref: GEM/2026/B/8849201, Bidder: ABC Industries Limited (HIGH RISK 71.4%).

Top Interactive Panel: Compliance Time Machine Timeline Scrubber:
- Horizontal interactive date slider spanning 2024 to 2027.
- Prominent Red Marker on 15-Sep-2026: 'Mandatory Tender Submission Anchor Date'.
- Red Alert banner: 'Critical Invalidation: BIS Quality License expired 98 days prior to bid deadline (Expiry: 09-Jun-2026). Cannot be cured retroactively.'

Three-Column Grounded Evidence Grid:
- Column 1 (Tender Clause Requirement):
  Card header '1. TENDER CLAUSE (Section IV - Clause 4.2)'.
  Title: 'Minimum Annual Turnover Threshold'.
  Norm: Audited turnover must equal or exceed INR 10,00,00,000 across certified FY submissions.
  Governing Rule: Rule 144 GFR 2017 & GeM STC 7.2.
  Validation Method: NUMERIC_COMPARISON.

- Column 2 (AI Reasoning & Decision Gateway):
  Card header '2. AI INFERENCE & CONFIDENCE'.
  Confidence Calibration: 96% (High Confidence).
  Authoritative Source: MCA21 Ministry of Corporate Affairs (MOCK ADAPTER).
  Actionable Recommendation: 'CRITICAL RISK: Direct conflict between audited revenue and statutory declaration. Recommend issuance of Show-Cause / Ineligibility Clarification.'
  Interactive Decision Box: Radio options for 'Accept Finding', 'Override Finding (Requires Mandatory Justification)', 'Escalate to Committee'.
  Sign-off credential stamp: 'Digitally Attested: Sh. Rajesh Sharma (OFF-8821)'.

- Column 3 (Primary Evidence & OCR Grounding):
  Card header '3. PRIMARY EVIDENCE (Dual Document OCR)'.
  Side-by-side document comparison boxes:
  - Document A: 'Audited Financial Statement FY24-25.pdf' (Page 17) -> Detected Text highlighted in glowing green bounding box: 'Schedule 18 - Total Revenue: INR 12,40,00,000'.
  - Document B: 'Schedule IV Vendor Turnover Declaration.pdf' (Page 3) -> Detected Text highlighted in glowing red bounding box: 'Item 4(b) - Declared FY24-25 Turnover: INR 8,20,00,000'.
  - Material variance breakdown card: 'Turnover Gap: ₹4,20,00,000 below required threshold!'
"""

    args = {
        "projectId": project_id,
        "deviceType": "DESKTOP",
        "prompt": prompt.strip()
    }
    
    res = call_mcp_raw("generate_screen_from_text", args, timeout=300)
    print(json.dumps(res, indent=2))
