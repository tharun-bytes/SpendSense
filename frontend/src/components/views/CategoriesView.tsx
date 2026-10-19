import React from 'react';
import { PieChart, ArrowUpRight, Layers, Tag, DollarSign, Hash } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { CategoryMetric } from '../../services/api';

interface CategoriesViewProps {
  categories: CategoryMetric[];
  onSelectCategory: (cat: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, onSelectCategory }) => {
  const { formatCurrency } = useCurrency();

  const totalExpenseSum = categories.reduce((acc, c) => acc + c.total_amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl liquid-glass border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-zinc-300" />
            Category Intelligence Breakdown
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Holistic capital distribution across 11 personal finance sectors derived directly from transaction details.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-zinc-400">Total Classified Outflow:</span>
          <span className="text-white font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            {formatCurrency(totalExpenseSum)}
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c, idx) => {
          return (
            <div
              key={c.category}
              className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-4 hover:border-white/20 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{c.category}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-400">
                      #{idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    {c.percentage.toFixed(1)}% of total expenditures
                  </p>
                </div>

                <button
                  onClick={() => onSelectCategory(c.category)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  title="View Transactions in this Category"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Progress representation */}
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-300 to-white transition-all duration-500"
                  style={{ width: `${Math.min(c.percentage, 100)}%` }}
                />
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-xs">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Total Spent
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {formatCurrency(c.total_amount)}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Volume
                  </div>
                  <div className="text-sm font-semibold text-zinc-300 mt-0.5">
                    {c.transaction_count} txs
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                <span>Average per purchase:</span>
                <span className="text-zinc-200">{formatCurrency(c.average_amount)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
