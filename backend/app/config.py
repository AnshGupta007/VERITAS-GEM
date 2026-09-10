"""
Configuration settings for VERITAS-GEM.

Uses pydantic-settings for type-safe, environment-variable-driven configuration.
Supports .env file overrides for development and Docker environment injection for production.

Priority order (highest wins):
    1. Environment variables (e.g., VERITAS_PORT=9000)
    2. .env file in project root
    3. Default values defined below
"""
import os
from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide configuration with environment variable support."""

    model_config = SettingsConfigDict(
        env_prefix="VERITAS_",
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Application Identity ──────────────────────────────────────
    app_name: str = "VERITAS-GEM"
    app_description: str = "Evidence-Backed AI Compliance Co-Pilot for Government Procurement (GeM / SIH26100)"
    version: str = "1.0.0"
    model_version: str = "veritas-v1.0.0"
    rule_version: str = "v1.2-GeM-MoPNG"

    # ── Server ────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = int(os.environ.get("PORT", 8000))
    debug: bool = True
    workers: int = 1

    # ── Paths ─────────────────────────────────────────────────────
    base_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent)
    data_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent / "data")
    frontend_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "frontend")

    # ── Officer Session (Demo Context) ────────────────────────────
    default_officer_id: str = "OFF-8821"
    default_officer_name: str = "Sh. Rajesh Sharma (Director - Technical Evaluation)"

    # ── API & Routing ─────────────────────────────────────────────
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = ["*"]

    # ── Logging ───────────────────────────────────────────────────
    log_level: str = "INFO"
    log_json: bool = False  # True for production JSON log output

    # ── Audit Ledger ──────────────────────────────────────────────
    audit_chain_genesis: str = "GENESIS-000000000000000000000000000000000000"


# ── Backward-compatible module-level aliases ─────────────────────
# These preserve compatibility with existing code that imports from config
_settings = Settings()

BASE_DIR = _settings.base_dir
DATA_DIR = _settings.data_dir
FRONTEND_DIR = _settings.frontend_dir
APP_NAME = _settings.app_name
APP_DESCRIPTION = _settings.app_description
VERSION = _settings.version
MODEL_VERSION = _settings.model_version
RULE_VERSION = _settings.rule_version
DEFAULT_OFFICER_ID = _settings.default_officer_id
DEFAULT_OFFICER_NAME = _settings.default_officer_name
HOST = _settings.host
PORT = _settings.port
DEBUG = _settings.debug
API_V1_PREFIX = _settings.api_v1_prefix


@lru_cache()
def get_settings() -> Settings:
    """Cached settings factory for dependency injection."""
    return Settings()
