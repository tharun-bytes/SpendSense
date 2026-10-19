"""
SpendSense SQLite Database Management Layer
Provides persistent storage for transactions, category budgets, and application metadata.
All operations use parameterized queries to ensure security and data integrity.
"""

import os
import sqlite3
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "spendsense.db")
DB_PATH = os.environ.get("DATABASE_PATH", DEFAULT_DB_PATH)


def get_db_connection() -> sqlite3.Connection:
    """Creates a connection to SQLite database with Row factory and WAL mode enabled."""
    db_file = os.path.abspath(DB_PATH)
    os.makedirs(os.path.dirname(db_file), exist_ok=True)
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db() -> None:
    """Initialize SQLite schema for transactions, budgets, and metadata."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # Transactions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                type TEXT NOT NULL,
                category TEXT NOT NULL,
                payment_method TEXT,
                notes TEXT,
                is_demo INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        # Performance Indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tx_demo ON transactions(is_demo);")

        # Category Budgets table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS budgets (
                category TEXT PRIMARY KEY,
                budget_limit REAL NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        # Application Metadata / Key-Value Settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS app_metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        """)

        conn.commit()
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    """Convert an sqlite3.Row into a Python dictionary."""
    d = dict(row)
    if "is_demo" in d:
        d["is_demo"] = bool(d["is_demo"])
    return d


# ---------------------------------------------------------------------------
# Metadata Operations
# ---------------------------------------------------------------------------

def get_metadata(key: str, default: Optional[str] = None) -> Optional[str]:
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT value FROM app_metadata WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else default
    finally:
        conn.close()


def set_metadata(key: str, value: str) -> None:
    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO app_metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, value)
        )
        conn.commit()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Transaction CRUD Operations
# ---------------------------------------------------------------------------

