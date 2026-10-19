"""
SpendSense Data Cleaning & Normalization Engine
Parses arbitrary transaction CSVs, maps heterogeneous column headers,
cleans corrupted dates/amounts, eliminates duplicates, and returns structured records.
"""

import io
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

# Column Header Synonyms
DATE_SYNONYMS = ["date", "transaction_date", "tx_date", "posted_date", "booking_date", "trans_date", "time", "timestamp"]
DESC_SYNONYMS = ["description", "merchant", "payee", "narrative", "memo", "details", "transaction_details", "particulars", "name", "title"]
AMOUNT_SYNONYMS = ["amount", "transaction_amount", "value", "total", "net_amount", "sum"]
CATEGORY_SYNONYMS = ["category", "tag", "expense_type", "type_name", "sub_category"]
TYPE_SYNONYMS = ["type", "transaction_type", "cr_dr", "flow", "direction"]
DEBIT_SYNONYMS = ["debit", "withdrawal", "outflow", "dr", "expense_amount", "paid_out"]
CREDIT_SYNONYMS = ["credit", "deposit", "inflow", "cr", "income_amount", "paid_in"]


def detect_columns(columns: List[str]) -> Dict[str, Optional[str]]:
    """Identify mapping for required and optional fields from raw column names."""
    normalized = {re.sub(r"[^a-zA-Z0-9_]", "", c.strip().lower().replace(" ", "_")): c for c in columns}
    
    mapping: Dict[str, Optional[str]] = {
        "date": None,
        "description": None,
        "amount": None,
        "category": None,
        "type": None,
        "debit": None,
        "credit": None,
    }

    for syn in DATE_SYNONYMS:
        if syn in normalized:
            mapping["date"] = normalized[syn]
            break

    for syn in DESC_SYNONYMS:
        if syn in normalized:
            mapping["description"] = normalized[syn]
            break

    for syn in AMOUNT_SYNONYMS:
        if syn in normalized:
            mapping["amount"] = normalized[syn]
            break

    for syn in CATEGORY_SYNONYMS:
        if syn in normalized:
            mapping["category"] = normalized[syn]
            break

    for syn in TYPE_SYNONYMS:
        if syn in normalized:
            mapping["type"] = normalized[syn]
            break

    for syn in DEBIT_SYNONYMS:
        if syn in normalized:
            mapping["debit"] = normalized[syn]
            break

    for syn in CREDIT_SYNONYMS:
        if syn in normalized:
            mapping["credit"] = normalized[syn]
            break

    return mapping


def parse_flexible_date(val: Any) -> Optional[str]:
    """Parse various date formats into YYYY-MM-DD."""
    if pd.isna(val) or val is None:
        return None
    val_str = str(val).strip()
    if not val_str:
        return None

    # Try common formats
    formats = [
        "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%m-%d-%Y",
        "%Y/%m/%d", "%d.%m.%Y", "%d %b %Y", "%d %B %Y", "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S", "%b %d, %Y", "%B %d, %Y"
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(val_str, fmt)
            return dt.strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            continue

    # Fallback to dateutil / pandas
    try:
        dt = pd.to_datetime(val_str, errors="coerce")
        if pd.notna(dt):
            return dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    return None


def clean_amount_value(val: Any) -> Optional[float]:
    """Extract clean float value from amount strings ($1,234.50, INR 500, (40), etc.)."""
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)

    s = str(val).strip()
    if not s:
        return None

    is_negative = False
    if s.startswith("(") and s.endswith(")"):
        is_negative = True
        s = s[1:-1]
    elif s.startswith("-"):
        is_negative = True
        s = s[1:]
    elif s.endswith("-"):
        is_negative = True
        s = s[:-1]

    # Remove currency symbols and formatting commas
    cleaned = re.sub(r"[^\d.]", "", s)
    if not cleaned:
        return None

    try:
        num = float(cleaned)
        return -num if is_negative else num
    except ValueError:
        return None


