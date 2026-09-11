"""Ask Veritas AI Copilot conversational forensic assistant endpoints."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel

from ...config import get_settings
from ...dependencies import get_data_manager
from ...services.copilot import query_copilot

router = APIRouter(tags=["AI Co-Pilot"])


class CopilotQueryRequest(BaseModel):
    query: str
    api_key: Optional[str] = None
    model: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None


@router.get("/copilot/status")
def get_copilot_status(
    settings=Depends(get_settings),
    data_manager=Depends(get_data_manager),
) -> Dict[str, Any]:
    """Returns Copilot reasoning engine status and active model."""
    tender = data_manager.get_tender()
    has_server_key = bool(settings.groq_api_key)
    return {
        "engine": "groq" if has_server_key else "hybrid_deterministic",
        "groq_configured": has_server_key,
        "default_model": settings.groq_model,
        "active_tender": tender.tender_number if tender else None,
        "supported_models": [
            "qwen/qwen3.8-27b",
            "groq/compound",
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b"
        ]
    }


@router.post("/copilot/query")
def post_copilot_query(
    payload: CopilotQueryRequest,
    x_groq_api_key: Optional[str] = Header(None),
    data_manager=Depends(get_data_manager),
    settings=Depends(get_settings),
) -> Dict[str, Any]:
    import os
    is_test = os.environ.get("IS_PYTEST_RUN") == "1"
    server_key = None if is_test else settings.groq_api_key
    effective_key = payload.api_key or x_groq_api_key or server_key
    effective_model = payload.model or settings.groq_model
    return query_copilot(
        payload.query,
        data_manager=data_manager,
        api_key=effective_key,
        model=effective_model,
        history=payload.history,
    )
