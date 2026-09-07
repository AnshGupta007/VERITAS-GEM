"""Cryptographic audit ledger endpoints."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query

from ...dependencies import get_audit_ledger
from ...models import AuditEvent

router = APIRouter(tags=["Audit Ledger"])


@router.get("/audit", response_model=List[AuditEvent])
def get_audit_trail(
    bidder_id: Optional[str] = Query(None, description="Filter audit trail by bidder ID"),
    audit_ledger=Depends(get_audit_ledger),
) -> List[AuditEvent]:
    """Retrieve immutable cryptographic audit ledger."""
    return audit_ledger.get_trail(bidder_id)


@router.get("/audit/verify")
def verify_audit_ledger(
    audit_ledger=Depends(get_audit_ledger),
) -> Dict[str, Any]:
    """Cryptographic verification of audit ledger block integrity."""
    return audit_ledger.verify_integrity()
