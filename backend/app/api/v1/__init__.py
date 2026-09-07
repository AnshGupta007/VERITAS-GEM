"""API v1 Router Aggregator for VERITAS-GEM.

Aggregates all 10 decomposed version 1 domain routers:
- system: Platform health, status, demo reset, and policy sandbox
- tenders: Tender clause exploration, multi-agent ingest, and document upload
- bidders: Bidder registry, scorecards, executive reports, and bidder package upload
- evidence: Multi-source evidence inspection and contradiction detection
- temporal: Compliance Time Machine certificate validity simulation
- decisions: Officer human-in-the-loop decision center
- forensics: Cartelization radar, shell detection, committee attestation, legal cure, and commercial BoQ
- audit: Cryptographic SHA-256 immutable audit ledger
- adapters: Authoritative external verification adapters (GSTN, MCA21, etc.)
- copilot: 'Ask Veritas' conversational forensic assistant
"""
from fastapi import APIRouter

from .system import router as system_router
from .tenders import router as tenders_router
from .bidders import router as bidders_router
from .evidence import router as evidence_router
from .temporal import router as temporal_router
from .decisions import router as decisions_router
from .forensics import router as forensics_router
from .audit import router as audit_router
from .adapters import router as adapters_router
from .copilot import router as copilot_router
from .gem_bridge import router as gem_router

v1_router = APIRouter(prefix="/api/v1")

# Include all decomposed domain routers
v1_router.include_router(system_router)
v1_router.include_router(tenders_router)
v1_router.include_router(bidders_router)
v1_router.include_router(evidence_router)
v1_router.include_router(temporal_router)
v1_router.include_router(decisions_router)
v1_router.include_router(forensics_router)
v1_router.include_router(audit_router)
v1_router.include_router(adapters_router)
v1_router.include_router(copilot_router)
v1_router.include_router(gem_router)

__all__ = ["v1_router"]
