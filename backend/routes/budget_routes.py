"""
Budget Management API Routes
Compares configured spending thresholds against actual expenses for current/latest period.
Budget limits are persistently stored in SQLite.
"""

from typing import Dict
from flask import Blueprint, jsonify, request
from store import store

budget_bp = Blueprint("budgets", __name__)


@budget_bp.route("/api/budgets", methods=["GET"])
def get_budgets():
    """Retrieve all budget allocations compared with actual spend."""
    budget_data = store.get_budgets_with_actuals()
    budgets_dict = store.budgets
    total_budget = sum(budgets_dict.values())
    total_spent = sum(item["spent"] for item in budget_data)
    total_remaining = total_budget - total_spent

    return jsonify({
        "budgets": budget_data,
        "summary": {
            "total_budget": round(total_budget, 2),
            "total_spent": round(total_spent, 2),
            "total_remaining": round(total_remaining, 2),
            "overall_utilization_pct": round((total_spent / total_budget * 100), 1) if total_budget > 0 else 0.0,
            "over_budget_count": sum(1 for item in budget_data if item["status"] == "exceeded"),
            "warning_count": sum(1 for item in budget_data if item["status"] == "warning"),
        },
        "is_demo_mode": store.is_demo_mode,
    })


@budget_bp.route("/api/budgets", methods=["POST", "PUT"])
def update_budgets():
    """Update budget limits for one or multiple categories."""
    data = request.get_json(silent=True) or {}

    if "budgets" in data and isinstance(data["budgets"], dict):
        for cat, limit in data["budgets"].items():
            try:
                store.update_budget(cat, float(limit))
            except (ValueError, TypeError):
                continue
    elif "category" in data and "limit" in data:
        cat = data["category"]
        try:
            store.update_budget(cat, float(data["limit"]))
        except (ValueError, TypeError):
            return jsonify({"error": "Limit must be a valid number."}), 400
    else:
        return jsonify({"error": "Payload must include 'budgets' map or 'category' and 'limit'."}), 400

    return jsonify({
        "success": True,
        "message": "Budget allocations updated successfully.",
        "budgets": store.get_budgets_with_actuals(),
    })