def get_transaction_by_id(tx_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single transaction by ID."""
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
        return row_to_dict(row) if row else None
    finally:
        conn.close()


def insert_transaction(tx_data: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a single transaction with generated timestamps."""
    conn = get_db_connection()
    now_iso = datetime.now().isoformat()
    tx_id = tx_data.get("id") or f"tx-{uuid.uuid4().hex[:8]}"

    # Normalize fields
    amount = abs(round(float(tx_data["amount"]), 2))
    tx_type = "Income" if str(tx_data.get("type", "")).strip().lower() == "income" else "Expense"
    category = tx_data.get("category", "Other") or "Other"
    payment_method = tx_data.get("payment_method") or None
    notes = tx_data.get("notes") or None
    is_demo = 1 if tx_data.get("is_demo") else 0

    record = {
        "id": tx_id,
        "date": tx_data["date"],
        "description": tx_data["description"].strip(),
        "amount": amount,
        "type": tx_type,
        "category": category,
        "payment_method": payment_method,
        "notes": notes,
        "is_demo": is_demo,
        "created_at": tx_data.get("created_at") or now_iso,
        "updated_at": now_iso,
    }

    try:
        conn.execute("""
            INSERT INTO transactions (id, date, description, amount, type, category, payment_method, notes, is_demo, created_at, updated_at)
            VALUES (:id, :date, :description, :amount, :type, :category, :payment_method, :notes, :is_demo, :created_at, :updated_at)
        """, record)
        conn.commit()
        return row_to_dict(conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone())
    finally:
        conn.close()


def insert_transactions_bulk(
    records: List[Dict[str, Any]],
    check_duplicates: bool = True
) -> Tuple[int, int, List[str]]:
    """
    Insert a batch of transactions.
    If check_duplicates is True, detects identical (date, description, amount, type)
    entries and skips them, reporting how many duplicates were excluded.
    Returns: (saved_count, duplicates_skipped, list_of_saved_ids)
    """
    if not records:
        return 0, 0, []

    conn = get_db_connection()
    now_iso = datetime.now().isoformat()
    saved_ids: List[str] = []
    duplicates_skipped = 0

    try:
        # Load existing signatures for duplicate detection
        existing_signatures = set()
        if check_duplicates:
            rows = conn.execute("SELECT date, LOWER(TRIM(description)) as desc, amount, type FROM transactions").fetchall()
            for r in rows:
                existing_signatures.add((r["date"], r["desc"], round(float(r["amount"]), 2), r["type"]))

        batch = []
        for r in records:
            amt = abs(round(float(r["amount"]), 2))
            t_type = "Income" if str(r.get("type", "")).strip().lower() == "income" else "Expense"
            desc_norm = str(r["description"]).strip().lower()
            date_val = str(r["date"]).strip()

            sig = (date_val, desc_norm, amt, t_type)
            if check_duplicates and sig in existing_signatures:
                duplicates_skipped += 1
                continue

            tx_id = r.get("id") or f"tx-{uuid.uuid4().hex[:8]}"
            record = (
                tx_id,
                date_val,
                str(r["description"]).strip(),
                amt,
                t_type,
                r.get("category", "Other") or "Other",
                r.get("payment_method") or None,
                r.get("notes") or None,
                1 if r.get("is_demo") else 0,
                r.get("created_at") or now_iso,
                now_iso,
            )
            batch.append(record)
            saved_ids.append(tx_id)
            if check_duplicates:
                existing_signatures.add(sig)

        if batch:
            conn.executemany("""
                INSERT INTO transactions (id, date, description, amount, type, category, payment_method, notes, is_demo, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, batch)
            conn.commit()

        return len(batch), duplicates_skipped, saved_ids
    finally:
        conn.close()


def update_transaction(tx_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update fields of an existing transaction."""
    conn = get_db_connection()
    now_iso = datetime.now().isoformat()

    allowed_fields = ["date", "description", "amount", "type", "category", "payment_method", "notes"]
    set_clauses = []
    params = []

    for field in allowed_fields:
        if field in updates:
            val = updates[field]
            if field == "amount":
                val = abs(round(float(val), 2))
            elif field == "type":
                val = "Income" if str(val).strip().lower() == "income" else "Expense"
            elif field == "description":
                val = str(val).strip()
            set_clauses.append(f"{field} = ?")
            params.append(val)

    if not set_clauses:
        return get_transaction_by_id(tx_id)

    set_clauses.append("updated_at = ?")
    params.append(now_iso)
    params.append(tx_id)

    try:
        sql = f"UPDATE transactions SET {', '.join(set_clauses)} WHERE id = ?"
        cur = conn.execute(sql, params)
        conn.commit()
        if cur.rowcount == 0:
            return None
        row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
        return row_to_dict(row) if row else None
    finally:
        conn.close()


def delete_transaction(tx_id: str) -> bool:
    """Delete a transaction by ID."""
    conn = get_db_connection()
    try:
        cur = conn.execute("DELETE FROM transactions WHERE id = ?", (tx_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def clear_transactions(demo_only: bool = False) -> int:
    """Clear transactions from database. If demo_only is True, only clears demo records."""
    conn = get_db_connection()
    try:
        if demo_only:
            cur = conn.execute("DELETE FROM transactions WHERE is_demo = 1")
        else:
            cur = conn.execute("DELETE FROM transactions")
        conn.commit()
        return cur.rowcount
    finally:
        conn.close()


def query_transactions(
    search: Optional[str] = None,
    category: Optional[str] = None,
    tx_type: Optional[str] = None,
    month: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 50,
) -> Tuple[List[Dict[str, Any]], int, Dict[str, float]]:
    """
    Search, filter, sort, and paginate transactions using SQL.
    Returns: (list_of_transactions, total_count, aggregates_dict)
    """
    conn = get_db_connection()
    try:
        conditions = []
        params: List[Any] = []

        if search:
            search_pattern = f"%{search.strip().lower()}%"
            conditions.append("(LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(COALESCE(notes, '')) LIKE ? OR LOWER(COALESCE(payment_method, '')) LIKE ?)")
            params.extend([search_pattern, search_pattern, search_pattern, search_pattern])

        if category and category.lower() != "all":
            conditions.append("LOWER(category) = ?")
            params.append(category.strip().lower())

        if tx_type and tx_type.lower() != "all":
            conditions.append("LOWER(type) = ?")
            params.append(tx_type.strip().lower())

        if month and month.lower() != "all":
            conditions.append("date LIKE ?")
            params.append(f"{month.strip()}%")

        if start_date:
            conditions.append("date >= ?")
            params.append(start_date.strip())

        if end_date:
            conditions.append("date <= ?")
            params.append(end_date.strip())

        if min_amount is not None:
            conditions.append("amount >= ?")
            params.append(float(min_amount))

        if max_amount is not None:
            conditions.append("amount <= ?")
            params.append(float(max_amount))

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        # Calculate Aggregates
        agg_sql = f"""
            SELECT 
                COUNT(*) as total_count,
                COALESCE(SUM(amount), 0.0) as total_amount,
                COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0.0) as expense_total,
                COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0.0) as income_total
            FROM transactions
            {where_clause}
        """
        agg_row = conn.execute(agg_sql, params).fetchone()
        total_count = agg_row["total_count"] if agg_row else 0
        aggregates = {
            "total_amount": round(agg_row["total_amount"], 2) if agg_row else 0.0,
            "expense_total": round(agg_row["expense_total"], 2) if agg_row else 0.0,
            "income_total": round(agg_row["income_total"], 2) if agg_row else 0.0,
        }

        # Sorting
        valid_sort_cols = {
            "date": "date",
            "amount": "amount",
            "description": "description",
            "category": "category",
            "type": "type"
        }
        order_col = valid_sort_cols.get(sort_by, "date")
        order_dir = "DESC" if sort_order.lower() == "desc" else "ASC"

        # Query Paginated Rows
        if limit > 0:
            offset = max(page - 1, 0) * limit
            query_sql = f"""
                SELECT * FROM transactions
                {where_clause}
                ORDER BY {order_col} {order_dir}, id ASC
                LIMIT ? OFFSET ?
            """
            rows = conn.execute(query_sql, params + [limit, offset]).fetchall()
        else:
            query_sql = f"""
                SELECT * FROM transactions
                {where_clause}
                ORDER BY {order_col} {order_dir}, id ASC
            """
            rows = conn.execute(query_sql, params).fetchall()

        transactions = [row_to_dict(r) for r in rows]
        return transactions, total_count, aggregates
    finally:
        conn.close()


def get_all_transactions() -> List[Dict[str, Any]]:
    """Retrieve all transactions from the database for comprehensive analytics and ML models."""
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT * FROM transactions ORDER BY date DESC, id ASC").fetchall()
        return [row_to_dict(r) for r in rows]
    finally:
        conn.close()


def get_available_filter_values() -> Dict[str, List[str]]:
    """Get unique categories, months, and payment methods from the stored transactions."""
    conn = get_db_connection()
    try:
        cat_rows = conn.execute("SELECT DISTINCT category FROM transactions WHERE category IS NOT NULL AND category != '' ORDER BY category ASC").fetchall()
        month_rows = conn.execute("SELECT DISTINCT SUBSTR(date, 1, 7) as month FROM transactions WHERE date IS NOT NULL AND date != '' ORDER BY month DESC").fetchall()
        method_rows = conn.execute("SELECT DISTINCT payment_method FROM transactions WHERE payment_method IS NOT NULL AND payment_method != '' ORDER BY payment_method ASC").fetchall()

        return {
            "categories": [r["category"] for r in cat_rows],
            "months": [r["month"] for r in month_rows],
            "payment_methods": [r["payment_method"] for r in method_rows],
        }
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Budget Operations
# ---------------------------------------------------------------------------

def get_stored_budgets() -> Dict[str, float]:
    """Retrieve configured category budget limits from the database."""
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT category, budget_limit FROM budgets").fetchall()
        return {r["category"]: float(r["budget_limit"]) for r in rows}
    finally:
        conn.close()


def set_stored_budget(category: str, limit: float) -> None:
    """Set or update a single category budget limit."""
    conn = get_db_connection()
    now_iso = datetime.now().isoformat()
    try:
        conn.execute("""
            INSERT INTO budgets (category, budget_limit, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(category) DO UPDATE SET budget_limit = excluded.budget_limit, updated_at = excluded.updated_at
        """, (category, float(limit), now_iso))
        conn.commit()
    finally:
        conn.close()


def set_stored_budgets(budgets_dict: Dict[str, float]) -> None:
    """Set or update multiple category budget limits in bulk."""
    conn = get_db_connection()
    now_iso = datetime.now().isoformat()
    try:
        batch = [(cat, float(lim), now_iso) for cat, lim in budgets_dict.items()]
        conn.executemany("""
            INSERT INTO budgets (category, budget_limit, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(category) DO UPDATE SET budget_limit = excluded.budget_limit, updated_at = excluded.updated_at
        """, batch)
        conn.commit()
    finally:
        conn.close()
