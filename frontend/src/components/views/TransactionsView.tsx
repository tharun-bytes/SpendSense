import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Tag,
  Download,
  RotateCcw,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  Calendar,
  AlertTriangle,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Transaction,
  fetchTransactions,
  updateTransactionCategory,
  deleteTransaction,
  TransactionsResponse,
} from '../../services/api';

const ALL_CATEGORIES = [
  'Income',
  'Housing',
  'Utilities',
  'Food and Dining',
  'Transportation',
  'Shopping',
  'Subscriptions',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Other',
];

interface TransactionsViewProps {
  onDataChanged: () => void;
  onOpenAdd?: () => void;
  onOpenBulk?: () => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onDataChanged,
  onOpenAdd,
  onOpenBulk,
  onEditTransaction,
}) => {
  const { formatCurrency } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TransactionsResponse | null>(null);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  // Inline Category Editing
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [tempCategory, setTempCategory] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetchTransactions({
        search,
        category: selectedCategory,
        type: selectedType,
        month: selectedMonth,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page,
        limit,
      });
      setData(res);
    } catch (err: any) {
      console.error('Failed to load transactions:', err);
      setActionError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedType, selectedMonth, startDate, endDate, sortBy, sortOrder, page]);

  const handleCategoryChange = async (txId: string, newCat: string) => {
    setUpdatingId(txId);
    try {
      await updateTransactionCategory(txId, newCat);
      setEditingTxId(null);
      await loadData();
      onDataChanged();
    } catch (err) {
      console.error('Error changing category:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deletingTx.id);
      setDeletingTx(null);
      await loadData();
      onDataChanged();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete transaction');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedMonth('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedMonth !== 'all' ||
    startDate ||
    endDate
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Search Bar */}
      <div className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-zinc-300" />
              Transaction Ledger
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review, filter, add, edit, and manage transactions backed by SQLite persistence.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onOpenBulk && (
              <button
                onClick={onOpenBulk}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Bulk Multi-Row Entry"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bulk Entry</span>
              </button>
            )}

            {onOpenAdd && (
              <button
                onClick={onOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-xs font-mono font-medium text-black transition-all shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer"
                title="Add a new transaction manually"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Transaction</span>
              </button>
            )}

            <div className="flex items-center gap-2 font-mono text-xs pl-2 border-l border-white/10">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-medium">
                {data?.pagination.total_count ?? 0} records
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-2">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search merchant, notes, method..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-white/30 transition-colors"
            >
              <option value="all">All Categories</option>
              {data?.available_filters.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-white/30 transition-colors"
            >
              <option value="all">All Flows (In/Out)</option>
              <option value="Expense">Expenses Only</option>
              <option value="Income">Income Only</option>
            </select>
          </div>

          {/* Date Range: Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl bg-black border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-white/30 transition-colors"
              title="Start Date filter"
            />
          </div>

          {/* Date Range: End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-xl bg-black border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-white/30 transition-colors"
              title="End Date filter"
            />
          </div>
        </div>

        {/* Filter Summary & Reset Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span>
                Filtered Outflow: <strong className="text-rose-400 font-mono font-normal">{formatCurrency(data?.aggregates.expense_total || 0)}</strong>
              </span>
              <span>•</span>
              <span>
                Filtered Inflow: <strong className="text-emerald-400 font-mono font-normal">{formatCurrency(data?.aggregates.income_total || 0)}</strong>
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Transactions Table & Empty State */}
      <div className="rounded-2xl liquid-glass border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => toggleSort('date')}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('description')}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Description / Payee</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('category')}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </div>
                </th>
                <th className="px-4 py-3">Flow</th>
                <th className="px-4 py-3">Method</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="px-4 py-3 text-right cursor-pointer hover:text-white transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-mono">
              {loading && (!data || data.transactions.length === 0) ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-zinc-500">
                    Retrieving transaction records from database...
                  </td>
                </tr>
              ) : data && data.transactions.length > 0 ? (
                data.transactions.map((tx) => {
                  const isEditing = editingTxId === tx.id;
                  const isUpdating = updatingId === tx.id;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Date */}
                      <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Description & Optional Notes */}
                      <td className="px-4 py-3 font-sans font-medium text-white">
                        <div className="flex flex-col">
                          <span>{tx.description}</span>
                          {tx.notes && (
                            <span className="text-[11px] text-zinc-400 font-light truncate max-w-xs mt-0.5" title={tx.notes}>
                              {tx.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category with In-line Edit */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={tempCategory}
                              onChange={(e) => setTempCategory(e.target.value)}
                              className="px-2 py-1 rounded bg-black border border-white/20 text-xs text-white focus:outline-none"
                              autoFocus
                            >
                              {ALL_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleCategoryChange(tx.id, tempCategory)}
                              className="p-1 rounded bg-white/10 hover:bg-white/20 text-emerald-400 cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => {
                                setEditingTxId(tx.id);
                                setTempCategory(tx.category);
                              }}
                              className="px-2 py-0.5 rounded-full text-[11px] font-sans bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 cursor-pointer transition-colors group-hover:border-white/20"
                              title="Click to quickly reclassify category"
                            >
                              {tx.category}
                            </span>
                            {isUpdating && (
                              <span className="text-[10px] text-zinc-500 animate-pulse">saving...</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            tx.type === 'Income'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-400 text-[11px]">
                        {tx.payment_method ? (
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                            {tx.payment_method}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td
                        className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                          tx.type === 'Income' ? 'text-emerald-400' : 'text-zinc-200'
                        }`}
                      >
                        {tx.type === 'Income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </td>

                      {/* Row Actions: Edit & Delete */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {onEditTransaction && (
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeletingTx(tx)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty State */
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 w-fit mx-auto text-zinc-400">
                        <Receipt className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-serif italic text-white font-normal">
                          {hasActiveFilters ? 'No Matching Records' : 'No Transactions Recorded'}
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">
                          {hasActiveFilters
                            ? 'No transactions matched your current search filters. Try resetting the filters or broadening your date range.'
                            : 'Your ledger is currently empty. Add your first financial record manually or import a bank statement CSV to track cash flow and analytics.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        {hasActiveFilters ? (
                          <button
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Clear Filters</span>
                          </button>
                        ) : (
                          <>
                            {onOpenAdd && (
                              <button
                                onClick={onOpenAdd}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-xs font-mono font-medium text-black transition-all shadow-md active:scale-95 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Add Transaction</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        {data && data.pagination.total_pages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <div>
              Page <span className="text-white font-medium">{data.pagination.page}</span> of{' '}
              <span className="text-white font-medium">{data.pagination.total_pages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={data.pagination.page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={data.pagination.page >= data.pagination.total_pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl liquid-glass border border-white/20 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif italic text-white">Delete Transaction Record</h3>
                <p className="text-xs text-zinc-400">This action will remove the record from SQLite storage.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Description:</span>
                <span className="text-zinc-200 font-sans font-medium">{deletingTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount:</span>
                <span className={deletingTx.type === 'Income' ? 'text-emerald-400' : 'text-zinc-200'}>
                  {deletingTx.type === 'Income' ? '+' : '-'}{formatCurrency(deletingTx.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date:</span>
                <span className="text-zinc-300">{deletingTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Category:</span>
                <span className="text-zinc-300">{deletingTx.category}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
