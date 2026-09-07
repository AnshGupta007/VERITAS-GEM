"""FastAPI Application Main Entrypoint for VERITAS-GEM.

Configures application lifespan, structured logging, dependency injection wiring,
middleware stack (CORS, Request-ID tracing, Global error handling), versioned
REST routers (v1 + backward-compatible /api), and SPA static file mounting.
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .api import legacy_router, v1_router
from .config import FRONTEND_DIR, get_settings
from .core.events import EventBus
from .core.logging import configure_logging, get_logger
from .core.pipeline import CompliancePipeline
from .middleware import RequestIDMiddleware, register_error_handlers
from .services.audit_ledger import AUDIT_LEDGER, AuditLedger
from .services.scoring_engine import DATA_MANAGER, ProcurementDataManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan managing startup and shutdown resource lifecycles."""
    settings = get_settings()

    # 1. Initialize structured logging
    configure_logging(log_level=settings.log_level, json_output=settings.log_json)
    logger = get_logger("veritas.bootstrap")
    logger.info(
        "startup_initializing",
        app_name=settings.app_name,
        version=settings.version,
    )

    # 2. Wire application singletons and state for dependency injection
    event_bus = EventBus()
    audit_ledger = AUDIT_LEDGER
    data_manager = DATA_MANAGER
    data_manager.event_bus = event_bus
    data_manager.audit_ledger = audit_ledger
    pipeline = CompliancePipeline(event_bus=event_bus)

    app.state.settings = settings
    app.state.event_bus = event_bus
    app.state.audit_ledger = audit_ledger
    app.state.data_manager = data_manager
    app.state.pipeline = pipeline

    logger.info("startup_complete", host=settings.host, port=settings.port)

    yield

    logger.info("shutdown_completed")


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.version,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── Middleware Stack ──────────────────────────────────────────────────
# 1. CORS for open accessibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Distributed Tracing Request ID Middleware
app.add_middleware(RequestIDMiddleware)

# 3. Standardized Global Error Handlers
register_error_handlers(app)

# ── Routers ───────────────────────────────────────────────────────────
# Version 1 Primary Router (/api/v1)
app.include_router(v1_router)

# Backward-compatible Legacy Router (/api)
app.include_router(legacy_router)

# ── Static Frontend & SPA Serving ─────────────────────────────────────
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/", include_in_schema=False)
    async def serve_index():
        index_file = FRONTEND_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": f"VERITAS-GEM API running. Frontend folder exists at {FRONTEND_DIR}"}

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Do not catch-all for missing API endpoints
        if full_path in ("api", "api/v1") or full_path.startswith("api/") or full_path.startswith("api/v1/"):
            raise HTTPException(status_code=404, detail=f"API endpoint '/{full_path}' not found.")

        # If static asset requested
        potential_file = FRONTEND_DIR / full_path
        if potential_file.exists() and potential_file.is_file():
            return FileResponse(potential_file)

        # Otherwise serve index.html for SPA routing
        index_file = FRONTEND_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "VERITAS-GEM API Server"}
