"""VERITAS-GEM API Routing Package.

Exposes:
- `v1_router`: Versioned `/api/v1` routes
- `legacy_router` / `router`: Backward-compatible `/api` routes (without /v1 prefix)
"""
from fastapi import APIRouter

from .v1 import v1_router
from .v1.system import router as system_router
from .v1.tenders import router as tenders_router
from .v1.bidders import router as bidders_router
from .v1.evidence import router as evidence_router
from .v1.temporal import router as temporal_router
from .v1.decisions import router as decisions_router
from .v1.forensics import router as forensics_router
from .v1.audit import router as audit_router
from .v1.adapters import router as adapters_router
from .v1.copilot import router as copilot_router
from .v1.gem_bridge import router as gem_router

# Backward-compatible router mounted at /api
legacy_router = APIRouter(prefix="/api")
legacy_router.include_router(system_router)
legacy_router.include_router(tenders_router)
legacy_router.include_router(bidders_router)
legacy_router.include_router(evidence_router)
legacy_router.include_router(temporal_router)
legacy_router.include_router(decisions_router)
legacy_router.include_router(forensics_router)
legacy_router.include_router(audit_router)
legacy_router.include_router(adapters_router)
legacy_router.include_router(copilot_router)
legacy_router.include_router(gem_router)

# Alias router for existing imports
router = legacy_router

__all__ = ["v1_router", "legacy_router", "router"]
