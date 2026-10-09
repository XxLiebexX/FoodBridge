import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_metrics():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "surplus" in data
    assert "demand" in data

def test_predict_surplus():
    payload = {
        "restaurant_type": "CASUAL_DINING",
        "day_of_week": 4,
        "month": 10,
        "food_category": "COOKED_MEALS",
        "expected_customers": 180,
        "has_event": False,
        "is_holiday": False
    }
    response = client.post("/predict/surplus", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_surplus_kg" in data
    assert data["predicted_surplus_kg"] > 0
    assert "expected_range" in data
    assert data["expected_range"]["min_kg"] <= data["predicted_surplus_kg"] <= data["expected_range"]["max_kg"]

def test_predict_demand():
    payload = {
        "ngo_type": "COMMUNITY_KITCHEN",
        "food_category": "COOKED_MEALS",
        "day_of_week": 5,
        "people_served": 200,
        "is_weekend": True,
        "scheduled_drive": True
    }
    response = client.post("/predict/demand", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_demand_kg" in data
    assert data["predicted_demand_kg"] > 0
    assert "predicted_meals" in data
    assert data["predicted_meals"] > 0
