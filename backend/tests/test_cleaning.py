"""
Unit tests for SpendSense Data Cleaning & Normalization Engine
"""

import pytest
from services.data_cleaning import (
    detect_columns,
    parse_flexible_date,
    clean_amount_value,
    clean_and_normalize_csv,
)


def test_detect_columns_standard():
    cols = ["Transaction Date", "Payee", "Value", "Category"]
    mapping = detect_columns(cols)
    assert mapping["date"] == "Transaction Date"
    assert mapping["description"] == "Payee"
    assert mapping["amount"] == "Value"
    assert mapping["category"] == "Category"


def test_detect_columns_debit_credit():
    cols = ["Date", "Description", "Debit", "Credit"]
    mapping = detect_columns(cols)
    assert mapping["date"] == "Date"
    assert mapping["description"] == "Description"
    assert mapping["debit"] == "Debit"
    assert mapping["credit"] == "Credit"


def test_parse_flexible_date():
    assert parse_flexible_date("2026-03-15") == "2026-03-15"
    assert parse_flexible_date("15/03/2026") == "2026-03-15"
    assert parse_flexible_date("03/15/2026") == "2026-03-15"
    assert parse_flexible_date("15-03-2026") == "2026-03-15"
    assert parse_flexible_date("15 Mar 2026") == "2026-03-15"
    assert parse_flexible_date("") is None
    assert parse_flexible_date("invalid-date-string") is None


def test_clean_amount_value():
    assert clean_amount_value(150.50) == 150.50
    assert clean_amount_value("$1,234.56") == 1234.56
    assert clean_amount_value("INR 5,000") == 5000.0
    assert clean_amount_value("(45.20)") == -45.20
    assert clean_amount_value("-100.00") == -100.00
    assert clean_amount_value("250.00-") == -250.00
    assert clean_amount_value("invalid") is None
    assert clean_amount_value("") is None


def test_clean_and_normalize_csv_basic():
    csv_data = """Date,Description,Amount,Category
2026-01-10,Whole Foods Market,$85.40,Groceries
2026-01-15,Monthly Salary,$5000.00,Income
2026-01-10,Whole Foods Market,$85.40,Groceries
2026-01-20,Invalid Date Row,,Shopping
"""
    records, summary = clean_and_normalize_csv(csv_data)

    assert summary["total_rows"] == 4
    assert summary["valid_rows"] == 2  # 1 duplicate removed, 1 invalid row skipped
    assert summary["duplicates_removed"] == 1
    assert summary["excluded_rows"] == 2

    assert records[0]["date"] == "2026-01-15"  # Sorted descending
    assert records[0]["type"] == "Income"
    assert records[0]["amount"] == 5000.0

    assert records[1]["date"] == "2026-01-10"
    assert records[1]["amount"] == 85.40


def test_clean_and_normalize_csv_debit_credit():
    csv_data = """Date,Memo,Debit,Credit
2026-02-01,Tech Corp Salary,,7500.00
2026-02-05,Landlord Rent Transfer,2200.00,
"""
    records, summary = clean_and_normalize_csv(csv_data)
    assert len(records) == 2
    income_tx = next(r for r in records if r["type"] == "Income")
    assert income_tx["amount"] == 7500.0
    assert income_tx["description"] == "Tech Corp Salary"

    expense_tx = next(r for r in records if r["type"] == "Expense")
    assert expense_tx["amount"] == 2200.0
