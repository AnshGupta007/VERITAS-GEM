"""Ask Veritas AI Copilot conversational forensic assistant endpoints."""
from typing import Any, Dict
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ...dependencies import get_data_manager
from ...services.copilot import query_copilot

router = APIRouter(tags=["AI Co-Pilot"])


class CopilotQueryRequest(BaseModel):
    query: str


@router.post("/copilot/query")
def post_copilot_query(
    payload: CopilotQueryRequest,
    data_manager=Depends(get_data_manager),
) -> Dict[str, Any]:
    """'Ask Veritas' conversational forensic assistant query endpoint."""
    return query_copilot(payload.query, data_manager=data_manager)
