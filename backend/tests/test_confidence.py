from fastapi.testclient import TestClient
import json
import pytest
from app.main import app

client = TestClient(app)

def test_confidence_high_with_clear_input():
    # Pass mock mode via header to avoid touching AWS dependencies
    response = client.post(
        "/api/parse",
        headers={"X-Mock-Mode": "1"},
        json={
            "input_type": "text",
            "content": "I want to make a burger"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] == "high"
    assert data["clarification_question"] is None
    assert len(data["cart"]) > 0

def test_confidence_low_with_ambiguous_input():
    # Using the mock keyword "snacks for guests" which triggers the low confidence mock
    response = client.post(
        "/api/parse",
        headers={"X-Mock-Mode": "1"},
        json={
            "input_type": "text",
            "content": "Need snacks for guests"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] == "low"
    assert "What kind of gathering" in data["clarification_question"]
    assert len(data["cart"]) == 0
    assert data["intent_type"] == "general"
