"""Authoritative external source verification adapter endpoints."""
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Query

from ...models import AdapterStatus
from ...services.adapters import get_all_adapters, test_adapter_query

router = APIRouter(tags=["Source Verification Adapters"])


@router.get("/verification/adapters", response_model=List[AdapterStatus])
def list_adapters() -> List[AdapterStatus]:
    """List external source verification adapters and health status."""
    return get_all_adapters()


@router.post("/verification/adapters/test")
def test_adapter(
    adapter_id: str = Query(..., description="Adapter ID (e.g. ADAPT-GSTN-01)"),
    identifier: str = Query(..., description="Target identifier (GSTIN, PAN, CIN, etc.)"),
) -> Dict[str, Any]:
    """Execute live simulated query against verification adapter."""
    res = test_adapter_query(adapter_id, identifier)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res
