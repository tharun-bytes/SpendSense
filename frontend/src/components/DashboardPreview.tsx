import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  Zap,
  PieChart,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';

interface Transaction {
  id: string;
  vendor: string;
  category: 'Cloud' | 'AI Compute' | 'SaaS' | 'Marketing';
  amount: number;
  date: string;
  status: 'Flagged' | 'Optimized' | 'Approved';
  anomalyNote?: string;
}

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    vendor: 'Amazon Web Services (AWS)',
    category: 'Cloud',
    amount: 34200.5,
    date: 'Oct 18, 2026',
    status: 'Flagged',
    anomalyNote: 'Unattached EBS volumes & idle RDS instance',
  },
  {
    id: 'tx-2',
    vendor: 'OpenAI API Platform',
    category: 'AI Compute',
    amount: 18450.0,
    date: 'Oct 17, 2026',
    status: 'Flagged',
    anomalyNote: 'Staging environment runaway prompt loop (+320%)',
  },
  {
    id: 'tx-3',
    vendor: 'Figma Enterprise',
    category: 'SaaS',
    amount: 8160.0,
    date: 'Oct 16, 2026',
    status: 'Flagged',
    anomalyNote: '34 inactive seats for >60 days',
  },
  {
    id: 'tx-4',
    vendor: 'Google Cloud Platform',
    category: 'Cloud',
    amount: 12400.0,
    date: 'Oct 15, 2026',
    status: 'Approved',
  },
  {
    id: 'tx-5',
    vendor: 'Datadog Ingestion',
    category: 'Cloud',
    amount: 9840.2,
    date: 'Oct 14, 2026',
    status: 'Flagged',
    anomalyNote: 'Debug-level logs streaming to primary index',
  },
  {
    id: 'tx-6',
    vendor: 'Linear + Slack Enterprise',
    category: 'SaaS',
    amount: 4500.0,
    date: 'Oct 12, 2026',
    status: 'Approved',
  },
  {
    id: 'tx-7',
    vendor: 'Anthropic Claude API',
    category: 'AI Compute',
    amount: 14200.0,
    date: 'Oct 10, 2026',
    status: 'Approved',
  },
];

