"""
Request ID Middleware for VERITAS-GEM.

Generates a unique UUID correlation ID for every incoming HTTP request
and attaches it to:
  1. The response headers as X-Request-ID
  2. The structlog context for log correlation
  3. The response for traceability in error payloads

This enables full distributed tracing across the API layer.
"""
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from ..core.logging import bind_request_context, clear_request_context, get_logger

logger = get_logger("veritas.middleware.request_id")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Injects X-Request-ID header and binds structured logging context."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Use client-provided request ID or generate one
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # Bind to structlog context for this request's lifetime
        bind_request_context(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        # Measure request timing
        start_time = time.monotonic()

        # Store on request state for downstream access
        request.state.request_id = request_id

        try:
            response = await call_next(request)
        except Exception:
            clear_request_context()
            raise

        # Add response headers
        duration_ms = round((time.monotonic() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = str(duration_ms)
        response.headers["X-Powered-By"] = "VERITAS-GEM/1.0"

        # Log API request summary (skip static file requests)
        if request.url.path.startswith("/api"):
            logger.info(
                "api_request",
                status_code=response.status_code,
                duration_ms=duration_ms,
            )

        clear_request_context()
        return response
