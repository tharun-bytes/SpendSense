"""
Upload & Ingestion Routes
Handles CSV file uploads, custom column mapping, sample data resets,
and ingestion audit status with unified SQLite persistence.
"""

import json
from flask import Blueprint, jsonify, request
from services.data_cleaning import clean_and_normalize_csv
from services.categorization import categorize_description
from store import store

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/api/upload", methods=["POST"])
def upload_csv():
    """
    Accepts CSV file via multipart/form-data or raw body.
    Optional JSON/form parameter 'custom_mapping' for user-guided column definitions.
    Normalizes records and stores them in the persistent SQLite database.
    """
    content = ""
    filename = "uploaded_file.csv"

    if "file" in request.files:
        uploaded_file = request.files["file"]
        if not uploaded_file.filename:
            return jsonify({"error": "No file selected."}), 400
        filename = uploaded_file.filename
        try:
            content = uploaded_file.read().decode("utf-8", errors="replace")
        except Exception as e:
            return jsonify({"error": f"Failed to read uploaded file: {str(e)}"}), 400
    elif request.data:
        try:
            content = request.data.decode("utf-8", errors="replace")
            filename = request.headers.get("X-File-Name", "uploaded_file.csv")
        except Exception as e:
            return jsonify({"error": f"Failed to decode payload: {str(e)}"}), 400
    else:
        return jsonify({"error": "No file or data provided in request."}), 400

    # Check for optional custom column mapping
    custom_mapping = None
    if "custom_mapping" in request.form:
        try:
            custom_mapping = json.loads(request.form["custom_mapping"])
        except Exception:
            pass

    # Clean & normalize CSV
    records, summary = clean_and_normalize_csv(content, custom_mapping=custom_mapping)

    if not records and summary.get("warnings"):
        return jsonify({
            "error": "Failed to parse records from CSV.",
            "audit_summary": summary
        }), 422

    # Categorize any records lacking specific category
    for r in records:
        if not r.get("category") or r.get("category") in ["", "Other"]:
            r["category"] = categorize_description(r.get("description", ""))

    # Save to SQLite database
    store.set_user_data(records, summary, filename)

    return jsonify({
        "success": True,
        "message": f"Successfully parsed, validated, and persisted {len(records)} transactions.",
        "records_count": len(records),
        "is_demo_mode": store.is_demo_mode,
        "source_filename": store.source_filename,
        "audit_summary": summary,
    }), 200


@upload_bp.route("/api/sample-data", methods=["GET", "POST"])
def load_sample():
    """Load default 6-month demonstration dataset into SQLite database."""
    store.load_sample_data()
    return jsonify({
        "success": True,
        "message": "Loaded 6 months of demonstration transactions into database.",
        "records_count": len(store.transactions),
        "is_demo_mode": store.is_demo_mode,
        "source_filename": store.source_filename,
        "audit_summary": store.audit_summary,
    }), 200


@upload_bp.route("/api/status", methods=["GET"])
def get_status():
    """Get ingestion status, demo mode flag, and current dataset statistics from SQLite."""
    return jsonify({
        "is_demo_mode": store.is_demo_mode,
        "records_count": len(store.transactions),
        "source_filename": store.source_filename,
        "audit_summary": store.audit_summary,
    }), 200


@upload_bp.route("/api/reset", methods=["POST"])
def reset_data():
    """Reset data back to the default demonstration dataset."""
    store.load_sample_data()
    return jsonify({
        "success": True,
        "message": "Reset dataset to standard demonstration portfolio.",
        "is_demo_mode": store.is_demo_mode,
        "records_count": len(store.transactions),
    }), 200


@upload_bp.route("/api/clear", methods=["POST"])
def clear_data():
    """Clear all records from database to start fresh with a clean empty ledger."""
    store.clear_all_data()
    return jsonify({
        "success": True,
        "message": "Cleared all financial transactions from database.",
        "is_demo_mode": store.is_demo_mode,
        "records_count": 0,
    }), 200