def clean_and_normalize_csv(
    file_content: str,
    custom_mapping: Optional[Dict[str, str]] = None
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Main cleaning routine. Takes raw CSV text, returns normalized records + audit summary.
    """
    summary: Dict[str, Any] = {
        "total_rows": 0,
        "valid_rows": 0,
        "excluded_rows": 0,
        "duplicates_removed": 0,
        "warnings": [],
        "column_mapping": {},
    }

    try:
        df = pd.read_csv(io.StringIO(file_content))
    except Exception as e:
        summary["warnings"].append(f"CSV Parse error: {str(e)}")
        return [], summary

    summary["total_rows"] = len(df)
    if df.empty:
        summary["warnings"].append("Uploaded file contains zero records.")
        return [], summary

    # Determine column mapping
    mapping = detect_columns(list(df.columns))
    if custom_mapping:
        mapping.update(custom_mapping)

    summary["column_mapping"] = {k: v for k, v in mapping.items() if v is not None}

    # Verify minimum required columns (date and either description or amount)
    if not mapping["date"]:
        summary["warnings"].append("Could not detect Date column. Please map date column manually.")
        return [], summary

    has_amount = mapping["amount"] or (mapping["debit"] and mapping["credit"])
    if not has_amount:
        summary["warnings"].append("Could not detect Amount, Debit or Credit columns.")
        return [], summary

    valid_records: List[Dict[str, Any]] = []
    seen_fingerprints = set()

    for idx, row in df.iterrows():
        # Parse Date
        raw_date = row.get(mapping["date"])
        parsed_date = parse_flexible_date(raw_date)
        if not parsed_date:
            summary["excluded_rows"] += 1
            continue

        # Parse Description
        desc_col = mapping["description"]
        desc = str(row.get(desc_col, "Unknown Transaction")).strip() if desc_col else "Unknown Transaction"
        if not desc or desc.lower() in ["nan", "none", "null"]:
            desc = "Unspecified Transaction"

        # Parse Amount and Direction
        amount = 0.0
        tx_type = "Expense"

        if mapping["debit"] and mapping["credit"]:
            raw_debit = clean_amount_value(row.get(mapping["debit"]))
            raw_credit = clean_amount_value(row.get(mapping["credit"]))

            if raw_credit is not None and raw_credit > 0:
                amount = raw_credit
                tx_type = "Income"
            elif raw_debit is not None and raw_debit > 0:
                amount = raw_debit
                tx_type = "Expense"
            else:
                summary["excluded_rows"] += 1
                continue
        elif mapping["amount"]:
            raw_amount = clean_amount_value(row.get(mapping["amount"]))
            if raw_amount is None:
                summary["excluded_rows"] += 1
                continue

            # Direction heuristic from raw type column or sign
            type_val = str(row.get(mapping["type"], "")).strip().lower() if mapping["type"] else ""
            if "credit" in type_val or "income" in type_val or "deposit" in type_val:
                tx_type = "Income"
                amount = abs(raw_amount)
            elif "debit" in type_val or "expense" in type_val or "withdrawal" in type_val:
                tx_type = "Expense"
                amount = abs(raw_amount)
            elif "refund" in desc.lower():
                tx_type = "Expense"
                # Refund represented as negative expense or income
                amount = -abs(raw_amount)
            elif raw_amount < 0:
                # Convention: negative amount = expense, positive = income (or vice versa based on context)
                amount = abs(raw_amount)
                tx_type = "Expense"
            else:
                amount = abs(raw_amount)
                # If description has salary/payroll, mark Income, else Expense
                if any(w in desc.lower() for w in ["salary", "payroll", "dividend", "interest", "bonus"]):
                    tx_type = "Income"
                else:
                    tx_type = "Expense"

        # Check existing category
        cat_col = mapping["category"]
        category = str(row.get(cat_col, "")).strip() if cat_col else ""
        if not category or category.lower() in ["nan", "none", "null"]:
            category = "Other"

        # Duplicate checking: (date, description, round(amount, 2), tx_type)
        fingerprint = (parsed_date, desc.lower(), round(amount, 2), tx_type)
        if fingerprint in seen_fingerprints:
            summary["duplicates_removed"] += 1
            summary["excluded_rows"] += 1
            continue
        seen_fingerprints.add(fingerprint)

        valid_records.append({
            "id": f"tx-{uuid.uuid4().hex[:8]}",
            "date": parsed_date,
            "description": desc,
            "amount": round(amount, 2),
            "type": tx_type,
            "category": category,
        })

    # Sort chronologically descending
    valid_records.sort(key=lambda x: x["date"], reverse=True)
    summary["valid_rows"] = len(valid_records)

    return valid_records, summary
