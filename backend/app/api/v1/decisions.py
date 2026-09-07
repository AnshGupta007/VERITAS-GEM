"""Officer decision endpoints."""
from fastapi import APIRouter, Depends, HTTPException

from ...dependencies import get_data_manager
from ...models import DecisionRequest, DecisionResult

router = APIRouter(tags=["Decisions"])


@router.post("/decisions", response_model=DecisionResult)
def submit_decision(
    req: DecisionRequest,
    data_manager=Depends(get_data_manager),
) -> DecisionResult:
    """Submit human officer decision (Accept / Override / Escalate) to immutable ledger."""
    try:
        res = data_manager.process_decision(req)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal decision processing error: {str(e)}")
