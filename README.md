# VERITAS-GEM

### Evidence-Backed AI Compliance Co-Pilot for Government Procurement
**Smart India Hackathon 2026 · Problem Statement SIH26100**  
**Ministry of Petroleum & Natural Gas · Government of India**

> **Core Philosophy:**  
> *"AI interprets and prioritizes; authoritative sources and deterministic rules validate; humans decide."*

---

## 1. Executive Summary

Government procurement on GeM (Government e-Marketplace) is digitally mediated, but bid compliance verification remains fundamentally manual, evidence-fragmented, and temporally unaware. A procurement officer evaluating high-stakes tenders must cross-reference dozens of PDFs, multiple tax and corporate databases, and time-sensitive certifications across multiple bidders.

**VERITAS-GEM** (Verification, Evidence-Reasoning, Intelligence, Traceability, Audit & Security for GeM) introduces a structured **Evidence Intelligence Layer** between raw procurement documents and human decision-making:
- **Never an opaque score:** Decomposes compliance into 6 auditable dimensions (Mandatory Coverage, Evidence Strength, Source Verification, Identity Consistency, Temporal Validity, and Contradiction Risk).
- **Cross-Document Contradiction Detection:** Discovers factual inconsistencies across multiple documents submitted by the same bidder (e.g. ₹12.40 Cr turnover in financial statements vs ₹8.20 Cr in self-declaration).
- **Compliance Time Machine:** Reconstructs the exact legal validity state of certificates as of the bid submission deadline (15-Sep-2026), proving whether a certificate was expired at the time of bidding.
- **Three-Column Evidence Grounding:** 100% transparent lineage from Tender Clause $\rightarrow$ Grounded AI Finding $\rightarrow$ Primary Document Pages with side-by-side highlighted bounding boxes.
- **Human-in-the-Loop Governance:** Mandatory justification enforced when an officer overrides an AI deduction.
- **Immutable Cryptographic Audit Trail:** Append-only SHA-256 chained audit ledger for RTI and parliamentary defense.

---

## 2. Architecture Overview

```
                               ┌────────────────────────────────────────┐
                               │   Tender PDF & Bidder Document Pkgs    │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │  PaddleOCR + Layout & Table Extractor  │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                VERITAS-GEM BACKEND CORE                                │
│                                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │   Tender Intelligence │  │  Contradiction Radar  │  │  Compliance Time Machine   │  │
│  │ 47 Clauses → 29 Reqs  │  │ Cross-Document Engine │  │ Date Reconstruction Engine │  │
│  └───────────────────────┘  └───────────────────────┘  └────────────────────────────┘  │
│                                                                                        │
│  ┌──────────────────────────────────────────────────┐  ┌────────────────────────────┐  │
│  │      Authoritative Source Adapters (MOCK/REAL)   │  │  Cryptographic Audit Trail │  │
│  │  GSTN · MCA21 · DigiLocker · Udyam · Debarment   │  │   SHA-256 Block Chaining   │  │
│  └──────────────────────────────────────────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 OFFICER DECISION GATEWAY                               │
│                   [Accept Finding]    [Override with Reason]    [Escalate]             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Innovation Features & Screens

| # | Screen / Feature | Key Innovation & Demonstration Capability |
|---|---|---|
| **1** | **Tender Intelligence Matrix** | Parses natural language tender clauses into 29 structured compliance requirements with threshold rules and validation categories. |
| **2** | **Multi-Bidder Leaderboard** | Ranks bidders (ABC Industries [High Risk], XYZ Corp [Medium Risk], PQR Engg [Low Risk/Verified]) using a 6-dimension decomposed scorecard. |
| **3** | **Contradiction Radar** | **Signature Feature:** Flags ₹4.20 Cr turnover gap (₹12.40 Cr vs ₹8.20 Cr) and legal entity discrepancy ("Limited" vs "Pvt Ltd"). |
| **4** | **Compliance Time Machine** | **Signature Feature:** Interactive timeline slider (2024–2027) proving that ABC's BIS License expired 3 months prior to the 15-Sep-2026 bid deadline. |
| **5** | **3-Column Evidence Viewer** | Requirement $\rightarrow$ AI Inference $\rightarrow$ Dual-document side-by-side OCR pages with highlighted bounding boxes. |
| **6** | **Human Decision Center** | Officers make legal determinations; overrides require a mandatory documented justification recorded in the audit trail. |
| **7** | **Cryptographic Audit Ledger** | SHA-256 chained event blocks with live verification of chain integrity and JSON report export. |
| **8** | **Judge Demo Mode** | 1-Click automated 7-minute pitch walkthrough highlighting every killer demo moment for hackathon judges. |

---

## 4. Quickstart Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Modern web browser (Chrome, Edge, Firefox)

### Single-Command Launch
```bash
./start.sh
```

Or manually:
```bash
# 1. Install dependencies
python3 -m pip install -r backend/requirements.txt --break-system-packages

