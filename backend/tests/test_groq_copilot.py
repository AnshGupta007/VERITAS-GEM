"""Tests for Groq-powered Veritas Copilot with RAG context and deterministic fallback."""
import os
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.copilot import query_copilot, build_procurement_context, query_groq_llm
from app.services.scoring_engine import ProcurementDataManager

TEST_GROQ_KEY = os.environ.get("GROQ_API_KEY", os.environ.get("VERITAS_GROQ_API_KEY", ""))


@pytest.fixture
def client():
    return TestClient(app)


def test_copilot_status_endpoint(client):
    """Verify the /copilot/status endpoint returns engine information."""
    resp = client.get("/api/v1/copilot/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "engine" in data
    assert "default_model" in data
    assert "supported_models" in data
    assert "qwen/qwen3.8-27b" in data["supported_models"]


def test_build_procurement_context():
    """Verify that build_procurement_context extracts tender and bidder metrics."""
    dm = ProcurementDataManager()
    ctx = build_procurement_context(dm)
    assert "tender" in ctx
    assert "bidders" in ctx
    assert "key_statutory_frameworks" in ctx
    assert ctx["tender"]["estimated_value_cr"] > 0
    assert len(ctx["bidders"]) > 0


def test_copilot_live_groq_query():
    """Test live Groq query returns structured AI response with citations."""
    dm = ProcurementDataManager()
    question = "Why does ABC Industries face disqualification under Rule 144 GFR 2017?"
    res = query_copilot(question, data_manager=dm, api_key=TEST_GROQ_KEY)
    assert res["found"] is True
    assert res["query"] == question
    assert len(res["answer"]) > 20
    assert "citations" in res
    assert isinstance(res["citations"], list)
    assert "severity" in res
    assert "recommended_action" in res
    assert res.get("engine") in ("groq", "deterministic")


def test_copilot_fallback_on_invalid_key():
    """Verify that an invalid API key gracefully falls back to deterministic engine."""
    dm = ProcurementDataManager()
    question = "Is there any cartelization or bid rigging detected?"
    res = query_copilot(question, data_manager=dm, api_key="invalid_key_xyz_123")
    assert res["found"] is True
    assert "cartel" in res["answer"].lower() or "collusion" in res["answer"].lower()
    assert len(res["citations"]) > 0
    assert res.get("engine") == "deterministic"


def test_api_copilot_query_endpoint(client):
    """Test POST /api/v1/copilot/query with payload."""
    payload = {
        "query": "What is the turnover discrepancy for ABC Industries?",
        "api_key": TEST_GROQ_KEY,
        "model": "qwen/qwen3.8-27b"
    }
    resp = client.post("/api/v1/copilot/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["found"] is True
    assert "citations" in data
    assert len(data["answer"]) > 10
