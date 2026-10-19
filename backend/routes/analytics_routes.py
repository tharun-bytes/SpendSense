"""
Analytics & Aggregation API Routes
Returns computed metrics, monthly time-series, category allocations, and daily spending velocity.
"""

from flask import Blueprint, jsonify, request
from services.analytics import (
    compute_summary_metrics,
    compute_monthly_analytics,
    compute_category_analytics,
    compute_daily_timeline,
)
from store import store

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/api/summary", methods=["GET"])
def get_summary():
    """Returns top-level executive metrics calculated from current records."""
    metrics = compute_summary_metrics(store.transactions)
    return jsonify({
        "metrics": metrics,
        "is_demo_mode": store.is_demo_mode,
        "source_filename": store.source_filename,
    })


@analytics_bp.route("/api/analytics/monthly", methods=["GET"])
def get_monthly_analytics():
    """Returns monthly income, expense, net savings, and MoM change trends."""
    monthly_data = compute_monthly_analytics(store.transactions)
    return jsonify({
        "monthly": monthly_data,
        "is_demo_mode": store.is_demo_mode,
    })


@analytics_bp.route("/api/analytics/categories", methods=["GET"])
def get_category_analytics():
    """Returns expense breakdown by category with percentage distribution."""
    categories_data = compute_category_analytics(store.transactions)
    return jsonify({
        "categories": categories_data,
        "is_demo_mode": store.is_demo_mode,
    })


@analytics_bp.route("/api/analytics/daily", methods=["GET"])
def get_daily_analytics():
    """Returns day-by-day expense timeline for velocity tracking."""
    daily_data = compute_daily_timeline(store.transactions)
    return jsonify({
        "daily": daily_data,
        "is_demo_mode": store.is_demo_mode,
    })
