"""
Backend Integration & API Tests.

Validates FastAPI endpoints, module retrieval, sandbox assertions,
AI Tutor Q&A, and Make.com daily nudge webhook triggers.
"""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="module")
def client():
    """
    TestClient fixture that activates FastAPI lifespan events,
    ensuring database tables and seed data are initialized.
    """
    with TestClient(app) as test_client:
        yield test_client


def test_health_check(client: TestClient):
    """Verify health endpoint returns 200 OK for Cloud Run probes."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_list_and_get_modules(client: TestClient):
    """Verify corporate briefs listing and detailed fetch."""
    # List modules
    list_resp = client.get("/api/modules")
    assert list_resp.status_code == 200
    modules = list_resp.json()
    assert len(modules) >= 1

    first_slug = modules[0]["slug"]

    # Fetch module by slug
    detail_resp = client.get(f"/api/modules/{first_slug}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["slug"] == first_slug
    assert len(detail["files"]) >= 1
    assert len(detail["assertions"]) >= 1


def test_code_execution_assertions(client: TestClient):
    """Verify simulated code compilation and assertion evaluation."""
    list_resp = client.get("/api/modules")
    module_id = list_resp.json()[0]["id"]

    # Test with valid service.yaml configuration
    payload = {
        "user_id": 1,
        "filename": "service.yaml",
        "code": "containerPort: 8080\nlimits:\n  memory: 512Mi\ncontainerConcurrency: 80",
    }
    exec_resp = client.post(f"/api/modules/{module_id}/execute", json=payload)
    assert exec_resp.status_code == 200
    data = exec_resp.json()
    assert data["success"] is True
    assert len(data["assertions"]) == 3
    assert all(a["passed"] for a in data["assertions"])


def test_ai_tutor_query(client: TestClient):
    """Verify contextual response from In-Flow AI Tutor Copilot."""
    list_resp = client.get("/api/modules")
    module_id = list_resp.json()[0]["id"]

    tutor_payload = {
        "module_id": module_id,
        "user_query": "Why did my previous container fail health checks on port 3000?",
        "current_code_snippet": "containerPort: 3000",
        "current_step": 2,
    }
    tutor_resp = client.post("/api/tutor/query", json=tutor_payload)
    assert tutor_resp.status_code == 200
    tutor_data = tutor_resp.json()
    assert "8080" in tutor_data["response"]
    assert len(tutor_data["suggested_actions"]) > 0


def test_make_daily_nudge_webhook(client: TestClient):
    """Verify daily nudge webhook trigger."""
    list_resp = client.get("/api/modules")
    module_id = list_resp.json()[0]["id"]

    nudge_payload = {
        "user_id": 1,
        "module_id": module_id,
    }
    nudge_resp = client.post(
        "/api/webhooks/trigger-daily-nudge",
        json=nudge_payload,
    )
    assert nudge_resp.status_code == 200
    nudge_data = nudge_resp.json()
    assert nudge_data["status"] == "dispatched"
