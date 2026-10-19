"""
Transaction Management Routes
Provides searching, filtering, sorting, pagination, manual creation,
editing, deletion, bulk entry, and category updates with SQLite persistence.
"""

from datetime import datetime
from typing import Any, Dict, List
from flask import Blueprint, jsonify, request

import database as db
from services.categorization import categorize_description
from store import store

transaction_bp = Blueprint("transactions", __name__)


def is_valid_date(val: str) -> bool:
    """Validate that date is non-empty and in YYYY-MM-DD format."""
    if not val or not isinstance(val, str):
        return False
    try:
        datetime.strptime(val.strip(), "%Y-%m-%d")
        return True
    except (ValueError, TypeError):
        return False


@transaction_bp.route("/api/transactions", methods=["GET"])
def get_transactions():
    """
    Search, filter, sort, and paginate transactions directly through SQLite.
    Supports search query, category, type, month, date range, min/max amount, and sorting.
    """
    search = request.args.get("search", "").strip() or None
    category = request.args.get("category", "").strip() or None
    tx_type = request.args.get("type", "").strip() or None
    month = request.args.get("month", "").strip() or None
    start_date = request.args.get("start_date", "").strip() or None
    end_date = request.args.get("end_date", "").strip() or None
    min_amt = request.args.get("min_amount", type=float)
    max_amt = request.args.get("max_amount", type=float)
    sort_by = request.args.get("sort_by", "date")
    sort_order = request.args.get("sort_order", "desc")
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=25, type=int)

    records, total_count, aggregates = db.query_transactions(
        search=search,
        category=category,
        tx_type=tx_type,
        month=month,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amt,
        max_amount=max_amt,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )

    total_pages = max((total_count + limit - 1) // limit, 1) if limit > 0 else 1
    filter_values = db.get_available_filter_values()

    return jsonify({
        "transactions": records,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_count": total_count,
            "total_pages": total_pages,
        },
        "aggregates": aggregates,
        "available_filters": filter_values,
        "is_demo_mode": store.is_demo_mode,
    })


@transaction_bp.route("/api/transactions", methods=["POST"])
def add_transaction():
    """
    Manually create a new financial transaction.
    Validates required fields, date format, and positive numeric amount.
    """
    data = request.get_json(silent=True) or {}
    date_val = str(data.get("date", "")).strip()
    desc_val = str(data.get("description", "")).strip()
    amt_val = data.get("amount")
    type_val = str(data.get("type", "Expense")).strip()
    cat_val = str(data.get("category", "")).strip()
    pay_method = data.get("payment_method")
    notes = data.get("notes")
    keep_demo = bool(data.get("keep_demo", False))

    # Field validations
    errors = []
    if not date_val:
        errors.append("Transaction date is required.")
    elif not is_valid_date(date_val):
        errors.append("Transaction date must be in YYYY-MM-DD format.")

    if not desc_val:
        errors.append("Description or merchant name is required.")

    if amt_val is None:
        errors.append("Amount is required.")
    else:
        try:
            amt_num = float(amt_val)
            if amt_num <= 0:
                errors.append("Amount must be a positive number greater than 0.")
        except (ValueError, TypeError):
            errors.append("Amount must be a valid number.")

    normalized_type = "Income" if type_val.lower() == "income" else "Expense"

    if errors:
        return jsonify({"error": "Validation failed", "errors": errors}), 400

    # Auto-categorize if category is empty
    if not cat_val or cat_val.lower() in ["", "other", "all"]:
        if normalized_type == "Income":
            cat_val = "Income"
        else:
            cat_val = categorize_description(desc_val, fallback="Other")

    tx_dict = {
        "date": date_val,
        "description": desc_val,
        "amount": round(float(amt_val), 2),
        "type": normalized_type,
        "category": cat_val,
        "payment_method": pay_method.strip() if pay_method and isinstance(pay_method, str) else None,
        "notes": notes.strip() if notes and isinstance(notes, str) else None,
    }

    try:
        created = store.add_transaction(tx_dict, keep_demo=keep_demo)
        return jsonify({
            "success": True,
            "message": "Transaction created successfully.",
            "transaction": created,
            "is_demo_mode": store.is_demo_mode,
        }), 201
    except Exception as e:
        return jsonify({"error": f"Failed to save transaction: {str(e)}"}), 500


