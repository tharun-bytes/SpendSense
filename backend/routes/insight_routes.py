"""
Statistical Insights & Anomaly Detection Routes
Provides IQR outlier analysis, recurring subscription identification, and deterministic insights.
"""

from flask import Blueprint, jsonify
from services.insights import (
    detect_outliers_iqr,
    detect_recurring_subscriptions,
    generate_spending_insights,
)
from services.analytics import compute_monthly_analytics, compute_category_analytics
from store import store

insight_bp = Blueprint("insights", __name__)


@insight_bp.route("/api/insights", methods=["GET"])
def get_all_insights():
    """
    Returns full suite of statistical insights:
    - IQR Outliers & threshold explanation
    - Recurring subscriptions & annual projections
    - Evidence-grounded financial observations
    """
    outliers_data = detect_outliers_iqr(store.transactions)
    recurring_data = detect_recurring_subscriptions(store.transactions)
    monthly_data = compute_monthly_analytics(store.transactions)
    category_data = compute_category_analytics(store.transactions)

    narratives = generate_spending_insights(
        store.transactions,
        monthly_data,
        category_data
    )

    return jsonify({
        "outliers": outliers_data,
        "recurring_subscriptions": recurring_data,
        "narratives": narratives,
        "is_demo_mode": store.is_demo_mode,
        "statistical_notes": {
            "methodology": "Interquartile Range (IQR = Q3 - Q1), Upper Threshold = Q3 + 1.5 * IQR",
            "recurrence_criteria": "Identical or near-identical amounts (std dev < 10% or < 1.0) spanning >= 2 calendar months",
        }
    })


@insight_bp.route("/api/insights/outliers", methods=["GET"])
def get_outliers():
    """Specific endpoint for IQR outliers."""
    outliers_data = detect_outliers_iqr(store.transactions)
    return jsonify({
        "outliers": outliers_data,
        "is_demo_mode": store.is_demo_mode,
    })


@insight_bp.route("/api/insights/recurring", methods=["GET"])
def get_recurring():
    """Specific endpoint for recurring subscriptions."""
    recurring_data = detect_recurring_subscriptions(store.transactions)
    return jsonify({
        "recurring_subscriptions": recurring_data,
        "is_demo_mode": store.is_demo_mode,
    })
