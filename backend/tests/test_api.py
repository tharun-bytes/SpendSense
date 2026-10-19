"""
Integration tests for SpendSense Flask REST API Endpoints
"""

import io
import json
import pytest
from app import create_app
from store import store


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    store.load_sample_data()
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"


def test_get_status_and_sample_data(client):
    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.get_json()
    assert "records_count" in data
    assert data["records_count"] > 0
    assert data["is_demo_mode"] is True


def test_get_transactions(client):
    res = client.get("/api/transactions?limit=10")
    assert res.status_code == 200
    data = res.get_json()
    assert "transactions" in data
    assert len(data["transactions"]) <= 10
    assert "aggregates" in data
    assert "pagination" in data


def test_update_transaction_category(client):
    # Fetch first transaction
    res = client.get("/api/transactions?limit=1")
    tx = res.get_json()["transactions"][0]
    tx_id = tx["id"]

    # Patch category
    patch_res = client.patch(
        f"/api/transactions/{tx_id}/category",
        json={"category": "Education"}
    )
    assert patch_res.status_code == 200
    assert patch_res.get_json()["transaction"]["category"] == "Education"


def test_get_summary_and_analytics(client):
    res = client.get("/api/summary")
    assert res.status_code == 200
    metrics = res.get_json()["metrics"]
    assert "total_income" in metrics
    assert "total_expenses" in metrics
    assert "net_cash_flow" in metrics

    res_monthly = client.get("/api/analytics/monthly")
    assert res_monthly.status_code == 200
    assert "monthly" in res_monthly.get_json()

    res_cat = client.get("/api/analytics/categories")
    assert res_cat.status_code == 200
    assert "categories" in res_cat.get_json()


def test_get_insights(client):
    res = client.get("/api/insights")
    assert res.status_code == 200
    data = res.get_json()
    assert "outliers" in data
    assert "recurring_subscriptions" in data
    assert "narratives" in data


def test_budgets_endpoint(client):
    res = client.get("/api/budgets")
    assert res.status_code == 200
    data = res.get_json()
    assert "budgets" in data
    assert len(data["budgets"]) > 0

    # Update a budget
    post_res = client.post("/api/budgets", json={"category": "Housing", "limit": 30000.0})
    assert post_res.status_code == 200


def test_csv_upload(client):
    csv_content = """Date,Description,Amount,Category
2026-03-01,Tech Salary,80000,Income
2026-03-05,Apartment Rent,25000,Housing
2026-03-10,Grocery Store,4500,Food and Dining
"""
    data = {
        "file": (io.BytesIO(csv_content.encode("utf-8")), "march_spend.csv")
    }
    res = client.post("/api/upload", data=data, content_type="multipart/form-data")
    assert res.status_code == 200
    resp_data = res.get_json()
    assert resp_data["success"] is True
    assert resp_data["records_count"] == 3
    assert resp_data["is_demo_mode"] is False

    # Check status changed
    status_res = client.get("/api/status")
    assert status_res.get_json()["is_demo_mode"] is False
    assert status_res.get_json()["records_count"] == 3


def test_export_transactions_csv(client):
    res = client.get("/api/reports/export/transactions")
    assert res.status_code == 200
    assert "text/csv" in res.content_type
    assert b"ID,Date,Description,Category,Type,Amount" in res.data
