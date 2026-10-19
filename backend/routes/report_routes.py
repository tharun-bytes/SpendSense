"""
Financial Reporting & Export API Routes
Generates clean transaction exports and formatted executive summary reports.
"""

from datetime import datetime
from flask import Blueprint, Response, jsonify
from services.report_generator import (
    generate_transactions_csv,
    generate_financial_summary_csv,
)
from services.analytics import (
    compute_summary_metrics,
    compute_monthly_analytics,
    compute_category_analytics,
)
from store import store

report_bp = Blueprint("reports", __name__)


@report_bp.route("/api/reports/export/transactions", methods=["GET"])
def export_transactions_csv():
    """Download cleaned and normalized transactions as CSV."""
    csv_text = generate_transactions_csv(store.transactions)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"spendsense_cleaned_transactions_{timestamp}.csv"

    return Response(
        csv_text,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@report_bp.route("/api/reports/export/summary", methods=["GET"])
def export_financial_summary_csv():
    """Download executive financial overview report as CSV."""
    summary_metrics = compute_summary_metrics(store.transactions)
    monthly_analytics = compute_monthly_analytics(store.transactions)
    category_analytics = compute_category_analytics(store.transactions)

    csv_text = generate_financial_summary_csv(
        summary_metrics,
        monthly_analytics,
        category_analytics
    )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"spendsense_executive_report_{timestamp}.csv"

    return Response(
        csv_text,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@report_bp.route("/api/reports/data", methods=["GET"])
def get_report_data():
    """Returns combined report data for in-browser printable view."""
    summary_metrics = compute_summary_metrics(store.transactions)
    monthly_analytics = compute_monthly_analytics(store.transactions)
    category_analytics = compute_category_analytics(store.transactions)

    return jsonify({
        "metrics": summary_metrics,
        "monthly": monthly_analytics,
        "categories": category_analytics,
        "is_demo_mode": store.is_demo_mode,
        "generated_at": datetime.now().isoformat(),
    })