@transaction_bp.route("/api/transactions/<tx_id>", methods=["PUT", "PATCH"])
def update_transaction(tx_id: str):
    """
    Update an existing transaction's details.
    Validates updated fields before persisting.
    """
    data = request.get_json(silent=True) or {}
    updates: Dict[str, Any] = {}

    if "date" in data:
        date_val = str(data["date"]).strip()
        if not is_valid_date(date_val):
            return jsonify({"error": "Date must be in YYYY-MM-DD format."}), 400
        updates["date"] = date_val

    if "description" in data:
        desc_val = str(data["description"]).strip()
        if not desc_val:
            return jsonify({"error": "Description cannot be empty."}), 400
        updates["description"] = desc_val

    if "amount" in data:
        try:
            amt_num = float(data["amount"])
            if amt_num <= 0:
                return jsonify({"error": "Amount must be a positive number greater than 0."}), 400
            updates["amount"] = round(amt_num, 2)
        except (ValueError, TypeError):
            return jsonify({"error": "Amount must be a valid number."}), 400

    if "type" in data:
        t_val = str(data["type"]).strip().lower()
        updates["type"] = "Income" if t_val == "income" else "Expense"

    if "category" in data:
        cat_val = str(data["category"]).strip()
        if not cat_val:
            return jsonify({"error": "Category cannot be empty."}), 400
        updates["category"] = cat_val

    if "payment_method" in data:
        updates["payment_method"] = str(data["payment_method"]).strip() if data["payment_method"] else None

    if "notes" in data:
        updates["notes"] = str(data["notes"]).strip() if data["notes"] else None

    if not updates:
        return jsonify({"error": "No valid fields provided for update."}), 400

    updated = store.update_transaction(tx_id, updates)
    if not updated:
        return jsonify({"error": f"Transaction with ID '{tx_id}' not found."}), 404

    return jsonify({
        "success": True,
        "message": "Transaction updated successfully.",
        "transaction": updated,
    })


@transaction_bp.route("/api/transactions/<tx_id>/category", methods=["PATCH"])
def update_category(tx_id: str):
    """Update only the category for a specific transaction."""
    data = request.get_json(silent=True) or {}
    new_category = data.get("category", "").strip()

    if not new_category:
        return jsonify({"error": "Category field cannot be empty."}), 400

    updated = store.update_transaction_category(tx_id, new_category)
    if not updated:
        return jsonify({"error": f"Transaction with ID '{tx_id}' not found."}), 404

    return jsonify({
        "success": True,
        "message": f"Updated transaction category to '{new_category}'.",
        "transaction": updated,
    })


@transaction_bp.route("/api/transactions/<tx_id>", methods=["DELETE"])
def delete_transaction(tx_id: str):
    """Delete a single transaction by ID."""
    deleted = store.delete_transaction(tx_id)
    if not deleted:
        return jsonify({"error": f"Transaction with ID '{tx_id}' not found."}), 404

    return jsonify({
        "success": True,
        "message": f"Transaction {tx_id} deleted successfully.",
    })


@transaction_bp.route("/api/transactions/bulk", methods=["POST"])
def add_transactions_bulk():
    """
    Bulk manual entry: Ingests an array of transaction rows.
    Validates each row independently and saves all valid entries into SQLite.
    Reports count of saved, rejected, and duplicate rows.
    """
    data = request.get_json(silent=True) or {}
    raw_list = data.get("transactions", [])
    keep_demo = bool(data.get("keep_demo", False))

    if not isinstance(raw_list, list) or not raw_list:
        return jsonify({"error": "Field 'transactions' must be a non-empty array."}), 400

    valid_records: List[Dict[str, Any]] = []
    errors: List[Dict[str, Any]] = []

    for index, item in enumerate(raw_list):
        row_num = index + 1
        if not isinstance(item, dict):
            errors.append({"row": row_num, "error": "Row must be a JSON object."})
            continue

        date_val = str(item.get("date", "")).strip()
        desc_val = str(item.get("description", "")).strip()
        amt_val = item.get("amount")
        t_val = str(item.get("type", "Expense")).strip()
        cat_val = str(item.get("category", "")).strip()

        row_errors = []
        if not date_val:
            row_errors.append("Date is required")
        elif not is_valid_date(date_val):
            row_errors.append("Invalid date (format YYYY-MM-DD)")

        if not desc_val:
            row_errors.append("Description is required")

        if amt_val is None:
            row_errors.append("Amount is required")
        else:
            try:
                amt_num = float(amt_val)
                if amt_num <= 0:
                    row_errors.append("Amount must be > 0")
            except (ValueError, TypeError):
                row_errors.append("Amount must be a number")

        if row_errors:
            errors.append({"row": row_num, "error": "; ".join(row_errors)})
            continue

        normalized_type = "Income" if t_val.lower() == "income" else "Expense"
        if not cat_val or cat_val.lower() in ["", "other", "all"]:
            cat_val = "Income" if normalized_type == "Income" else categorize_description(desc_val)

        valid_records.append({
            "date": date_val,
            "description": desc_val,
            "amount": round(float(amt_val), 2),
            "type": normalized_type,
            "category": cat_val,
            "payment_method": item.get("payment_method") or None,
            "notes": item.get("notes") or None,
        })

    saved_count = 0
    duplicates_count = 0
    if valid_records:
        saved_count, duplicates_count, _ = store.add_transactions_bulk(valid_records, keep_demo=keep_demo)

    return jsonify({
        "success": True,
        "message": f"Processed {len(raw_list)} rows: {saved_count} saved, {duplicates_count} duplicates skipped, {len(errors)} rejected.",
        "saved_count": saved_count,
        "duplicates_skipped": duplicates_count,
        "rejected_count": len(errors),
        "errors": errors,
        "is_demo_mode": store.is_demo_mode,
    }), 200 if saved_count > 0 else 400


@transaction_bp.route("/api/transactions/clear", methods=["POST"])
def clear_all_transactions():
    """Clear all records to support a clean slate / empty state."""
    store.clear_all_data()
    return jsonify({
        "success": True,
        "message": "All transactions cleared. Ledger is now empty.",
        "is_demo_mode": store.is_demo_mode,
        "records_count": 0,
    })
