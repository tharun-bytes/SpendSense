"""
SpendSense Report Generator Service
Builds downloadable CSV summaries and formatted datasets.
"""

import io
import csv
from typing import Any, Dict, List


def generate_transactions_csv(records: List[Dict[str, Any]]) -> str:
    """Generate clean CSV export of processed transactions."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "Date", "Description", "Category", "Type", "Amount"])
    for r in records:
        writer.writerow([
            r.get("id", ""),
            r.get("date", ""),
            r.get("description", ""),
            r.get("category", ""),
            r.get("type", ""),
            f"{float(r.get('amount', 0)):.2f}"
        ])

    return output.getvalue()


def generate_financial_summary_csv(
    summary_metrics: Dict[str, Any],
    monthly_analytics: List[Dict[str, Any]],
    category_analytics: List[Dict[str, Any]]
) -> str:
    """Generate executive summary report as CSV text."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["SPENDSENSE EXECUTIVE FINANCIAL REPORT"])
    writer.writerow([])
    writer.writerow(["EXECUTIVE METRICS"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Reporting Start Date", summary_metrics.get("start_date", "N/A")])
    writer.writerow(["Reporting End Date", summary_metrics.get("end_date", "N/A")])
    writer.writerow(["Total Income", f"{summary_metrics.get('total_income', 0):,.2f}"])
    writer.writerow(["Total Expenses", f"{summary_metrics.get('total_expenses', 0):,.2f}"])
    writer.writerow(["Net Cash Flow", f"{summary_metrics.get('net_cash_flow', 0):,.2f}"])
    writer.writerow(["Savings Rate (%)", f"{summary_metrics.get('savings_rate', 0):.2f}%"])
    writer.writerow(["Total Transactions", summary_metrics.get("transaction_count", 0)])
    writer.writerow(["Average Daily Spend", f"{summary_metrics.get('average_daily_spend', 0):,.2f}"])
    writer.writerow([])

    writer.writerow(["MONTHLY BREAKDOWN"])
    writer.writerow(["Month", "Income", "Expenses", "Net Savings", "Savings Rate (%)", "MoM Expense Change (%)"])
    for m in monthly_analytics:
        writer.writerow([
            m.get("label", m.get("month", "")),
            f"{m.get('income', 0):,.2f}",
            f"{m.get('expenses', 0):,.2f}",
            f"{m.get('net', 0):,.2f}",
            f"{m.get('savings_rate', 0):.2f}%",
            f"{m.get('mom_expense_change_pct', 'N/A')}"
        ])
    writer.writerow([])

    writer.writerow(["CATEGORY ALLOCATION"])
    writer.writerow(["Category", "Total Spent", "Share (%)", "Transaction Count", "Average Amount"])
    for c in category_analytics:
        writer.writerow([
            c.get("category", ""),
            f"{c.get('total_amount', 0):,.2f}",
            f"{c.get('percentage', 0):.2f}%",
            c.get("transaction_count", 0),
            f"{c.get('average_amount', 0):,.2f}"
        ])

    return output.getvalue()