export const DashboardPreview: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSimulatingAdd, setIsSimulatingAdd] = useState(false);

  const [newVendor, setNewVendor] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<Transaction['category']>('Cloud');

  const totalSpend = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const flaggedWaste = transactions
    .filter((tx) => tx.status === 'Flagged')
    .reduce((sum, tx) => sum + tx.amount * 0.35, 0);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOptimizeAll = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.status === 'Flagged' ? { ...tx, status: 'Optimized' } : tx))
      );
      setIsOptimizing(false);
    }, 700);
  };

  const handleOptimizeSingle = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: 'Optimized' } : tx))
    );
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount) return;
    const amountVal = parseFloat(newAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      vendor: newVendor,
      category: newCategory,
      amount: amountVal,
      date: 'Just now',
      status: amountVal > 10000 ? 'Flagged' : 'Approved',
      anomalyNote: amountVal > 10000 ? 'Unusual high value transaction detected' : undefined,
    };

    setTransactions([newTx, ...transactions]);
    setNewVendor('');
    setNewAmount('');
    setIsSimulatingAdd(false);
  };

  return (
    <section id="dashboard" className="px-4 sm:px-6 lg:px-16 py-16 scroll-mt-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="liquid-glass inline-block rounded-full px-4 py-1 text-xs font-medium text-white/90 mb-4 border border-white/10">
            Interactive Intelligence
          </span>
          <h2 className="font-serif-prism text-4xl sm:text-5xl lg:text-6xl text-white italic tracking-tight">
            Live Spend Command Center
          </h2>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-white/60 font-light">
            Direct telemetry across cloud instances, API consumption, and team software.
            Watch AI pinpoint waste and model remediation in real time.
          </p>
        </div>

        <div className="liquid-glass-strong rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/15 shadow-2xl relative">
          <div className="absolute -top-24 -right-24 size-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 relative z-10">
            <div className="liquid-glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>Total Monitored Spend</span>
                <span className="flex items-center text-emerald-400 gap-0.5 font-medium">
                  <TrendingUp className="size-3" /> +6.4%
                </span>
              </div>
              <div className="font-serif-prism text-3xl sm:text-4xl text-white italic font-medium tabular-nums">
                ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-2 text-[11px] text-white/40">Across 14 connected providers</div>
            </div>

            <div className="liquid-glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>Monthly Burn Velocity</span>
                <span className="flex items-center text-amber-400 gap-0.5 font-medium">
                  <TrendingDown className="size-3" /> -3.1% MoM
                </span>
              </div>
              <div className="font-serif-prism text-3xl sm:text-4xl text-white italic font-medium tabular-nums">
                -$101,750
              </div>
              <div className="mt-2 text-[11px] text-white/40">Estimated 24.8 mo current runway</div>
            </div>

            <div className="liquid-glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>Recoverable Waste</span>
                <span className="size-2 rounded-full bg-rose-400 animate-ping"></span>
              </div>
              <div className="font-serif-prism text-3xl sm:text-4xl text-rose-300 italic font-medium tabular-nums">
                ${flaggedWaste.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="mt-2 text-[11px] text-white/40">From idle nodes, duplicate seats & logs</div>
            </div>

            <div className="liquid-glass rounded-2xl p-5 border border-white/20 flex flex-col justify-between bg-white/[0.02]">
              <div className="text-xs text-white/70 font-medium flex items-center justify-between">
                <span>Autonomous Remediation</span>
                <Sparkles className="size-3.5 text-white/80" />
              </div>
              <div className="my-2">
                <button
                  onClick={handleOptimizeAll}
                  disabled={isOptimizing || flaggedWaste === 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Remediating Waste...</span>
                    </>
                  ) : flaggedWaste === 0 ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>All Waste Remediated</span>
                    </>
                  ) : (
                    <>
                      <Zap className="size-3.5 fill-current" />
                      <span>Remediate All (${Math.round(flaggedWaste).toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-[11px] text-white/40 text-center">Instant API killswitch & de-provisioning</div>
            </div>
          </div>

          {/* Grid: Category Breakdown & Anomaly Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
            <div className="lg:col-span-2 liquid-glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <PieChart className="size-4 text-white/70" />
                  <h3 className="text-sm font-semibold text-white tracking-wide">Category Allocation & Velocity</h3>
                </div>
                <span className="text-xs text-white/40">Last 30 Days</span>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Cloud Infrastructure (AWS/GCP/Cloudflare)', amount: '$46,600', pct: 45, color: 'bg-white' },
                  { name: 'AI Models & Token APIs (OpenAI/Anthropic)', amount: '$32,650', pct: 32, color: 'bg-white/70' },
                  { name: 'Team SaaS & Productivity (Figma/Slack)', amount: '$12,660', pct: 14, color: 'bg-white/50' },
                  { name: 'Engineering Observability (Datadog/Sentry)', amount: '$9,840', pct: 9, color: 'bg-white/30' },
                ].map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white/80 group-hover:text-white transition-colors">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white/50 font-mono text-[11px]">{item.pct}%</span>
                        <span className="text-white font-medium font-mono">{item.amount}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700 ease-out`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-rose-400" />
                    <h3 className="text-sm font-semibold text-white tracking-wide">AI Anomaly Alerts</h3>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Live
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-xs">
                    <div className="flex items-center justify-between text-rose-300 font-medium mb-1">
                      <span>AWS us-east-1 Surge</span>
                      <span className="text-[11px]">+$1,420/day</span>
                    </div>
                    <p className="text-white/60 text-[11px] leading-relaxed">
                      Unattached NVMe volumes detected across 12 decommissioned worker nodes.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-xs">
                    <div className="flex items-center justify-between text-amber-300 font-medium mb-1">
                      <span>Figma Zombie Licenses</span>
                      <span className="text-[11px]">-$8,160/yr</span>
                    </div>
                    <p className="text-white/60 text-[11px] leading-relaxed">
                      34 design seats with zero login events over past 60 consecutive days.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-xs">
                    <div className="flex items-center justify-between text-emerald-300 font-medium mb-1">
                      <span>Datadog Cold Retention</span>
                      <span className="text-[11px]">Save $850/mo</span>
                    </div>
                    <p className="text-white/60 text-[11px] leading-relaxed">
                      Auto-route non-fatal debug traces directly to S3 Glacier storage tier.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                <span>Autonomous scan frequency</span>
                <span className="font-mono text-white/80">Every 60s</span>
              </div>
            </div>
          </div>

          {/* Transactions Ledger Table Header & Controls */}
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-white/80" />
                <h3 className="text-sm font-semibold text-white">Live Transaction Ledger</h3>
                <span className="text-xs text-white/40 font-mono">({filteredTransactions.length} records)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vendor..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  />
                </div>

                <button
                  onClick={() => setIsSimulatingAdd(!isSimulatingAdd)}
                  className="px-3.5 py-1.5 rounded-full liquid-glass border border-white/20 text-xs font-medium text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Simulate Expense</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {['All', 'Cloud', 'AI Compute', 'SaaS', 'Marketing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-black font-semibold'
                      : 'liquid-glass text-white/70 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Simulate Form Drawer */}
            {isSimulatingAdd && (
              <form
                onSubmit={handleAddTransaction}
                className="mb-4 p-4 rounded-2xl liquid-glass border border-white/20 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end animate-in fade-in duration-200"
              >
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    placeholder="e.g. Anthropic, Databricks..."
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="4500"
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/60 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Transaction['category'])}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-white/50"
                  >
                    <option value="Cloud">Cloud</option>
                    <option value="AI Compute">AI Compute</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-white/90 cursor-pointer"
                  >
                    Post Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSimulatingAdd(false)}
                    className="px-3 py-1.5 rounded-lg liquid-glass text-xs text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Transactions Table */}
            <div className="rounded-2xl liquid-glass border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-white/50 uppercase tracking-wider font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Vendor & Provider</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Detection Audit</th>
                      <th className="py-3 px-4 text-right">Status & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white group-hover:text-white/90">
                            {tx.vendor}
                          </div>
                          <div className="text-[10px] text-white/40">{tx.date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-white tabular-nums">
                          ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          {tx.anomalyNote ? (
                            <span className="text-[11px] text-rose-300 flex items-center gap-1.5">
                              <AlertTriangle className="size-3 text-rose-400 shrink-0" />
                              <span className="truncate max-w-xs">{tx.anomalyNote}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-white/40">Verified optimal</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {tx.status === 'Flagged' ? (
                            <button
                              onClick={() => handleOptimizeSingle(tx.id)}
                              className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[11px] font-medium transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1"
                            >
                              <Zap className="size-3" />
                              <span>Remediate</span>
                            </button>
                          ) : tx.status === 'Optimized' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                              <CheckCircle2 className="size-3" />
                              <span>Remediated</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-white/50">Optimal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
