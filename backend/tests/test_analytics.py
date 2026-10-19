"""
Unit tests for SpendSense Analytics Engine
"""

import pytest
from services.analytics import (
    compute_summary_metrics,
    compute_monthly_analytics,
    compute_category_analytics,
    compute_daily_timeline,
)


@pytest.fixture
def mock_transactions():
    return [
        {"id": "1", "date": "2026-01-01", "description": "Salary", "amount": 10000.0, "type": "Income", "category": "Income"},
        {"id": "2", "date": "2026-01-05", "description": "Rent", "amount": 3000.0, "type": "Expense", "category": "Housing"},
        {"id": "3", "date": "2026-01-15", "description": "Grocery", "amount": 1000.0, "type": "Expense", "category": "Food and Dining"},
        {"id": "4", "date": "2026-02-01", "description": "Salary", "amount": 10000.0, "type": "Income", "category": "Income"},
        {"id": "5", "date": "2026-02-05", "description": "Rent", "amount": 3000.0, "type": "Expense", "category": "Housing"},
        {"id": "6", "date": "2026-02-18", "description": "Dinner", "amount": 2000.0, "type": "Expense", "category": "Food and Dining"},
    ]


def test_compute_summary_metrics(mock_transactions):
    metrics = compute_summary_metrics(mock_transactions)
    assert metrics["total_income"] == 20000.0
    assert metrics["total_expenses"] == 9000.0
    assert metrics["net_cash_flow"] == 11000.0
    # Savings rate: 11000 / 20000 = 55.0%
    assert metrics["savings_rate"] == 55.0
    assert metrics["transaction_count"] == 6
    # 4 expense transactions: 3000, 1000, 3000, 2000 -> avg = 2250.0
    assert metrics["average_transaction_amount"] == 2250.0


def test_compute_monthly_analytics(mock_transactions):
    monthly = compute_monthly_analytics(mock_transactions)
    assert len(monthly) == 2

    jan = monthly[0]
    assert jan["month"] == "2026-01"
    assert jan["income"] == 10000.0
    assert jan["expenses"] == 4000.0
    assert jan["net"] == 6000.0
    assert jan["mom_expense_change_pct"] is None

    feb = monthly[1]
    assert feb["month"] == "2026-02"
    assert feb["income"] == 10000.0
    assert feb["expenses"] == 5000.0
    assert feb["net"] == 5000.0
    # MoM change: (5000 - 4000) / 4000 = +25.0%
    assert feb["mom_expense_change_pct"] == 25.0


def test_compute_category_analytics(mock_transactions):
    categories = compute_category_analytics(mock_transactions)
    assert len(categories) == 2

    housing = next(c for c in categories if c["category"] == "Housing")
    assert housing["total_amount"] == 6000.0
    assert housing["transaction_count"] == 2
    # Total expenses = 9000; Housing share = 6000/9000 = 66.67%
    assert housing["percentage"] == 66.67

    food = next(c for c in categories if c["category"] == "Food and Dining")
    assert food["total_amount"] == 3000.0
    assert food["percentage"] == 33.33


def test_compute_daily_timeline(mock_transactions):
    daily = compute_daily_timeline(mock_transactions)
    assert len(daily) == 4
    dates = [d["date"] for d in daily]
    assert "2026-01-05" in dates
    assert "2026-02-18" in dates
