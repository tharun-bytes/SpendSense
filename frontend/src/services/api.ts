/**
 * SpendSense Frontend API Client
 * Interacts with Flask backend endpoints.
 */

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  payment_method?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  is_demo?: boolean;
}

export interface TransactionInput {
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category?: string;
  payment_method?: string;
  notes?: string;
  keep_demo?: boolean;
}

export interface BulkAddResponse {
  success: boolean;
  message: string;
  saved_count: number;
  duplicates_skipped: number;
  rejected_count: number;
  errors: { row: number; error: string }[];
  is_demo_mode: boolean;
}

export interface SummaryMetrics {
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  savings_rate: number;
  transaction_count: number;
  average_transaction_amount: number;
  average_daily_spend: number;
  active_days_count: number;
  start_date: string | null;
  end_date: string | null;
}

export interface MonthlyMetric {
  month: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
  savings_rate: number;
  mom_expense_change_pct: number | null;
}

export interface CategoryMetric {
  category: string;
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  percentage: number;
}

export interface DailyMetric {
  date: string;
  amount: number;
}

export interface OutlierItem extends Transaction {
  iqr_threshold: number;
  deviation_from_q3: number;
  reason: string;
}

export interface OutliersResult {
  outliers: OutlierItem[];
  q1: number;
  q3: number;
  iqr: number;
  threshold: number;
  sample_size: number;
  explanation: string;
}

export interface RecurringItem {
  merchant: string;
  category: string;
  frequency_months: number;
  average_amount: number;
  annualized_cost: number;
  transactions_count: number;
  last_billed: string;
}

export interface InsightNarrative {
  id: string;
  type: 'positive' | 'warning' | 'negative' | 'info';
  title: string;
  message: string;
  calculation: string;
}

export interface InsightsResponse {
  outliers: OutliersResult;
  recurring_subscriptions: RecurringItem[];
  narratives: InsightNarrative[];
  is_demo_mode: boolean;
  statistical_notes: {
    methodology: string;
    recurrence_criteria: string;
  };
}

export interface BudgetItem {
  category: string;
  budget_limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'ok' | 'warning' | 'exceeded';
  month: string;
}

export interface BudgetResponse {
  budgets: BudgetItem[];
  summary: {
    total_budget: number;
    total_spent: number;
    total_remaining: number;
    overall_utilization_pct: number;
    over_budget_count: number;
    warning_count: number;
  };
  is_demo_mode: boolean;
}

export interface AuditSummary {
  total_rows?: number;
  valid_rows?: number;
  excluded_rows?: number;
  duplicates_removed?: number;
  warnings?: string[];
  column_mapping?: Record<string, string>;
}

export interface StatusResponse {
  is_demo_mode: boolean;
  records_count: number;
  source_filename: string;
  audit_summary?: AuditSummary;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
  aggregates: {
    total_amount: number;
    expense_total: number;
    income_total: number;
  };
  available_filters: {
    categories: string[];
    months: string[];
  };
  is_demo_mode: boolean;
}

const API_BASE = '/api';

export async function fetchStatus(): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function fetchSummary(): Promise<{ metrics: SummaryMetrics; is_demo_mode: boolean; source_filename: string }> {
  const res = await fetch(`${API_BASE}/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchMonthlyAnalytics(): Promise<{ monthly: MonthlyMetric[]; is_demo_mode: boolean }> {
  const res = await fetch(`${API_BASE}/analytics/monthly`);
  if (!res.ok) throw new Error('Failed to fetch monthly analytics');
  return res.json();
}

export async function fetchCategoryAnalytics(): Promise<{ categories: CategoryMetric[]; is_demo_mode: boolean }> {
  const res = await fetch(`${API_BASE}/analytics/categories`);
  if (!res.ok) throw new Error('Failed to fetch category analytics');
  return res.json();
}

export async function fetchDailyAnalytics(): Promise<{ daily: DailyMetric[]; is_demo_mode: boolean }> {
  const res = await fetch(`${API_BASE}/analytics/daily`);
  if (!res.ok) throw new Error('Failed to fetch daily analytics');
  return res.json();
}

export async function fetchTransactions(params: {
  search?: string;
  category?: string;
  type?: string;
  month?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
} = {}): Promise<TransactionsResponse> {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.category) q.set('category', params.category);
  if (params.type) q.set('type', params.type);
  if (params.month) q.set('month', params.month);
  if (params.start_date) q.set('start_date', params.start_date);
  if (params.end_date) q.set('end_date', params.end_date);
  if (params.min_amount !== undefined) q.set('min_amount', String(params.min_amount));
  if (params.max_amount !== undefined) q.set('max_amount', String(params.max_amount));
  if (params.sort_by) q.set('sort_by', params.sort_by);
  if (params.sort_order) q.set('sort_order', params.sort_order);
  if (params.page !== undefined) q.set('page', String(params.page));
  if (params.limit !== undefined) q.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/transactions?${q.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function createTransaction(data: TransactionInput): Promise<{
  success: boolean;
  message: string;
  transaction: Transaction;
}> {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) {
    const errorMsg = resData.errors ? resData.errors.join(', ') : resData.error || 'Failed to create transaction';
    throw new Error(errorMsg);
  }
  return resData;
}

export async function updateTransaction(
  txId: string,
  data: Partial<TransactionInput>
): Promise<{ success: boolean; message: string; transaction: Transaction }> {
  const res = await fetch(`${API_BASE}/transactions/${txId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Failed to update transaction');
  }
  return resData;
}

export async function deleteTransaction(txId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/transactions/${txId}`, {
    method: 'DELETE',
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Failed to delete transaction');
  }
  return resData;
}

export async function createBulkTransactions(
  transactions: TransactionInput[],
  keepDemo: boolean = false
): Promise<BulkAddResponse> {
  const res = await fetch(`${API_BASE}/transactions/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions, keep_demo: keepDemo }),
  });
  const resData = await res.json();
  if (!res.ok && resData.saved_count === 0) {
    throw new Error(resData.error || 'Failed to process bulk transactions');
  }
  return resData;
}

export async function clearAllTransactions(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/transactions/clear`, {
    method: 'POST',
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Failed to clear transactions');
  }
  return resData;
}

export async function updateTransactionCategory(txId: string, category: string): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions/${txId}/category`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  });
  if (!res.ok) throw new Error('Failed to update transaction category');
  const data = await res.json();
  return data.transaction;
}

export async function fetchInsights(): Promise<InsightsResponse> {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) throw new Error('Failed to fetch insights');
  return res.json();
}

export async function fetchBudgets(): Promise<BudgetResponse> {
  const res = await fetch(`${API_BASE}/budgets`);
  if (!res.ok) throw new Error('Failed to fetch budgets');
  return res.json();
}

export async function updateBudgetLimit(category: string, limit: number): Promise<BudgetResponse> {
  const res = await fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, limit }),
  });
  if (!res.ok) throw new Error('Failed to update budget');
  return res.json();
}

export async function uploadCSVFile(file: File, customMapping?: Record<string, string>): Promise<{
  success: boolean;
  message: string;
  records_count: number;
  audit_summary: AuditSummary;
}> {
  const formData = new FormData();
  formData.append('file', file);
  if (customMapping) {
    formData.append('custom_mapping', JSON.stringify(customMapping));
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload CSV');
  }
  return data;
}

export async function loadSampleData(): Promise<{ success: boolean; message: string; records_count: number }> {
  const res = await fetch(`${API_BASE}/sample-data`);
  if (!res.ok) throw new Error('Failed to load sample dataset');
  return res.json();
}

export async function resetData(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset dataset');
  return res.json();
}
