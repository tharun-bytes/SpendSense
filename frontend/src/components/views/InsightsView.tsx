import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Repeat,
  Calculator,
  TrendingUp,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { InsightsResponse } from '../../services/api';

interface InsightsViewProps {
  insights: InsightsResponse | null;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ insights }) => {
  const { formatCurrency } = useCurrency();

  if (!insights) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        Calculating statistical anomalies and financial narratives...
      </div>
    );
  }

  const { outliers, recurring_subscriptions, narratives, statistical_notes } = insights;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Statistical Intelligence & Anomaly Radar
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Evidence-grounded observations generated using nonparametric dispersion formulas and multi-month frequency matching.
            </p>
          </div>
        </div>
      </div>

      {/* Narrative Insights Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 px-1">
          Evidence-Grounded Financial Observations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {narratives.map((item) => {
            const isPos = item.type === 'positive';
            const isWarn = item.type === 'warning';
            const isNeg = item.type === 'negative';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPos
                          ? 'bg-emerald-400'
                          : isWarn
                          ? 'bg-amber-400'
                          : isNeg
                          ? 'bg-rose-500'
                          : 'bg-zinc-400'
                      }`}
                    />
                    <h5 className="text-sm font-medium text-white">{item.title}</h5>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{item.message}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px] text-zinc-400">
                  <span className="text-zinc-500 block text-[10px] uppercase tracking-wider mb-0.5">
                    Grounding Formula
                  </span>
                  {item.calculation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IQR Outlier Detection Section */}
      <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-medium text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-zinc-400" />
              Statistical Outlier Detection (Interquartile Range Method)
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Identifies atypical capital outflows based on dispersion bounds, avoiding rigid manual arbitrary thresholds.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-zinc-300">
            {outliers.outliers.length} Outliers Detected
          </span>
        </div>

        {/* Statistical Parameters Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Q1 (25th Percentile)</span>
            <div className="text-sm font-medium text-zinc-200 mt-0.5">{formatCurrency(outliers.q1)}</div>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Q3 (75th Percentile)</span>
            <div className="text-sm font-medium text-zinc-200 mt-0.5">{formatCurrency(outliers.q3)}</div>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">IQR (Q3 - Q1)</span>
            <div className="text-sm font-medium text-zinc-200 mt-0.5">{formatCurrency(outliers.iqr)}</div>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Threshold (Q3 + 1.5×IQR)</span>
            <div className="text-sm font-semibold text-rose-400 mt-0.5">{formatCurrency(outliers.threshold)}</div>
          </div>
        </div>

        {/* Outlier Items List */}
        {outliers.outliers.length > 0 ? (
          <div className="space-y-3">
            {outliers.outliers.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{o.description}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300">
                      {o.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    {o.date} • Exceeds threshold by <strong className="text-rose-400 font-normal">{formatCurrency(o.amount - outliers.threshold)}</strong>
                  </p>
                </div>

                <div className="text-right font-mono">
                  <div className="text-base font-semibold text-rose-400">
                    {formatCurrency(o.amount)}
                  </div>
                  <span className="text-[10px] text-zinc-500">Atypical outflow</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-zinc-400 font-mono">
            No statistical outliers detected. All transactions reside within 1.5 × IQR of the 75th percentile.
          </div>
        )}
      </div>

      {/* Recurring Subscriptions Detector */}
      <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-zinc-400" />
              Recurring Subscriptions & Fixed Liabilities
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Merchants appearing repeatedly across distinct months with matching debit frequencies.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {recurring_subscriptions.length} Identified Subscriptions
          </span>
        </div>

        {recurring_subscriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 text-[11px]">
                  <th className="px-4 py-3 font-normal">Subscription / Merchant</th>
                  <th className="px-4 py-3 font-normal">Category</th>
                  <th className="px-4 py-3 font-normal">Billed Frequency</th>
                  <th className="px-4 py-3 font-normal">Monthly Cost</th>
                  <th className="px-4 py-3 font-normal text-right">Annualized Cost (×12)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recurring_subscriptions.map((sub, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-sans font-medium">
                      {sub.merchant}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-sans">
                      {sub.category}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {sub.frequency_months} active months ({sub.transactions_count} total payments)
                    </td>
                    <td className="px-4 py-3 text-zinc-200">
                      {formatCurrency(sub.average_amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-white">
                      {formatCurrency(sub.annualized_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-zinc-400 font-mono">
            No recurring multi-month subscriptions identified with the current filter set.
          </div>
        )}
      </div>
    </div>
  );
};
