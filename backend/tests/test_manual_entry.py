from datetime import datetime
import json
import pytest
from app import create_app
from store import store
import database as db


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        # Reset to sample data before each test
        store.load_sample_data()
        yield client


def test_add_manual_expense(client):
    """Test creating a manual expense transaction."""
    payload = {
        "date": "2026-10-15",
        "description": "Artisan Coffee House",
        "amount": 420.50,
        "type": "Expense",
        "category": "Food and Dining",
        "payment_method": "Credit Card",
        "notes": "Client meeting",
        "keep_demo": True
    }
    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    tx = data["transaction"]
    assert tx["description"] == "Artisan Coffee House"
    assert tx["amount"] == 420.50
    assert tx["type"] == "Expense"
    assert tx["category"] == "Food and Dining"
    assert tx["payment_method"] == "Credit Card"
    assert tx["notes"] == "Client meeting"
    assert "id" in tx
    assert "created_at" in tx


def test_add_manual_income(client):
    """Test creating a manual income transaction."""
    payload = {
        "date": "2026-10-01",
        "description": "Freelance UI Consultation",
        "amount": 35000.0,
        "type": "Income",
        "category": "Freelance",
        "payment_method": "UPI",
        "notes": "Invoice #402",
        "keep_demo": True
    }
    res = client.post("/api/transactions", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    tx = data["transaction"]
    assert tx["type"] == "Income"
    assert tx["amount"] == 35000.0


def test_add_transaction_validation_errors(client):
    """Test rejection of invalid inputs."""
    # Negative amount
    res1 = client.post("/api/transactions", json={
        "date": "2026-10-15",
        "description": "Invalid Negative",
        "amount": -50.0,
        "type": "Expense"
    })
    assert res1.status_code == 400
    assert "positive number" in res1.get_json()["errors"][0]

    # Invalid date format
    res2 = client.post("/api/transactions", json={
        "date": "15/10/2026",
        "description": "Invalid Date",
        "amount": 100.0,
        "type": "Expense"
    })
    assert res2.status_code == 400
    assert "YYYY-MM-DD" in res2.get_json()["errors"][0]

    # Empty description
    res3 = client.post("/api/transactions", json={
        "date": "2026-10-15",
        "description": "   ",
        "amount": 100.0,
        "type": "Expense"
    })
    assert res3.status_code == 400
    assert "Description" in res3.get_json()["errors"][0]


def test_edit_transaction(client):
    """Test editing an existing transaction."""
    # Create a transaction
    add_res = client.post("/api/transactions", json={
        "date": "2026-10-10",
        "description": "Original Cafe",
        "amount": 200.0,
        "type": "Expense",
        "category": "Food and Dining",
        "keep_demo": True
    })
    tx_id = add_res.get_json()["transaction"]["id"]

    # Edit it
    put_res = client.put(f"/api/transactions/{tx_id}", json={
        "description": "Updated Bistro",
        "amount": 250.0,
        "category": "Food and Dining",
        "notes": "Added dessert"
    })
    assert put_res.status_code == 200
    updated_tx = put_res.get_json()["transaction"]
    assert updated_tx["description"] == "Updated Bistro"
    assert updated_tx["amount"] == 250.0
    assert updated_tx["notes"] == "Added dessert"


def test_delete_transaction(client):
    """Test deleting a transaction."""
    add_res = client.post("/api/transactions", json={
        "date": "2026-10-10",
        "description": "To Be Deleted",
        "amount": 99.0,
        "type": "Expense",
        "keep_demo": True
    })
    tx_id = add_res.get_json()["transaction"]["id"]

    del_res = client.delete(f"/api/transactions/{tx_id}")
    assert del_res.status_code == 200

    # Ensure it no longer exists
    get_res = client.get(f"/api/transactions?search=To+Be+Deleted")
    assert get_res.get_json()["pagination"]["total_count"] == 0


def test_bulk_add_transactions(client):
    """Test bulk manual entry endpoint with row validations."""
    payload = {
        "transactions": [
            {
                "date": "2026-10-01",
                "description": "Bulk Item 1 - Grocery",
                "amount": 1500.0,
                "type": "Expense",
                "category": "Food and Dining"
            },
            {
                "date": "2026-10-02",
                "description": "Bulk Item 2 - Salary",
                "amount": 75000.0,
                "type": "Income",
                "category": "Salary"
            },
            {
                "date": "invalid-date",
                "description": "Bulk Item 3 - Invalid",
                "amount": -50.0,
                "type": "Expense"
            }
        ],
        "keep_demo": True
    }
    res = client.post("/api/transactions/bulk", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["saved_count"] == 2
    assert data["rejected_count"] == 1
    assert len(data["errors"]) == 1
    assert data["errors"][0]["row"] == 3


def test_clear_and_empty_state(client):
    """Test clearing all records and verifying the resulting empty state."""
    res = client.post("/api/transactions/clear")
    assert res.status_code == 200
    assert res.get_json()["records_count"] == 0

    # Verify summary metrics handle 0 transactions
    sum_res = client.get("/api/summary")
    assert sum_res.status_code == 200
    metrics = sum_res.get_json()["metrics"]
    assert metrics["transaction_count"] == 0
    assert metrics["total_income"] == 0.0
    assert metrics["total_expenses"] == 0.0

    # Verify transactions query handles 0 transactions
    tx_res = client.get("/api/transactions")
    assert tx_res.status_code == 200
    assert tx_res.get_json()["pagination"]["total_count"] == 0


def test_sqlite_persistence_across_reloads():
    """Verify that records saved in SQLite persist directly in database without in-memory state."""
    # Write a test record directly via db
    test_id = f"test-persisted-{int(datetime.now().timestamp())}"
    db.insert_transaction({
        "id": test_id,
        "date": "2026-10-20",
        "description": "Persistence Guarantee Check",
        "amount": 999.0,
        "type": "Expense",
        "category": "Other",
        "is_demo": 0
    })

    # Retrieve fresh from DB
    retrieved = db.get_transaction_by_id(test_id)
    assert retrieved is not None
    assert retrieved["description"] == "Persistence Guarantee Check"
    assert retrieved["amount"] == 999.0

    # Clean up test record
    db.delete_transaction(test_id)
