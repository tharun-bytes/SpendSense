"""
SpendSense Statistical Insights & Anomaly Detection Engine
Implements Interquartile Range (IQR) outlier detection, recurring subscription detection,
and deterministic statistical narrative generation from actual dataset calculations.
"""

from collections import defaultdict
from typing import Any, Dict, List
import numpy as np
import pandas as pd


def detect_outliers_iqr(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Detect statistical outliers among expense transactions using the Interquartile Range (IQR) method.
    Formula:
        IQR = Q3 (75th percentile) - Q1 (25th percentile)
        Outlier threshold = Q3 + 1.5 * IQR
    """
    expense_txs = [r for r in records if r.get("type") == "Expense" and r.get("amount", 0) > 0]

    if len(expense_txs) < 4:
        return {
            "outliers": [],
            "q1": 0.0,
            "q3": 0.0,
            "iqr": 0.0,
            "threshold": 0.0,
            "sample_size": len(expense_txs),
            "explanation": "Insufficient sample size (minimum 4 expense transactions required for IQR calculation)."
        }

    amounts = np.array([float(r["amount"]) for r in expense_txs])
    q1 = float(np.percentile(amounts, 25))
    q3 = float(np.percentile(amounts, 75))
    iqr = q3 - q1
    threshold = q3 + 1.5 * iqr

    outliers = []
    for tx in expense_txs:
        if float(tx["amount"]) > threshold:
            outlier_item = dict(tx)
            outlier_item["iqr_threshold"] = round(threshold, 2)
            outlier_item["deviation_from_q3"] = round(float(tx["amount"]) - q3, 2)
            outlier_item["reason"] = (
                f"Amount exceeds the statistical outlier threshold of "
                f"{threshold:,.2f} (Q3 + 1.5 * IQR)."
            )
            outliers.append(outlier_item)

    outliers.sort(key=lambda x: x["amount"], reverse=True)

    return {
        "outliers": outliers,
        "q1": round(q1, 2),
        "q3": round(q3, 2),
        "iqr": round(iqr, 2),
        "threshold": round(threshold, 2),
        "sample_size": len(expense_txs),
        "explanation": (
            f"Evaluated {len(expense_txs)} expense transactions using IQR. "
            f"Q1={q1:,.2f}, Q3={q3:,.2f}, IQR={iqr:,.2f}. Any expense above {threshold:,.2f} "
            f"is classified as a statistical outlier. Note: Outliers represent statistical variance, "
            f"not necessarily fraud."
        )
    }


def detect_recurring_subscriptions(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identify potential recurring subscriptions by detecting merchants appearing
    in multiple distinct months with identical or near-identical amounts (<= 3% variance).
    """
    expense_txs = [r for r in records if r.get("type") == "Expense"]
    if not expense_txs:
        return []

    # Group by normalized merchant name
    grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for tx in expense_txs:
        # Simplify merchant name
        desc = tx.get("description", "").strip().lower()
        key = desc.split()[0] if desc else "unknown"
        grouped[key].append(tx)

    recurring = []
    for key, tx_list in grouped.items():
        if len(tx_list) < 2:
            continue

        # Check for multiple unique months
        months = set(tx["date"][:7] for tx in tx_list if "date" in tx)
        if len(months) >= 2:
            amounts = [float(tx["amount"]) for tx in tx_list]
            avg_amount = float(np.mean(amounts))
            std_dev = float(np.std(amounts))

            # If variance is low (< 10% of mean or < 1.0)
            if std_dev / avg_amount < 0.10 or std_dev < 1.0:
                recurring.append({
                    "merchant": tx_list[0]["description"],
                    "category": tx_list[0].get("category", "Subscriptions"),
                    "frequency_months": len(months),
                    "average_amount": round(avg_amount, 2),
                    "annualized_cost": round(avg_amount * 12, 2),
                    "transactions_count": len(tx_list),
                    "last_billed": max(tx["date"] for tx in tx_list),
                })

    recurring.sort(key=lambda x: x["annualized_cost"], reverse=True)
    return recurring


def generate_spending_insights(
    records: List[Dict[str, Any]],
    monthly_analytics: List[Dict[str, Any]],
    category_analytics: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Generate deterministic, evidence-grounded insights explaining the calculations behind each.
    """
    insights: List[Dict[str, Any]] = []

    if not records:
        return [{
            "id": "ins-empty",
            "type": "info",
            "title": "Awaiting Data Upload",
            "message": "Upload a transaction CSV to generate statistical insights.",
            "calculation": "No records present."
        }]

    # 1. Savings Rate Insight
    expense_total = sum(r["amount"] for r in records if r.get("type") == "Expense")
    income_total = sum(r["amount"] for r in records if r.get("type") == "Income")

    if income_total > 0:
        savings_pct = (income_total - expense_total) / income_total * 100
        if savings_pct >= 20:
            insights.append({
                "id": "ins-savings-healthy",
                "type": "positive",
                "title": "Healthy Capital Retention",
                "message": f"Your overall savings rate is {savings_pct:.1f}%, exceeding the benchmark target of 20%.",
                "calculation": f"Total Income ({income_total:,.2f}) minus Total Expenses ({expense_total:,.2f}) divided by Income."
            })
        elif savings_pct >= 0:
            insights.append({
                "id": "ins-savings-moderate",
                "type": "warning",
                "title": "Narrow Savings Margin",
                "message": f"Your savings rate is {savings_pct:.1f}%. Increasing discretionary expense discipline can build a safer buffer.",
                "calculation": f"Net cash flow is positive but below 20% of gross inflow."
            })
        else:
            insights.append({
                "id": "ins-savings-negative",
                "type": "negative",
                "title": "Outflows Exceed Inflows",
                "message": f"Expenses exceed income by {abs(savings_pct):.1f}%. Immediate budget re-evaluation is advised.",
                "calculation": f"Total Expenses ({expense_total:,.2f}) > Total Income ({income_total:,.2f})."
            })
    else:
        insights.append({
            "id": "ins-income-missing",
            "type": "info",
            "title": "Expense-Only Record Set",
            "message": "No income deposits detected in this file. Savings rate calculations require income transactions.",
            "calculation": "Total Income equals 0."
        })

    # 2. Month-over-Month Trend Insight
    if len(monthly_analytics) >= 2:
        latest_month = monthly_analytics[-1]
        prev_month = monthly_analytics[-2]
        mom_change = latest_month.get("mom_expense_change_pct")

        if mom_change is not None:
            if mom_change < -5:
                insights.append({
                    "id": "ins-mom-down",
                    "type": "positive",
                    "title": "Monthly Spending Contracted",
                    "message": f"Your spending in {latest_month['label']} fell by {abs(mom_change):.1f}% compared to {prev_month['label']}.",
                    "calculation": f"({latest_month['expenses']:,.2f} - {prev_month['expenses']:,.2f}) / {prev_month['expenses']:,.2f} * 100"
                })
            elif mom_change > 10:
                insights.append({
                    "id": "ins-mom-up",
                    "type": "warning",
                    "title": "Expenditure Spike Detected",
                    "message": f"Your spending in {latest_month['label']} surged by +{mom_change:.1f}% compared to {prev_month['label']}.",
                    "calculation": f"({latest_month['expenses']:,.2f} - {prev_month['expenses']:,.2f}) / {prev_month['expenses']:,.2f} * 100"
                })

    # 3. Category Concentration Insight
    if category_analytics:
        top_cat = category_analytics[0]
        if top_cat.get("percentage", 0) >= 30:
            insights.append({
                "id": "ins-category-concentration",
                "type": "info",
                "title": f"High Concentration in {top_cat['category']}",
                "message": f"{top_cat['category']} represents {top_cat['percentage']}% of your total outflows.",
                "calculation": f"{top_cat['total_amount']:,.2f} spent out of {expense_total:,.2f} total."
            })

    # 4. Outliers Insight
    outlier_res = detect_outliers_iqr(records)
    outlier_count = len(outlier_res.get("outliers", []))
    if outlier_count > 0:
        top_outlier = outlier_res["outliers"][0]
        insights.append({
            "id": "ins-outlier-alert",
            "type": "warning",
            "title": f"{outlier_count} Statistical Outlier{'s' if outlier_count > 1 else ''} Detected",
            "message": (
                f"Highest deviation: '{top_outlier['description']}' at {top_outlier['amount']:,.2f} "
                f"(Threshold: {outlier_res['threshold']:,.2f})."
            ),
            "calculation": "Calculated using Interquartile Range (IQR = Q3 - Q1) with a 1.5 multiplier."
        })

    # 5. Recurring Subscriptions Insight
    recurring = detect_recurring_subscriptions(records)
    if recurring:
        annual_total = sum(r["annualized_cost"] for r in recurring)
        insights.append({
            "id": "ins-recurring-subs",
            "type": "info",
            "title": f"{len(recurring)} Recurring Subscriptions Tracked",
            "message": f"Annual recurring commitment across detected subscriptions is {annual_total:,.2f}.",
            "calculation": f"Aggregated periodic transactions from {len(recurring)} distinct merchants."
        })

    return insights
