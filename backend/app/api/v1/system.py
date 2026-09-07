"""System, health, and policy sandbox endpoints for VERITAS-GEM."""
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ...config import Settings
from ...dependencies import get_app_settings, get_audit_ledger, get_data_manager
from ...services.adapters import get_all_adapters
from ...services.commercial_evaluation import reset_commercial_state
from ...services.committee_consensus import reset_committee_state
from ...services.contradiction_engine import clear_contradictions_cache
from ...services.policy_engine import (
    get_policy_config,
    get_policy_impact_summary,
    update_policy_config,
)
from ...services.temporal_engine import clear_temporal_cache

router = APIRouter(tags=["System & Policy"])


class PolicyUpdateRequest(BaseModel):
    config: Dict[str, Any]
    officer_id: Optional[str] = "OFF-8821"


@router.get("/system/status")
def get_system_status(
    settings: Settings = Depends(get_app_settings),
    audit_ledger=Depends(get_audit_ledger),
) -> Dict[str, Any]:
    """Platform health, governance rules, and officer session context."""
    ledger_audit = audit_ledger.verify_integrity()
    return {
        "platform": settings.app_name,
        "description": settings.app_description,
        "version": settings.version,
        "model_version": settings.model_version,
        "rule_version": settings.rule_version,
        "officer_session": {
            "officer_id": settings.default_officer_id,
            "name": settings.default_officer_name,
            "role": "Procurement Evaluation Committee Chairperson",
            "department": "MoPNG / ONGC Subsea Drilling Procurement Division",
        },
        "audit_ledger": ledger_audit,
        "adapters_count": len(get_all_adapters()),
        "status": "OPERATIONAL",
    }


@router.post("/demo/reset")
def reset_demo(
    data_manager=Depends(get_data_manager),
) -> Dict[str, Any]:
    """Reset all decisions and state back to fresh demonstration state."""
    data_manager.reset_demo_state()
    reset_committee_state()
    reset_commercial_state()
    clear_contradictions_cache()
    clear_temporal_cache()
    return {"message": "Demo state successfully reset to initial baseline."}


@router.get("/policy/config")
def get_procurement_policy_configuration() -> Dict[str, Any]:
    """Fetches active GFR 2017 & GeM policy sandbox configuration and impact preview."""
    return {
        "policy": get_policy_config(),
        "impact": get_policy_impact_summary(),
    }


@router.post("/policy/config")
def update_procurement_policy_configuration(payload: PolicyUpdateRequest) -> Dict[str, Any]:
    """Updates policy toggles and recalculates compliance impact."""
    return update_policy_config(payload.config, payload.officer_id or "OFF-8821")
