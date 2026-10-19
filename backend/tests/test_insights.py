"""
Unit tests for SpendSense Statistical Insights & Anomaly Detection Engine
"""

import pytest
from services.insights import (
    detect_outliers_iqr,
    detect_recurring_subscriptions,
    generate_spending_insights,
)
from services.analytics import compute_monthly_analytics, compute_category_analytics


def test_detect_outliers_iqr():
    # Construct expenses where 1 transaction is a prominent statistical outlier
    records = [
        {"id": "1", "date": "2026-01-01", "description": "Coffee", "amount": 10.0, "type": "Expense"},
        {"id": "2", "date": "2026-01-02", "description": "Lunch", "amount": 15.0, "type": "Expense"},
        {"id": "3", "date": "2026-01-03", "description": "Groceries", "amount": 20.0, "type": "Expense"},
        {"id": "4", "date": "2026-01-04", "description": "Dinner", "amount": 25.0, "type": "Expense"},
        {"id": "5", "date": "2026-01-05", "description": "Snacks", "amount": 12.0, "type": "Expense"},
        {"id": "6", "date": "2026-01-06", "description": "Book", "amount": 18.0, "type": "Expense"},
        {"id": "7", "date": "2026-01-07", "description": "Laptop Emergency Repair", "amount": 850.0, "type": "Expense"},
    ]

    result = detect_outliers_iqr(records)
    assert len(result["outliers"]) == 1
    outlier = result["outliers"][0]
    assert outlier["description"] == "Laptop Emergency Repair"
    assert outlier["amount"] == 850.0
    assert result["threshold"] < 850.0
    assert result["iqr"] > 0


def test_detect_recurring_subscriptions():
    records = [
        {"id": "1", "date": "2026-01-10", "description": "Netflix Subscription", "amount": 19.99, "type": "Expense", "category": "Subscriptions"},
        {"id": "2", "date": "2026-02-10", "description": "Netflix Subscription", "amount": 19.99, "type": "Expense", "category": "Subscriptions"},
        {"id": "3", "date": "2026-03-10", "description": "Netflix Subscription", "amount": 19.99, "type": "Expense", "category": "Subscriptions"},
        {"id": "4", "date": "2026-01-15", "description": "One-time dinner", "amount": 45.0, "type": "Expense", "category": "Food and Dining"},
    ]

    recurring = detect_recurring_subscriptions(records)
    assert len(recurring) == 1
    sub = recurring[0]
    assert "netflix" in sub["merchant"].lower()
    assert sub["frequency_months"] == 3
    assert sub["average_amount"] == 19.99
    # Annualized = 19.99 * 12 = 239.88
    assert sub["annualized_cost"] == 239.88


def test_generate_spending_insights():
    records = [
        {"id": "1", "date": "2026-01-01", "description": "Salary", "amount": 10000.0, "type": "Income", "category": "Income"},
        {"id": "2", "date": "2026-01-05", "description": "Rent", "amount": 3000.0, "type": "Expense", "category": "Housing"},
        {"id": "3", "date": "2026-01-15", "description": "Grocery", "amount": 1000.0, "type": "Expense", "category": "Food and Dining"},
    ]
    monthly = compute_monthly_analytics(records)
    categories = compute_category_analytics(records)

    insights = generate_spending_insights(records, monthly, categories)
    assert len(insights) > 0
    # One of the insights should reflect the strong savings rate
    savings_insight = next((i for i in insights if "savings" in i["id"].lower() or "retention" in i["title"].lower()), None)
    assert savings_insight is not None
    assert "calculation" in savings_insight
