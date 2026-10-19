import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  AlertCircle,
  FileCheck,
  ArrowUpRight,
  Sparkles,
  Layers,
  Database,
  Receipt
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import {
  SummaryMetrics,
  MonthlyMetric,
  CategoryMetric,
  DailyMetric,
  BudgetItem,
  Transaction,
  fetchTransactions,
} from '../../services/api';

interface OverviewViewProps {
  metrics: SummaryMetrics;
  monthly: MonthlyMetric[];
  categories: CategoryMetric[];
  daily: DailyMetric[];
  budgets: BudgetItem[];
  isDemoMode: boolean;
  sourceFilename: string;
  onOpenUpload: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  monthly,
  categories,
  daily,
  budgets,
  isDemoMode,
  sourceFilename,
  onOpenUpload,
  onNavigateToTab,
}) => {
  const { formatCurrency, symbol } = useCurrency();

  const isPositiveNet = metrics.net_cash_flow >= 0;
  const topCategories = categories.slice(0, 5);
  const maxCategorySpend = topCategories.length > 0 ? topCategories[0].total_amount : 1;

  // Find latest month
  const latestMonth = monthly.length > 0 ? monthly[monthly.length - 1] : null;

  // Recent transactions preview state
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingRecent(true);
    fetchTransactions({ limit: 5, sort_by: 'date', sort_order: 'desc' })
      .then((res) => {
        if (isMounted && res.transactions) {
          setRecentTransactions(res.transactions.slice(0, 5));
        }
      })
      .catch((err) => {
        console.error('Error fetching recent transactions in OverviewView:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingRecent(false);
      });
    return () => {
      isMounted = false;
    };
  }, [metrics.transaction_count]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Mode Status Banner */}
      <div className="p-4 rounded-xl liquid-glass border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDemoMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {isDemoMode ? 'Demonstration Dataset Active' : 'Imported User Portfolio'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                isDemoMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isDemoMode ? 'Demo Mode' : 'Live Data'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Source: {sourceFilename} • {metrics.transaction_count} validated entries • {metrics.start_date || 'N/A'} to {metrics.end_date || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-black bg-white hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Upload Personal CSV
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Upload Another File
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-2xl liquid-glass border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total Inflow</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-semibold text-white tracking-tight">
            {formatCurrency(metrics.total_income)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-emerald-400 font-mono">Gross Inflow</span> across {metrics.active_days_count} active days
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl liquid-glass border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total Outflow</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-semibold text-white tracking-tight">
            {formatCurrency(metrics.total_expenses)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="font-mono text-zinc-300">{formatCurrency(metrics.average_daily_spend)}</span> / day burn rate
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="p-5 rounded-2xl liquid-glass border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Net Cash Position</span>
            <div className={`p-1.5 rounded-lg ${isPositiveNet ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-mono font-semibold tracking-tight ${isPositiveNet ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(metrics.net_cash_flow)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <span>Inflow minus outflow balance</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="p-5 rounded-2xl liquid-glass border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Savings Efficiency</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-semibold text-white tracking-tight">
            {metrics.savings_rate.toFixed(1)}%
          </div>
          <div className="mt-3 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.savings_rate >= 20 ? 'bg-emerald-400' : metrics.savings_rate >= 0 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(Math.max(metrics.savings_rate, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl liquid-glass border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                Monthly Cash Flow Comparison
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Side-by-side inflow, outflow, and net cash accumulation over time.
              </p>
            </div>
            {latestMonth?.mom_expense_change_pct !== null && latestMonth?.mom_expense_change_pct !== undefined && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                latestMonth.mom_expense_change_pct <= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                MoM Outflow: {latestMonth.mom_expense_change_pct > 0 ? '+' : ''}{latestMonth.mom_expense_change_pct}%
              </span>
            )}
          </div>

          {/* Monthly Bars Visualization */}
          <div className="space-y-4 pt-2">
            {monthly.map((m) => {
              const maxVal = Math.max(...monthly.map(x => Math.max(x.income, x.expenses)), 1);
              const incomeWidth = (m.income / maxVal) * 100;
              const expenseWidth = (m.expenses / maxVal) * 100;

              return (
                <div key={m.month} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-white">{m.label}</span>
                    <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                      <span>Inflow: <strong className="text-emerald-400 font-normal">{formatCurrency(m.income)}</strong></span>
                      <span>Outflow: <strong className="text-rose-400 font-normal">{formatCurrency(m.expenses)}</strong></span>
                      <span>Net: <strong className={m.net >= 0 ? 'text-zinc-200' : 'text-rose-400'}>{formatCurrency(m.net)}</strong></span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Income Bar */}
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-400/80 rounded-full h-full transition-all duration-500"
                        style={{ width: `${incomeWidth}%` }}
                      />
                    </div>
                    {/* Expense Bar */}
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-rose-400/80 rounded-full h-full transition-all duration-500"
                        style={{ width: `${expenseWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-2 rounded bg-emerald-400/80 inline-block" />
              <span>Income / Deposits</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-2 rounded bg-rose-400/80 inline-block" />
              <span>Expenditures</span>
            </div>
          </div>
        </div>

        {/* Top Spending Categories */}
        <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-zinc-400" />
                Category Distribution
              </h3>
              <button
                onClick={() => onNavigateToTab('categories')}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                View all &rarr;
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Top budget consumers ranked by absolute spend.
            </p>

            <div className="space-y-3.5 mt-5">
              {topCategories.map((c) => {
                const barWidth = (c.total_amount / maxCategorySpend) * 100;
                return (
                  <div key={c.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-200">{c.category}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-zinc-400">{c.percentage.toFixed(1)}%</span>
                        <span className="text-white font-medium">{formatCurrency(c.total_amount)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-zinc-300 to-white transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {c.transaction_count} transactions • avg {formatCurrency(c.average_amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => onNavigateToTab('budgets')}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white text-center transition-colors flex items-center justify-center gap-2"
            >
              <Layers className="w-3.5 h-3.5" />
              Review Budget Thresholds
            </button>
          </div>
        </div>
      </div>

      {/* Daily Spending Velocity & Quick Outlier Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Velocity Sparklines */}
        <div className="lg:col-span-2 p-6 rounded-2xl liquid-glass border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                Daily Expenditure Velocity
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Granular day-by-day spending pulses across the timeline.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Avg Daily: {formatCurrency(metrics.average_daily_spend)}
            </span>
          </div>

          {/* Simple custom responsive bar sparkline */}
          <div className="h-40 flex items-end gap-1 pt-6 pb-2 px-2 border-b border-white/10 overflow-x-auto">
            {daily.slice(-30).map((d) => {
              const maxDaily = Math.max(...daily.slice(-30).map(x => x.amount), 1);
              const heightPct = Math.max((d.amount / maxDaily) * 100, 4);

              return (
                <div
                  key={d.date}
                  className="flex-1 min-w-[6px] group relative flex flex-col items-center justify-end h-full"
                >
                  <div
                    className="w-full bg-white/30 group-hover:bg-white rounded-t transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="px-2 py-1 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-white whitespace-nowrap shadow-xl">
                      <div>{d.date}</div>
                      <div className="text-emerald-400">{formatCurrency(d.amount)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Last 30 Active Transaction Days</span>
            <span>Hover bars for exact daily disbursements</span>
          </div>
        </div>

        {/* Budget Health Snapshot */}
        <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              Budget Health
            </h3>
            <span className="text-xs font-mono text-zinc-400">Active Month</span>
          </div>

          <div className="space-y-3">
            {budgets.slice(0, 4).map((b) => (
              <div key={b.category} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{b.category}</span>
                  <span className={`font-mono text-[11px] ${
                    b.status === 'exceeded'
                      ? 'text-rose-400 font-semibold'
                      : b.status === 'warning'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {b.percentage.toFixed(0)}% used
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.status === 'exceeded'
                        ? 'bg-rose-500'
                        : b.status === 'warning'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Spent: {formatCurrency(b.spent)}</span>
                  <span>Cap: {formatCurrency(b.budget_limit)}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateToTab('insights')}
            className="w-full py-2 rounded-xl text-xs font-mono text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            Inspect Statistical Anomalies &rarr;
          </button>
        </div>
      </div>

      {/* Recent Transactions Preview Section */}
      <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-zinc-400" />
              Recent Transactions
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Latest validated ledger activity with instant category verification.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="inline-flex items-center gap-1 text-xs font-mono text-zinc-300 hover:text-white transition-colors self-start sm:self-auto group cursor-pointer"
          >
            <span>View All Transactions ({metrics.transaction_count})</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-mono text-[11px]">
                <th className="py-2.5 px-3 font-normal">Date</th>
                <th className="py-2.5 px-3 font-normal">Description</th>
                <th className="py-2.5 px-3 font-normal">Category</th>
                <th className="py-2.5 px-3 font-normal">Type</th>
                <th className="py-2.5 px-3 font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingRecent ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    Loading recent transaction records...
                  </td>
                </tr>
              ) : recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No transaction entries recorded yet.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'Income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3 px-3 font-mono text-zinc-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3 font-medium text-white max-w-[200px] sm:max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-3 font-mono font-medium text-right whitespace-nowrap ${
                          isIncome ? 'text-emerald-400' : 'text-zinc-200'
                        }`}
                      >
                        {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-zinc-500">
          <span>Showing 5 most recent records</span>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Launch full ledger with search & inline categorization &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
