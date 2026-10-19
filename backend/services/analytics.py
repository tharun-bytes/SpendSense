"""
SpendSense Analytics & Aggregation Engine
Computes executive financial metrics, monthly cash flows, category allocations,
and statistical time-series aggregations from normalized records.
"""

from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List, Optional
import pandas as pd
import numpy as np


def compute_summary_metrics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate core executive metrics from transactions."""
    if not records:
        return {
            "total_income": 0.0,
            "total_expenses": 0.0,
            "net_cash_flow": 0.0,
            "savings_rate": 0.0,
            "transaction_count": 0,
            "average_transaction_amount": 0.0,
            "average_daily_spend": 0.0,
            "active_days_count": 0,
            "start_date": None,
            "end_date": None,
        }

    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    income_mask = df["type"] == "Income"
    expense_mask = df["type"] == "Expense"

    total_income = float(df[income_mask]["amount"].sum()) if income_mask.any() else 0.0
    total_expenses = float(df[expense_mask]["amount"].sum()) if expense_mask.any() else 0.0

    net_cash_flow = total_income - total_expenses
    savings_rate = (net_cash_flow / total_income * 100) if total_income > 0 else 0.0

    # Date range calculations
    valid_dates = df["date"].dropna()
    start_date = valid_dates.min().strftime("%Y-%m-%d") if not valid_dates.empty else None
    end_date = valid_dates.max().strftime("%Y-%m-%d") if not valid_dates.empty else None

    # Days count
    if start_date and end_date:
        d1 = datetime.strptime(start_date, "%Y-%m-%d")
        d2 = datetime.strptime(end_date, "%Y-%m-%d")
        total_days = max((d2 - d1).days + 1, 1)
    else:
        total_days = 1

    expense_txs = df[expense_mask]
    avg_tx = float(expense_txs["amount"].mean()) if not expense_txs.empty else 0.0
    avg_daily = total_expenses / total_days

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_cash_flow": round(net_cash_flow, 2),
        "savings_rate": round(savings_rate, 2),
        "transaction_count": len(records),
        "average_transaction_amount": round(avg_tx, 2),
        "average_daily_spend": round(avg_daily, 2),
        "active_days_count": total_days,
        "start_date": start_date,
        "end_date": end_date,
    }


def compute_monthly_analytics(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Aggregate income, expenses, and Month-over-Month change by month (YYYY-MM)."""
    if not records:
        return []

    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["month"] = df["date"].dt.strftime("%Y-%m")

    grouped: Dict[str, Dict[str, float]] = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})

    for _, row in df.iterrows():
        m = row["month"]
        if pd.isna(m):
            continue
        amt = float(row["amount"])
        if row["type"] == "Income":
            grouped[m]["income"] += amt
        elif row["type"] == "Expense":
            grouped[m]["expenses"] += amt

    # Sort chronologically
    sorted_months = sorted(grouped.keys())
    result = []
    prev_expenses: Optional[float] = None

    for m in sorted_months:
        inc = round(grouped[m]["income"], 2)
        exp = round(grouped[m]["expenses"], 2)
        net = round(inc - exp, 2)
        savings_pct = round((net / inc * 100), 2) if inc > 0 else 0.0

        # MoM Expense Change
        if prev_expenses is not None and prev_expenses > 0:
            mom_pct = round(((exp - prev_expenses) / prev_expenses * 100), 2)
        else:
            mom_pct = None

        result.append({
            "month": m,
            "label": datetime.strptime(m, "%Y-%m").strftime("%b %Y"),
            "income": inc,
            "expenses": exp,
            "net": net,
            "savings_rate": savings_pct,
            "mom_expense_change_pct": mom_pct,
        })
        prev_expenses = exp

    return result


def compute_category_analytics(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Aggregate expense breakdown by category with share percentage."""
    if not records:
        return []

    df = pd.DataFrame(records)
    expense_df = df[df["type"] == "Expense"]
    if expense_df.empty:
        return []

    total_expenses = float(expense_df["amount"].sum())
    grouped = expense_df.groupby("category").agg(
        total_amount=("amount", "sum"),
        transaction_count=("amount", "count"),
        average_amount=("amount", "mean")
    ).reset_index()

    grouped["total_amount"] = grouped["total_amount"].round(2)
    grouped["average_amount"] = grouped["average_amount"].round(2)
    grouped["percentage"] = ((grouped["total_amount"] / total_expenses) * 100).round(2) if total_expenses > 0 else 0.0

    # Sort by highest spending category
    grouped = grouped.sort_values(by="total_amount", ascending=False)
    return grouped.to_dict(orient="records")


def compute_daily_timeline(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Aggregate spending by individual day for trendline visualization."""
    if not records:
        return []

    df = pd.DataFrame(records)
    expense_df = df[df["type"] == "Expense"]
    if expense_df.empty:
        return []

    daily = expense_df.groupby("date")["amount"].sum().reset_index()
    daily["amount"] = daily["amount"].round(2)
    daily = daily.sort_values(by="date")
    return daily.to_dict(orient="records")
