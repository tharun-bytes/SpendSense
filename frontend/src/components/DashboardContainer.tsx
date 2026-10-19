import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Layers,
  Sparkles,
  FileText,
  Settings,
  Upload,
  Database,
  RefreshCw,
  Coins,
  Plus
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import {
  fetchSummary,
  fetchMonthlyAnalytics,
  fetchCategoryAnalytics,
  fetchDailyAnalytics,
  fetchBudgets,
  fetchInsights,
  fetchStatus,
  SummaryMetrics,
  MonthlyMetric,
  CategoryMetric,
  DailyMetric,
  BudgetResponse,
  InsightsResponse,
  StatusResponse,
  Transaction,
} from '../services/api';

import { OverviewView } from './views/OverviewView';
import { TransactionsView } from './views/TransactionsView';
import { CategoriesView } from './views/CategoriesView';
import { BudgetsView } from './views/BudgetsView';
import { InsightsView } from './views/InsightsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { UploadModal } from './UploadModal';
import { AddTransactionModal } from './AddTransactionModal';

interface DashboardContainerProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenUpload?: () => void;
  refreshTrigger?: number;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  currentTab: controlledTab,
  onTabChange: controlledOnTabChange,
  onOpenUpload,
  refreshTrigger,
}) => {
  const { symbol, currency } = useCurrency();

  const [internalTab, setInternalTab] = useState('overview');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: string) => {
    if (controlledOnTabChange) {
      controlledOnTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const handleOpenUpload = onOpenUpload || (() => setIsUploadOpen(true));
  const [loading, setLoading] = useState(true);

  // Manual Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [initialAddMode, setInitialAddMode] = useState<'single' | 'bulk'>('single');

  // Data states
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyMetric[]>([]);
  const [categories, setCategories] = useState<CategoryMetric[]>([]);
  const [daily, setDaily] = useState<DailyMetric[]>([]);
  const [budgets, setBudgets] = useState<BudgetResponse | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [sumRes, mRes, catRes, dRes, bRes, insRes, stRes] = await Promise.all([
        fetchSummary(),
        fetchMonthlyAnalytics(),
        fetchCategoryAnalytics(),
        fetchDailyAnalytics(),
        fetchBudgets(),
        fetchInsights(),
        fetchStatus(),
      ]);

      setSummary(sumRes.metrics);
      setMonthly(mRes.monthly);
      setCategories(catRes.categories);
      setDaily(dRes.daily);
      setBudgets(bRes);
      setInsights(insRes);
      setStatus(stRes);
    } catch (err) {
      console.error('Error fetching dashboard datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [refreshTrigger]);

  const handleUploadSuccess = () => {
    loadAllData();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'categories', label: 'Categories', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: Layers },
    { id: 'insights', label: 'Anomalies & Radar', icon: Sparkles },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="relative w-full min-h-screen text-zinc-100 pt-20 lg:pt-24 pb-20 overflow-hidden">
      {/* From Uiverse.io by chase2k25 - Dashboard Background */}
      <div className="dashboard-chase-bg container" aria-hidden="true" />

      {/* Dashboard Top Command Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-serif italic font-normal text-white tracking-tight">
                  Financial Intelligence Console
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                    status?.is_demo_mode
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}
                >
                  {status?.is_demo_mode ? 'Demo Dataset' : 'User Verified'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Zero hardcoded mocks: Metrics, categories, and IQR anomalies calculated directly from dataset rows.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={loadAllData}
                disabled={loading}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Refresh calculations"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setInitialAddMode('single');
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-black bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer"
                title="Log a transaction manually"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Transaction</span>
              </button>

              <button
                onClick={handleOpenUpload}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-black bg-white hover:bg-zinc-200 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Transaction CSV
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading && !summary ? (
          <div className="py-24 text-center space-y-3 font-mono text-xs text-zinc-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
            <p>Evaluating financial indicators and statistical variances...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && summary && (
              <OverviewView
                metrics={summary}
                monthly={monthly}
                categories={categories}
                daily={daily}
                budgets={budgets?.budgets || []}
                isDemoMode={status?.is_demo_mode ?? true}
                sourceFilename={status?.source_filename ?? 'sample_transactions.csv'}
                onOpenUpload={handleOpenUpload}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView
                onDataChanged={loadAllData}
                onOpenAdd={() => {
                  setEditingTransaction(null);
                  setInitialAddMode('single');
                  setIsAddModalOpen(true);
                }}
                onOpenBulk={() => {
                  setEditingTransaction(null);
                  setInitialAddMode('bulk');
                  setIsAddModalOpen(true);
                }}
                onEditTransaction={(tx) => {
                  setEditingTransaction(tx);
                  setInitialAddMode('single');
                  setIsAddModalOpen(true);
                }}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesView
                categories={categories}
                onSelectCategory={(cat) => {
                  setActiveTab('transactions');
                }}
              />
            )}

            {activeTab === 'budgets' && (
              <BudgetsView
                budgetData={budgets}
                onBudgetUpdated={loadAllData}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsView insights={insights} />
            )}

            {activeTab === 'reports' && summary && (
              <ReportsView
                metrics={summary}
                monthly={monthly}
                categories={categories}
                isDemoMode={status?.is_demo_mode ?? true}
                sourceFilename={status?.source_filename ?? 'sample_transactions.csv'}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                status={status}
                onDataReset={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Manual Add / Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => {
          loadAllData();
        }}
        editingTransaction={editingTransaction}
        initialMode={initialAddMode}
      />

      {/* Upload CSV Modal (mounted internally only if no parent upload handler is provided) */}
      {!onOpenUpload && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};
