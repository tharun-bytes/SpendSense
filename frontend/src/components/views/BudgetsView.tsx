import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Edit2,
  Save,
  X,
  TrendingUp,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { BudgetItem, BudgetResponse, updateBudgetLimit } from '../../services/api';

interface BudgetsViewProps {
  budgetData: BudgetResponse | null;
  onBudgetUpdated: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({ budgetData, onBudgetUpdated }) => {
  const { formatCurrency, symbol } = useCurrency();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<string>('');
  const [saving, setSaving] = useState(false);

  if (!budgetData) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        Loading budget allocations...
      </div>
    );
  }

  const { budgets, summary } = budgetData;

  const handleStartEdit = (b: BudgetItem) => {
    setEditingCategory(b.category);
    setNewLimit(String(b.budget_limit));
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    const val = parseFloat(newLimit);
    if (isNaN(val) || val < 0) return;

    setSaving(true);
    try {
      await updateBudgetLimit(editingCategory, val);
      setEditingCategory(null);
      onBudgetUpdated();
    } catch (err) {
      console.error('Failed to update budget:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Summary Cards */}
      <div className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-zinc-300" />
              Budget Controls & Target Tracking
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Compare actual outflows against monthly category limits. Adjust limits dynamically.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-zinc-300">
            Evaluating Period: <span className="text-white font-medium">{budgets[0]?.month || 'Active Month'}</span>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-zinc-400">Total Monthly Cap</span>
            <div className="text-xl font-mono font-semibold text-white mt-1">
              {formatCurrency(summary.total_budget)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-zinc-400">Actual Outflow</span>
            <div className="text-xl font-mono font-semibold text-zinc-200 mt-1">
              {formatCurrency(summary.total_spent)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-zinc-400">Remaining Cushion</span>
            <div className={`text-xl font-mono font-semibold mt-1 ${summary.total_remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(summary.total_remaining)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-zinc-400">Overall Utilization</span>
            <div className="text-xl font-mono font-semibold text-white mt-1">
              {summary.overall_utilization_pct.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Exceeded Alerts if any */}
      {summary.over_budget_count > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              <strong>Budget Exceeded Alert:</strong> {summary.over_budget_count} categories have surpassed their monthly allowances in the active period.
            </span>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const isEditing = editingCategory === b.category;
          const isExceeded = b.status === 'exceeded';
          const isWarning = b.status === 'warning';

          return (
            <div
              key={b.category}
              className={`p-5 rounded-2xl liquid-glass border transition-all ${
                isExceeded
                  ? 'border-rose-500/30 bg-rose-500/[0.02]'
                  : isWarning
                  ? 'border-amber-500/30 bg-amber-500/[0.02]'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    {b.category}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                        isExceeded
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isExceeded ? 'Exceeded' : isWarning ? 'Warning' : 'Healthy'}
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1">
                    Spent: <strong className="text-white font-medium">{formatCurrency(b.spent)}</strong> of{' '}
                    {formatCurrency(b.budget_limit)}
                  </p>
                </div>

                {/* Edit Action */}
                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                          {symbol}
                        </span>
                        <input
                          type="number"
                          value={newLimit}
                          onChange={(e) => setNewLimit(e.target.value)}
                          className="w-24 pl-6 pr-2 py-1 rounded bg-black border border-white/20 text-xs font-mono text-white focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-emerald-400 transition-colors"
                        title="Save Limit"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-zinc-400 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Adjust Cap
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className={isExceeded ? 'text-rose-400 font-semibold' : 'text-zinc-400'}>
                    {b.percentage.toFixed(1)}% utilized
                  </span>
                  <span className={b.remaining < 0 ? 'text-rose-400 font-medium' : 'text-zinc-400'}>
                    {b.remaining >= 0 ? `${formatCurrency(b.remaining)} remaining` : `${formatCurrency(Math.abs(b.remaining))} over budget`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
