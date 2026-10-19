"""
SpendSense Persistent Data Store
Connects in-memory analytics caching with SQLite persistent database storage.
Transactions, category budgets, and metadata survive server restarts and browser reloads.
"""

import json
import os
from typing import Any, Dict, List, Optional, Tuple

import database as db
from services.data_cleaning import clean_and_normalize_csv
from services.categorization import categorize_description

DEFAULT_BUDGETS: Dict[str, float] = {
    "Housing": 25000.0,
    "Food and Dining": 15000.0,
    "Transportation": 6000.0,
    "Utilities": 5000.0,
    "Shopping": 8000.0,
    "Subscriptions": 2000.0,
    "Entertainment": 4000.0,
    "Healthcare": 3000.0,
    "Education": 2000.0,
    "Travel": 10000.0,
    "Other": 3000.0
}


class SpendSenseStore:
    def __init__(self):
        # Initialize SQLite database schema
        db.init_db()

        # Check existing transactions in SQLite
        existing_txs = db.get_all_transactions()
        if not existing_txs:
            # First boot: Load default 6-month demonstration dataset into SQLite
            self.audit_summary: Dict[str, Any] = {}
            self.load_sample_data()
        else:
            # Resume existing dataset from SQLite
            demo_flag = db.get_metadata("is_demo_mode", "1")
            self.is_demo_mode: bool = demo_flag == "1"
            self.source_filename: str = db.get_metadata("source_filename", "spendsense.db")
            raw_summary = db.get_metadata("audit_summary", "{}")
            try:
                self.audit_summary = json.loads(raw_summary)
            except Exception:
                self.audit_summary = {}

        # Sync budgets table
        stored_budgets = db.get_stored_budgets()
        if not stored_budgets:
            db.set_stored_budgets(DEFAULT_BUDGETS)

    @property
    def transactions(self) -> List[Dict[str, Any]]:
        """Retrieve all active transactions from SQLite database."""
        return db.get_all_transactions()

    @property
    def budgets(self) -> Dict[str, float]:
        """Retrieve configured budgets from SQLite database."""
        budgets = db.get_stored_budgets()
        return budgets if budgets else dict(DEFAULT_BUDGETS)

    def load_sample_data(self) -> None:
        """Load default 6-month sample dataset from data/sample_transactions.csv into SQLite."""
        # Clear any prior transactions
        db.clear_transactions()

        possible_paths = [
            os.path.join(os.path.dirname(__file__), "..", "data", "sample_transactions.csv"),
            os.path.join(os.getcwd(), "data", "sample_transactions.csv"),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample_transactions.csv"))
        ]
        sample_path = None
        for p in possible_paths:
            if os.path.exists(p):
                sample_path = p
                break

        if sample_path and os.path.exists(sample_path):
            with open(sample_path, "r", encoding="utf-8") as f:
                content = f.read()
            records, summary = clean_and_normalize_csv(content)
            # Auto-categorize if missing or generic
            for r in records:
                if not r.get("category") or r.get("category") in ["", "Other"]:
                    r["category"] = categorize_description(r.get("description", ""))
                r["is_demo"] = 1

            # Save batch into SQLite
            db.insert_transactions_bulk(records, check_duplicates=False)
            self.audit_summary = summary
            self.is_demo_mode = True
            self.source_filename = "sample_transactions.csv"

            # Persist metadata
            db.set_metadata("is_demo_mode", "1")
            db.set_metadata("source_filename", "sample_transactions.csv")
            db.set_metadata("audit_summary", json.dumps(summary))
        else:
            self.audit_summary = {"warnings": ["Sample dataset file not found."]}
            self.is_demo_mode = False
            self.source_filename = "empty"
            db.set_metadata("is_demo_mode", "0")
            db.set_metadata("source_filename", "empty")
            db.set_metadata("audit_summary", json.dumps(self.audit_summary))

    def set_user_data(self, records: List[Dict[str, Any]], summary: Dict[str, Any], filename: str) -> None:
        """
        Store user-uploaded CSV records in SQLite.
        Replaces demo transactions with user verified transactions.
        """
        # If transitioning from demo mode or replacing dataset
        db.clear_transactions()

        # Mark records as non-demo
        for r in records:
            r["is_demo"] = 0

        # Insert records into SQLite with duplicate detection
        saved_count, dup_count, _ = db.insert_transactions_bulk(records, check_duplicates=True)
        summary["duplicates_removed"] = summary.get("duplicates_removed", 0) + dup_count

        self.audit_summary = summary
        self.is_demo_mode = False
        self.source_filename = filename

        # Persist metadata in SQLite
        db.set_metadata("is_demo_mode", "0")
        db.set_metadata("source_filename", filename)
        db.set_metadata("audit_summary", json.dumps(summary))

    def add_transaction(self, tx_dict: Dict[str, Any], keep_demo: bool = False) -> Dict[str, Any]:
        """
        Add a single manual transaction to SQLite.
        If the user is currently in demo mode, clears demo records so the user's
        ledger contains only their verified real financial transactions.
        """
        if self.is_demo_mode and not keep_demo:
            db.clear_transactions(demo_only=True)
            self.is_demo_mode = False
            self.source_filename = "Manual Ledger"
            db.set_metadata("is_demo_mode", "0")
            db.set_metadata("source_filename", "Manual Ledger")

        tx_dict["is_demo"] = 0
        created = db.insert_transaction(tx_dict)
        return created

    def add_transactions_bulk(
        self,
        tx_dicts: List[Dict[str, Any]],
        keep_demo: bool = False
    ) -> Tuple[int, int, List[str]]:
        """
        Add multiple transactions in bulk to SQLite.
        Returns: (saved_count, duplicates_skipped, list_of_saved_ids)
        """
        if self.is_demo_mode and not keep_demo:
            db.clear_transactions(demo_only=True)
            self.is_demo_mode = False
            self.source_filename = "Bulk Manual Entry"
            db.set_metadata("is_demo_mode", "0")
            db.set_metadata("source_filename", "Bulk Manual Entry")

        for r in tx_dicts:
            r["is_demo"] = 0

        return db.insert_transactions_bulk(tx_dicts, check_duplicates=True)

    def update_transaction(self, tx_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing transaction in SQLite."""
        return db.update_transaction(tx_id, updates)

    def update_transaction_category(self, tx_id: str, new_category: str) -> Optional[Dict[str, Any]]:
        """Update category for a specific transaction in SQLite."""
        return db.update_transaction(tx_id, {"category": new_category})

    def delete_transaction(self, tx_id: str) -> bool:
        """Delete a transaction from SQLite."""
        return db.delete_transaction(tx_id)

    def clear_all_data(self) -> None:
        """Clear all transactions from SQLite, entering clean empty-state mode."""
        db.clear_transactions()
        self.is_demo_mode = False
        self.source_filename = "Empty Ledger"
        self.audit_summary = {"message": "All transactions cleared."}
        db.set_metadata("is_demo_mode", "0")
        db.set_metadata("source_filename", "Empty Ledger")
        db.set_metadata("audit_summary", json.dumps(self.audit_summary))

    def update_budget(self, category: str, limit: float) -> None:
        """Set budget limit for a category."""
        db.set_stored_budget(category, limit)

    def update_budgets_bulk(self, budgets_dict: Dict[str, float]) -> None:
        """Set budget limits for multiple categories."""
        db.set_stored_budgets(budgets_dict)

    def get_budgets_with_actuals(self) -> List[Dict[str, Any]]:
        """
        Compare configured budgets against actual expenses for the latest active month in dataset.
        """
        txs = self.transactions
        months = sorted(list(set(tx["date"][:7] for tx in txs if tx.get("date") and tx.get("type") == "Expense")), reverse=True)
        target_month = months[0] if months else "Current"

        actuals: Dict[str, float] = {}
        for tx in txs:
            if tx.get("type") == "Expense" and tx.get("date", "").startswith(target_month):
                cat = tx.get("category", "Other")
                actuals[cat] = actuals.get(cat, 0.0) + float(tx.get("amount", 0.0))

        budgets = self.budgets
        result = []
        for cat, limit in budgets.items():
            spent = round(actuals.get(cat, 0.0), 2)
            remaining = round(limit - spent, 2)
            pct = round((spent / limit * 100), 1) if limit > 0 else 0.0
            status = "ok"
            if pct >= 100:
                status = "exceeded"
            elif pct >= 80:
                status = "warning"

            result.append({
                "category": cat,
                "budget_limit": limit,
                "spent": spent,
                "remaining": remaining,
                "percentage": pct,
                "status": status,
                "month": target_month
            })

        # Sort with exceeded or highest spend first
        result.sort(key=lambda x: x["percentage"], reverse=True)
        return result


# Global singleton instance
store = SpendSenseStore()
