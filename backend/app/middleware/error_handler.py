"""
Global Error Handler Middleware for VERITAS-GEM.

Normalizes all API errors into a consistent JSON envelope format,
ensuring the frontend always receives a predictable error structure
regardless of whether the error originated from business logic,
validation, or an unexpected exception.

Error Envelope Format:
    {
        "error": true,
        "code": "FINDING_NOT_FOUND",
        "message": "Finding 'FIND-XXX-99' not found.",
        "request_id": "abc-123-...",
        "timestamp": "2026-09-04T09:30:00Z"
    }
"""
import traceback
from datetime import datetime, timezone
from typing import Dict, Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from ..core.logging import get_logger

logger = get_logger("veritas.middleware.error_handler")


def _error_envelope(
    status_code: int,
    code: str,
    message: str,
    request_id: str = "",
    details: Any = None,
) -> Dict[str, Any]:
    """Build standardized error response payload."""
    envelope = {
        "error": True,
        "code": code,
        "message": message,
        "detail": message,
        "request_id": request_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if details:
        envelope["details"] = details
    return envelope


def register_error_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI application."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")

        # Map common HTTP codes to semantic error codes
        code_map = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "VALIDATION_ERROR",
            429: "RATE_LIMITED",
            500: "INTERNAL_ERROR",
        }
        error_code = code_map.get(exc.status_code, f"HTTP_{exc.status_code}")

        logger.warning(
            "http_error",
            status_code=exc.status_code,
            error_code=error_code,
            detail=str(exc.detail),
        )

        return JSONResponse(
            status_code=exc.status_code,
            content=_error_envelope(
                status_code=exc.status_code,
                code=error_code,
                message=str(exc.detail),
                request_id=request_id,
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")

        # Extract human-readable validation error details
        error_details = []
        for error in exc.errors():
            loc = " → ".join(str(x) for x in error.get("loc", []))
            error_details.append({
                "field": loc,
                "message": error.get("msg", ""),
                "type": error.get("type", ""),
            })

        logger.warning(
            "validation_error",
            errors=error_details,
        )

        return JSONResponse(
            status_code=422,
            content=_error_envelope(
                status_code=422,
                code="VALIDATION_ERROR",
                message="Request validation failed. Check 'details' for field-specific errors.",
                request_id=request_id,
                details=error_details,
            ),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "unknown")

        logger.error(
            "unhandled_exception",
            exception_type=type(exc).__name__,
            exception_message=str(exc),
            traceback=traceback.format_exc(),
        )

        return JSONResponse(
            status_code=500,
            content=_error_envelope(
                status_code=500,
                code="INTERNAL_ERROR",
                message="An unexpected internal error occurred. Please report this to the VERITAS-GEM team.",
                request_id=request_id,
            ),
        )
