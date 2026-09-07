"""FastAPI Dependency Injection Providers for VERITAS-GEM.

Replaces global singletons with proper DI using FastAPI's Depends() system.
Services are initialized once on app startup and stored on app.state,
then injected into route handlers via these dependency functions.

Usage in routes:
    @router.get("/bidders")
    def list_bidders(dm: ProcurementDataManager = Depends(get_data_manager)):
        return dm.get_all_bidders()
"""
from typing import TYPE_CHECKING
from fastapi import Request

from .config import Settings, get_settings
from .core.events import EventBus

if TYPE_CHECKING:
    from .services.audit_ledger import AuditLedger
    from .services.scoring_engine import ProcurementDataManager
    from .core.pipeline import CompliancePipeline


def get_app_settings() -> Settings:
    """Inject application settings."""
    return get_settings()


def get_event_bus(request: Request) -> EventBus:
    """Inject the application-scoped event bus from app.state."""
    return getattr(request.app.state, "event_bus", None)


def get_data_manager(request: Request) -> "ProcurementDataManager":
    """Inject the ProcurementDataManager from app.state."""
    dm = getattr(request.app.state, "data_manager", None)
    if dm is None:
        from .services.scoring_engine import DATA_MANAGER
        return DATA_MANAGER
    return dm


def get_audit_ledger(request: Request) -> "AuditLedger":
    """Inject the AuditLedger from app.state."""
    al = getattr(request.app.state, "audit_ledger", None)
    if al is None:
        from .services.audit_ledger import AUDIT_LEDGER
        return AUDIT_LEDGER
    return al


def get_pipeline(request: Request) -> "CompliancePipeline":
    """Inject the CompliancePipeline from app.state."""
    return getattr(request.app.state, "pipeline", None)
