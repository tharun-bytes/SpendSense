import React, { useState } from 'react';
import {
  Settings,
  Coins,
  ShieldCheck,
  RotateCcw,
  Database,
  Check,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { useCurrency, CurrencyCode } from '../../context/CurrencyContext';
import { resetData, loadSampleData, clearAllTransactions, StatusResponse } from '../../services/api';

interface SettingsViewProps {
  status: StatusResponse | null;
  onDataReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ status, onDataReset }) => {
  const { currency, setCurrency, symbol } = useCurrency();
  const [resetting, setResetting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const currencyOptions: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'INR', label: 'Indian Rupee (Default)', symbol: '₹' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'EUR', label: 'Euro', symbol: '€' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
  ];

  const handleResetToDemo = async () => {
    setResetting(true);
    setMessage(null);
    try {
      await loadSampleData();
      setMessage('Successfully restored the standard 6-month demonstration portfolio.');
      onDataReset();
    } catch (err: any) {
      setMessage('Failed to reload sample dataset.');
    } finally {
      setResetting(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all transactions? Your ledger will become completely empty.')) {
      return;
    }
    setClearing(true);
    setMessage(null);
    try {
      await clearAllTransactions();
      setMessage('All transactions cleared. Ledger is now empty.');
      onDataReset();
    } catch (err: any) {
      setMessage('Failed to clear transactions.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl liquid-glass border border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/5 text-zinc-300 border border-white/10">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Platform Settings & Data Governance</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure currency display preferences, audit ingestion diagnostics, and manage session datasets.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Currency Display Preference */}
      <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-zinc-400" />
              Currency Display Unit
            </h4>
            <p className="text-xs text-zinc-400">
              Select the preferred currency symbol for formatting monetary values throughout the dashboard.
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">
            Current: {symbol} ({currency})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {currencyOptions.map((opt) => {
            const isSelected = currency === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => setCurrency(opt.code)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-white bg-white/10 text-white shadow-lg'
                    : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-mono font-medium">{opt.symbol}</span>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="text-xs font-medium text-zinc-200">{opt.label}</div>
                <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{opt.code}</div>
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] font-mono text-zinc-400">
          <strong className="text-zinc-300">Methodology Note:</strong> Currency selection adjusts the visual unit symbol for personal preference. Calculations evaluate the genuine numeric values present in your records without applying unverified synthetic FX conversions.
        </div>
      </div>

      {/* Ingestion & Audit Diagnostics */}
      <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
              Ingestion Audit Diagnostics
            </h4>
            <p className="text-xs text-zinc-400">
              Sanitization metrics recorded during the most recent CSV processing cycle.
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider ${
            status?.is_demo_mode
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
          }`}>
            {status?.is_demo_mode ? 'Demo Dataset' : 'User CSV'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-zinc-500 text-[10px] uppercase">Active Entries</span>
            <div className="text-base font-semibold text-white mt-1">
              {status?.records_count ?? 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-zinc-500 text-[10px] uppercase">Duplicates Suppressed</span>
            <div className="text-base font-semibold text-amber-400 mt-1">
              {status?.audit_summary?.duplicates_removed ?? 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-zinc-500 text-[10px] uppercase">Excluded Rows</span>
            <div className="text-base font-semibold text-zinc-300 mt-1">
              {status?.audit_summary?.excluded_rows ?? 0}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-zinc-500 text-[10px] uppercase">Source Asset</span>
            <div className="text-xs font-medium text-zinc-200 mt-1 truncate" title={status?.source_filename}>
              {status?.source_filename || 'sample_transactions.csv'}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Session Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Privacy Assurance */}
        <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Zero-Telemetry Data Privacy
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            SpendSense operates locally in your isolated container. No financial records, account credentials, or transaction memos are transmitted to external servers or remote third parties.
          </p>
        </div>

        {/* Reset Actions */}
        <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-zinc-400" />
              Dataset Management
            </h4>
            <p className="text-xs text-zinc-400">
              Reload the standard demonstration dataset, or clear all entries to work with a blank ledger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={handleResetToDemo}
              disabled={resetting || clearing}
              className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-xs font-mono text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {resetting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Restoring Data...
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reload Demo Records
                </>
              )}
            </button>

            <button
              onClick={handleClearAll}
              disabled={clearing || resetting}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-mono text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              title="Clear all transactions for a blank ledger"
            >
              {clearing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Clear Ledger
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