# 2. Run backend and static web app
python3 backend/run.py
```

Open your browser at:
- **Interactive Application:** `http://localhost:8000`
- **Swagger REST API Documentation:** `http://localhost:8000/api/docs`

---

## 5. Running Automated Tests

A comprehensive 13-test automated test suite verifies all calculation engines, REST endpoints, and security constraints:

```bash
python3 -m pytest backend/tests/test_api.py -v
```

---

## 6. Project Directory Structure

```
VERITAS-GEM/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py               # REST API Endpoints
│   │   ├── data/
│   │   │   ├── sample_tender.json      # 47 MoPNG Subsea Valve clauses
│   │   │   ├── sample_bidders.json     # ABC, XYZ, PQR bidder packages
│   │   │   ├── sample_findings.json    # Grounded evidence & bounding boxes
│   │   │   ├── sample_contradictions.json # Cross-document discrepancies
│   │   │   ├── sample_temporal.json    # Certificate validity timeline
│   │   │   ├── sample_adapters.json    # Mock GSTN, MCA, DigiLocker
│   │   │   └── sample_audit.json       # Initial audit blocks
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── domain.py               # Pydantic schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── adapters.py             # VerificationProvider hierarchy
│   │   │   ├── contradiction_engine.py # Cross-document comparator
│   │   │   ├── temporal_engine.py      # Time Machine simulator
│   │   │   ├── scoring_engine.py       # State manager & scorecards
│   │   │   └── audit_ledger.py         # SHA-256 cryptographic ledger
│   │   ├── config.py
│   │   └── main.py                     # FastAPI application
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py                 # Automated pytest suite
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── css/
│   │   ├── design-system.css           # Modern tokens & cosmic dark theme
│   │   ├── components.css              # Cards, badges, scorecards, modals
│   │   ├── layouts.css                 # 3-Column evidence grid, leaderboards
│   │   └── animations.css              # Pulsing red alerts, laser scan lines
│   ├── js/
│   │   ├── components/
│   │   │   ├── header.js               # Ministry banner & demo mode launcher
│   │   │   ├── tender-intelligence.js  # Clause requirements matrix
│   │   │   ├── bidder-matrix.js        # Multi-bidder leaderboard
│   │   │   ├── evidence-viewer.js      # 3-Column side-by-side viewer
│   │   │   ├── contradiction-radar.js  # Red flag contradiction cards
│   │   │   ├── time-machine.js         # Interactive date slider
│   │   │   ├── decision-center.js      # Officer action modal
│   │   │   ├── audit-ledger.js         # Tamper-evident ledger table
│   │   │   ├── adapter-status.js       # Live test console
│   │   │   └── demo-tour.js            # 7-Minute Judge Demo Tour
│   │   ├── api.js                      # REST API client
│   │   ├── state.js                    # Reactive store
│   │   ├── utils.js                    # Formatting & toast notifications
│   │   └── app.js                      # Main router & bootstrap
│   └── index.html
├── docs/
│   ├── masterprompt.md
│   ├── prd.md
│   └── solution-blueprint.md           # 32-Section Blueprint
├── start.sh
└── README.md
```

---

## 7. License & Compliance

Designed and built for **Smart India Hackathon 2026** (Problem Statement SIH26100) under the guidelines of the Ministry of Petroleum & Natural Gas and the Government e-Marketplace (GeM). In compliance with Rule 144(xi) of the General Financial Rules (GFR), 2017.
