import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FileText,
  Layers,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import {
  Transaction,
  TransactionInput,
  createTransaction,
  updateTransaction,
  createBulkTransactions,
} from '../services/api';

const EXPENSE_CATEGORIES = [
  'Housing',
  'Food and Dining',
  'Transportation',
  'Utilities',
  'Shopping',
  'Subscriptions',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Interest',
  'Investments',
  'Other Income',
  'Income',
];

const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Cash',
  'Bank Transfer',
  'Other',
];

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTransaction?: Transaction | null;
  initialMode?: 'single' | 'bulk';
}

interface BulkRow {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'Expense' | 'Income';
  category: string;
  payment_method: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingTransaction,
  initialMode = 'single',
}) => {
  const { symbol } = useCurrency();
  const isEditing = Boolean(editingTransaction);

  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Single Transaction Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [type, setType] = useState<'Expense' | 'Income'>('Expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(todayStr);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');

  // Field-level error state
  const [fieldErrors, setFieldErrors] = useState<{
    amount?: string;
    description?: string;
    date?: string;
  }>({});

  // Bulk Entry Rows State
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    {
      id: 'row-1',
      date: todayStr,
      description: '',
      amount: '',
      type: 'Expense',
      category: 'Food and Dining',
      payment_method: 'Credit Card',
    },
    {
      id: 'row-2',
      date: todayStr,
      description: '',
      amount: '',
      type: 'Expense',
      category: 'Shopping',
      payment_method: 'UPI',
    },
    {
      id: 'row-3',
      date: todayStr,
      description: '',
      amount: '',
      type: 'Income',
      category: 'Salary',
      payment_method: 'Bank Transfer',
    },
  ]);
  const [bulkErrors, setBulkErrors] = useState<Record<string, string>>({});

  // Sync state when editingTransaction or modal opens
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.payment_method || PAYMENT_METHODS[0]);
      setNotes(editingTransaction.notes || '');
      setActiveTab('single');
    } else {
      setType('Expense');
      setAmount('');
      setDescription('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(todayStr);
      setPaymentMethod(PAYMENT_METHODS[0]);
      setNotes('');
      setActiveTab(initialMode);
    }
    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);
  }, [editingTransaction, isOpen, initialMode]);

  // Adjust default category when type flips
  const handleTypeChange = (newType: 'Expense' | 'Income') => {
    setType(newType);
    if (newType === 'Expense' && !EXPENSE_CATEGORIES.includes(category)) {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else if (newType === 'Income' && !INCOME_CATEGORIES.includes(category)) {
      setCategory(INCOME_CATEGORIES[0]);
    }
  };

  // Validate Single Form
  const validateSingle = (): boolean => {
    const errors: { amount?: string; description?: string; date?: string } = {};

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Amount must be a positive number greater than 0';
    }

    if (!description.trim()) {
      errors.description = 'Description or merchant name is required';
    }

    if (!date) {
      errors.date = 'Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.date = 'Date must be formatted YYYY-MM-DD';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Single Transaction (Add or Edit)
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validateSingle()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: TransactionInput = {
        date,
        description: description.trim(),
        amount: parseFloat(amount),
        type,
        category,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      };

      if (isEditing && editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
        setSuccessMessage('Transaction updated successfully.');
      } else {
        await createTransaction(payload);
        setSuccessMessage('Transaction logged to database successfully.');
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Operations
  const handleAddBulkRow = () => {
    const newId = `row-${Date.now()}`;
    setBulkRows((prev) => [
      ...prev,
      {
        id: newId,
        date: todayStr,
        description: '',
        amount: '',
        type: 'Expense',
        category: 'Food and Dining',
        payment_method: 'Credit Card',
      },
    ]);
  };

  const handleRemoveBulkRow = (id: string) => {
    if (bulkRows.length <= 1) return;
    setBulkRows((prev) => prev.filter((r) => r.id !== id));
    setBulkErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleUpdateBulkRow = (id: string, field: keyof BulkRow, val: string) => {
    setBulkRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: val };
        // Sync default category if type flips
        if (field === 'type') {
          if (val === 'Income' && !INCOME_CATEGORIES.includes(r.category)) {
            updated.category = INCOME_CATEGORIES[0];
          } else if (val === 'Expense' && !EXPENSE_CATEGORIES.includes(r.category)) {
            updated.category = EXPENSE_CATEGORIES[0];
          }
        }
        return updated;
      })
    );
  };

  const handleBulkSubmit = async () => {
    setGeneralError(null);
    setSuccessMessage(null);
    const errors: Record<string, string> = {};

    const validPayloads: TransactionInput[] = [];

    bulkRows.forEach((row, idx) => {
      const num = parseFloat(row.amount);
      const rowDesc = row.description.trim();

      if (!rowDesc && !row.amount) {
        // Skip completely empty row if more than 1
        return;
      }

      if (!rowDesc) {
        errors[row.id] = 'Description required';
        return;
      }

      if (!row.amount || isNaN(num) || num <= 0) {
        errors[row.id] = 'Positive amount required';
        return;
      }

      if (!row.date) {
        errors[row.id] = 'Date required';
        return;
      }

      validPayloads.push({
        date: row.date,
        description: rowDesc,
        amount: num,
        type: row.type,
        category: row.category,
        payment_method: row.payment_method,
      });
    });

    setBulkErrors(errors);

    if (Object.keys(errors).length > 0 && validPayloads.length === 0) {
      setGeneralError('Please resolve the errors beside the invalid rows.');
      return;
    }

    if (validPayloads.length === 0) {
      setGeneralError('Please enter at least one valid transaction row.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBulkTransactions(validPayloads);
      setSuccessMessage(
        `Saved ${res.saved_count} transactions to database.${
          res.duplicates_skipped > 0 ? ` (${res.duplicates_skipped} duplicates skipped)` : ''
        }`
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to process bulk entries');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl liquid-glass border border-white/20 shadow-2xl p-6 text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {isEditing ? <FileText className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-serif italic text-white">
                {isEditing ? 'Edit Transaction' : 'Record Transaction'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isEditing
                  ? 'Update transaction record details. All metrics and charts recalculate instantly.'
                  : 'Manually add income or expenditure into your persistent SQLite ledger.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector (Hidden if editing) */}
        {!isEditing && (
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'single'
                  ? 'bg-white text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Single Record
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'bulk'
                  ? 'bg-white text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bulk Manual Entry</span>
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {generalError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode 1: Single Transaction Form */}
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            {/* Type Selector (Expense vs Income) */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Transaction Direction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('Expense')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    type === 'Expense'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-md shadow-rose-950/20'
                      : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  <span>Expense (Disbursement)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('Income')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    type === 'Income'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/20'
                      : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>Income (Inflow)</span>
                </button>
              </div>
            </div>

            {/* Amount and Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Amount ({symbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (fieldErrors.amount) setFieldErrors((p) => ({ ...p, amount: undefined }));
                    }}
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl bg-black border text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                      fieldErrors.amount ? 'border-rose-500/60' : 'border-white/15 focus:border-white/40'
                    }`}
                  />
                </div>
                {fieldErrors.amount && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Transaction Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (fieldErrors.date) setFieldErrors((p) => ({ ...p, date: undefined }));
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl bg-black border text-sm text-white focus:outline-none transition-colors ${
                      fieldErrors.date ? 'border-rose-500/60' : 'border-white/15 focus:border-white/40'
                    }`}
                  />
                </div>
                {fieldErrors.date && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.date}</p>
                )}
              </div>
            </div>

            {/* Description / Merchant Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Description / Merchant *
              </label>
              <input
                type="text"
                placeholder={type === 'Expense' ? 'e.g. Starbucks, Electricity Bill, Amazon' : 'e.g. Tech Salary, Freelance Client, Dividend'}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: undefined }));
                }}
                className={`w-full px-3 py-2.5 rounded-xl bg-black border text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                  fieldErrors.description ? 'border-rose-500/60' : 'border-white/15 focus:border-white/40'
                }`}
              />
              {fieldErrors.description && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.description}</p>
              )}
            </div>

            {/* Category & Payment Method Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
                >
                  {(type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-white/40 transition-colors"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Optional Notes / Memo
              </label>
              <textarea
                rows={2}
                placeholder="Additional context, receipt number, project tag, or invoice code..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/40 transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Save Changes' : 'Save Transaction'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Bulk Entry Table */}
        {activeTab === 'bulk' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <p>Enter multiple transaction rows before submitting to the SQLite database.</p>
              <button
                type="button"
                onClick={handleAddBulkRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </button>
            </div>

            <div className="rounded-xl border border-white/10 overflow-x-auto bg-black/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-zinc-400 font-mono text-[10px] uppercase">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5">Amount ({symbol})</th>
                    <th className="p-2.5">Flow</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {bulkRows.map((row, idx) => {
                    const rowError = bulkErrors[row.id];
                    return (
                      <React.Fragment key={row.id}>
                        <tr className="hover:bg-white/[0.02]">
                          {/* Date */}
                          <td className="p-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'date', e.target.value)}
                              className="w-28 px-2 py-1 rounded bg-black border border-white/10 text-xs text-white focus:outline-none"
                            />
                          </td>

                          {/* Description */}
                          <td className="p-2 font-sans">
                            <input
                              type="text"
                              placeholder="Merchant / Item"
                              value={row.description}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'description', e.target.value)}
                              className="w-36 sm:w-44 px-2 py-1 rounded bg-black border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none"
                            />
                          </td>

                          {/* Amount */}
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={row.amount}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'amount', e.target.value)}
                              className="w-20 px-2 py-1 rounded bg-black border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none text-right"
                            />
                          </td>

                          {/* Type */}
                          <td className="p-2">
                            <select
                              value={row.type}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'type', e.target.value as any)}
                              className="px-2 py-1 rounded bg-black border border-white/10 text-[11px] text-white focus:outline-none"
                            >
                              <option value="Expense">Expense</option>
                              <option value="Income">Income</option>
                            </select>
                          </td>

                          {/* Category */}
                          <td className="p-2">
                            <select
                              value={row.category}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'category', e.target.value)}
                              className="w-28 px-2 py-1 rounded bg-black border border-white/10 text-[11px] text-white focus:outline-none"
                            >
                              {(row.type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Payment Method */}
                          <td className="p-2">
                            <select
                              value={row.payment_method}
                              onChange={(e) => handleUpdateBulkRow(row.id, 'payment_method', e.target.value)}
                              className="w-24 px-2 py-1 rounded bg-black border border-white/10 text-[11px] text-white focus:outline-none"
                            >
                              {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Delete Row */}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveBulkRow(row.id)}
                              disabled={bulkRows.length <= 1}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>

                        {rowError && (
                          <tr className="bg-rose-500/5">
                            <td colSpan={7} className="px-3 py-1 text-[11px] text-rose-400">
                              Row {idx + 1} Error: {rowError}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-zinc-400 font-mono">
                {bulkRows.length} rows configured
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Rows...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save All Valid Entries</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
