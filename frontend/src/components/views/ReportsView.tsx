import React from 'react';
import { Download, FileText, Printer, CheckCircle, Table, ArrowDownToLine } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { SummaryMetrics, MonthlyMetric, CategoryMetric } from '../../services/api';

interface ReportsViewProps {
  metrics: SummaryMetrics;
  monthly: MonthlyMetric[];
  categories: CategoryMetric[];
  isDemoMode: boolean;
  sourceFilename: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  metrics,
  monthly,
  categories,
  isDemoMode,
  sourceFilename,
}) => {
  const { formatCurrency } = useCurrency();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Export Actions */}
      <div className="p-5 rounded-2xl liquid-glass border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-300" />
            Financial Reports & Exports
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Download cleaned datasets and executive summaries for auditing, tax documentation, or portfolio reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cleaned CSV Export */}
        <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <Table className="w-4 h-4 text-emerald-400" />
              Cleaned Transactions Dataset (.csv)
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standardized format containing ID, Date (YYYY-MM-DD), Normalized Description, Assigned Category, Flow (Income/Expense), and Clean Numeric Amount. Deduplicated and sanitized.
            </p>
          </div>

          <a
            href="/api/reports/export/transactions"
            download
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-mono text-black bg-white hover:bg-zinc-200 transition-colors shadow-lg font-medium"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Download Normalized CSV
          </a>
        </div>

        {/* Executive Summary Export */}
        <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <FileText className="w-4 h-4 text-indigo-400" />
              Executive Financial Statement (.csv)
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Structured multi-section report including core executive indicators (Net Cash, Savings Efficiency), monthly chronological cashflow tables, and category capital allocation breakdown.
            </p>
          </div>

          <a
            href="/api/reports/export/summary"
            download
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-mono text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Download Executive Summary CSV
          </a>
        </div>
      </div>

      {/* Formatted Report Preview (Printable) */}
      <div className="p-8 rounded-2xl liquid-glass border border-white/10 space-y-6 print:border-none print:p-0">
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xl font-medium text-white tracking-tight">
              SpendSense Executive Financial Statement
            </h4>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Generated Portfolio Audit • Period: {metrics.start_date || 'N/A'} to {metrics.end_date || 'N/A'}
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Source: {sourceFilename} ({isDemoMode ? 'Demo Dataset' : 'Verified User Ingestion'})
          </span>
        </div>

        {/* Key Indicators Table */}
        <div className="space-y-3">
          <h5 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            I. Key Performance Indicators
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 text-[10px] uppercase">Gross Inflows</span>
              <div className="text-sm font-semibold text-white mt-1">{formatCurrency(metrics.total_income)}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 text-[10px] uppercase">Total Expenditures</span>
              <div className="text-sm font-semibold text-zinc-200 mt-1">{formatCurrency(metrics.total_expenses)}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 text-[10px] uppercase">Net Cash Position</span>
              <div className={`text-sm font-semibold mt-1 ${metrics.net_cash_flow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(metrics.net_cash_flow)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 text-[10px] uppercase">Savings Rate</span>
              <div className="text-sm font-semibold text-white mt-1">{metrics.savings_rate.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Monthly Table */}
        <div className="space-y-3">
          <h5 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            II. Chronological Monthly Trajectory
          </h5>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.02] text-zinc-400 border-b border-white/10 text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Month</th>
                  <th className="px-4 py-2.5 font-normal">Inflows</th>
                  <th className="px-4 py-2.5 font-normal">Outflows</th>
                  <th className="px-4 py-2.5 font-normal">Net Surplus</th>
                  <th className="px-4 py-2.5 font-normal">Savings Rate</th>
                  <th className="px-4 py-2.5 font-normal">MoM Outflow Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {monthly.map((m) => (
                  <tr key={m.month}>
                    <td className="px-4 py-2.5 font-medium text-white">{m.label}</td>
                    <td className="px-4 py-2.5 text-emerald-400">{formatCurrency(m.income)}</td>
                    <td className="px-4 py-2.5 text-rose-400">{formatCurrency(m.expenses)}</td>
                    <td className="px-4 py-2.5">{formatCurrency(m.net)}</td>
                    <td className="px-4 py-2.5">{m.savings_rate.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-zinc-400">
                      {m.mom_expense_change_pct !== null ? `${m.mom_expense_change_pct > 0 ? '+' : ''}${m.mom_expense_change_pct}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Table */}
        <div className="space-y-3">
          <h5 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            III. Category Capital Allocation Breakdown
          </h5>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.02] text-zinc-400 border-b border-white/10 text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 font-normal">Category</th>
                  <th className="px-4 py-2.5 font-normal">Total Spent</th>
                  <th className="px-4 py-2.5 font-normal">Portfolio Share (%)</th>
                  <th className="px-4 py-2.5 font-normal">Transactions</th>
                  <th className="px-4 py-2.5 font-normal">Average / Purchase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {categories.map((c) => (
                  <tr key={c.category}>
                    <td className="px-4 py-2.5 font-medium text-white font-sans">{c.category}</td>
                    <td className="px-4 py-2.5">{formatCurrency(c.total_amount)}</td>
                    <td className="px-4 py-2.5">{c.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-2.5">{c.transaction_count}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{formatCurrency(c.average_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
