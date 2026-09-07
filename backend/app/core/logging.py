"""
VERITAS-GEM Structured Logging Configuration.

Provides JSON-structured logging for production and human-readable
colored output for development. Integrates request correlation IDs
for full distributed tracing across API calls.
"""
import logging
import sys
from typing import Optional

import structlog


def configure_logging(log_level: str = "INFO", json_output: bool = False) -> None:
    """
    Configure structured logging for the entire application.

    Args:
        log_level: Minimum log level (DEBUG, INFO, WARNING, ERROR)
        json_output: If True, emit JSON log lines (for production/log aggregation).
                     If False, emit human-readable colored output (for development).
    """
    level = getattr(logging, log_level.upper(), logging.INFO)

    # Shared processors for both structlog and stdlib
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if json_output:
        # Production: JSON output for log aggregation (ELK, Loki, etc.)
        renderer = structlog.processors.JSONRenderer()
    else:
        # Development: colored, human-readable console output
        renderer = structlog.dev.ConsoleRenderer(colors=sys.stderr.isatty())

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Remove existing handlers to prevent duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add single stderr handler with our formatter
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)

    # Quiet down noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)

    structlog.get_logger("veritas.logging").info(
        "Structured logging configured",
        level=log_level,
        json_output=json_output,
    )


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Get a named structured logger."""
    return structlog.get_logger(name)


def bind_request_context(request_id: str, method: str = "", path: str = "") -> None:
    """Bind request-scoped context variables for log correlation."""
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        http_method=method,
        http_path=path,
    )


def clear_request_context() -> None:
    """Clear request-scoped context variables."""
    structlog.contextvars.clear_contextvars()
