import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles, ChevronDown, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { fetchSummary, SummaryMetrics } from '../services/api';

interface HeroProps {
  onOpenDashboard: () => void;
  onOpenUpload: () => void;
  onNavigateGallery: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenDashboard,
  onOpenUpload,
  onNavigateGallery,
  onNavigateTab,
}) => {
  const { formatCurrency } = useCurrency();
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchSummary()
      .then((res) => {
        if (isMounted) setMetrics(res.metrics);
      })
      .catch(() => {
        if (isMounted) {
          setMetrics({
            total_income: 580000,
            total_expenses: 328683.5,
            net_cash_flow: 251316.5,
            savings_rate: 43.33,
            transaction_count: 68,
            average_transaction_amount: 4833.58,
            average_daily_spend: 1922.12,
            active_days_count: 171,
            start_date: '2026-06-01',
            end_date: '2026-11-20',
          });
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="home" data-slot="hero" className="relative flex min-h-svh flex-col overflow-hidden scroll-mt-24">
      {/* Background Video from Prism */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-80"
        src="/media/templates/prism/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Atmospheric Vignette & Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[260px] bg-gradient-to-t from-black via-black/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-black/45 backdrop-contrast-110"
      />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pt-32 text-center md:pt-40">
        {/* Announcement Badge */}
        <p className="rise liquid-glass inline-flex items-center gap-2 rounded-full p-1 pe-4 text-xs text-white/90 border border-white/20 shadow-lg">
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-black uppercase tracking-wider font-mono">
            SpendSense
          </span>
          <span className="font-mono text-[11px] tracking-wider uppercase text-white/90">
            YOUR MONEY, BETTER UNDERSTOOD
          </span>
        </p>

        {/* Word-by-word rising headline in Instrument Serif Italic */}
        <h1 className="mt-7 max-w-4xl font-serif-prism text-5xl leading-[0.92] tracking-[-1.5px] text-white italic sm:text-6xl md:text-7xl lg:text-[5.5rem] lg:tracking-[-3px]">
          <span className="block word-rise [animation-delay:0.1s]">
            Know Your Money.
          </span>
          <span className="block word-rise [animation-delay:0.25s]">
            Own Your Decisions.
          </span>
        </h1>

        {/* Subtitle with comfortable line-length */}
        <p className="rise-still mt-6 max-w-2xl text-sm leading-relaxed font-light text-white/75 [animation-delay:0.5s] md:text-base">
          Turn everyday transactions into meaningful insights. Understand your spending, track your budgets, and make smarter financial decisions with data.
        </p>

        {/* CTA Button Group */}
        <div className="rise mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5 [animation-delay:0.8s]">
          {/* Primary CTA: Analyze My Spending */}
          <button
            type="button"
            onClick={onOpenUpload}
            data-slot="glass-button"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold whitespace-nowrap bg-white text-black hover:bg-white/90 shadow-2xl active:scale-95 transition-all cursor-pointer group"
          >
            <span>Analyze My Spending</span>
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* Secondary CTA: Explore Your Financial Story */}
          <button
            type="button"
            onClick={onNavigateGallery}
            className="liquid-glass inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all px-6 py-3 border border-white/20 active:scale-95 cursor-pointer"
          >
            <span>Explore Your Financial Story</span>
            <ChevronDown className="size-4 text-white/70" />
          </button>
        </div>

        {/* Subtle Financial Intelligence Preview Widget */}
        <div className="rise mt-10 max-w-xl w-full mx-auto [animation-delay:1.1s]">
          <div className="liquid-glass rounded-2xl p-4 sm:p-5 border border-white/15 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-white/90 text-[11px] uppercase tracking-wider">
                  Live Portfolio Preview
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/70">
                  {metrics?.transaction_count || 68} Validated Entries
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/50">
                Active Audit
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3.5 pb-2 text-left">
              {/* Card 1: Total Spending -> Clickable to Transactions */}
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab('transactions') : onOpenDashboard())}
                className="text-left p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                title="View in Transactions ledger"
              >
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 block group-hover:text-white/80 transition-colors">
                  Total Spending ↗
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-white tracking-tight">
                  {formatCurrency(metrics?.total_expenses || 328683.5)}
                </span>
              </button>

              {/* Card 2: Net Surplus -> Clickable to Overview */}
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab('overview') : onOpenDashboard())}
                className="text-left p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                title="View in Financial Console Overview"
              >
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 block group-hover:text-white/80 transition-colors">
                  Net Surplus ↗
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-emerald-400 tracking-tight">
                  +{formatCurrency(metrics?.net_cash_flow || 251316.5)}
                </span>
              </button>

              {/* Card 3: Savings Rate -> Clickable to Budgets */}
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab('budgets') : onOpenDashboard())}
                className="text-left p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                title="View Category Budgets"
              >
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 block group-hover:text-white/80 transition-colors">
                  Savings Rate ↗
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-white tracking-tight">
                  {(metrics?.savings_rate || 43.3).toFixed(1)}%
                </span>
              </button>
            </div>

            {/* Quick Micro-Insight Bar */}
            <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/70">
              <span className="flex items-center gap-1.5 truncate">
                <Sparkles className="size-3 text-amber-400 shrink-0" />
                <span className="truncate">Housing &amp; Dining lead at 55.1% • IQR variance stable</span>
              </span>
              <button
                type="button"
                onClick={onOpenDashboard}
                className="text-white hover:text-white/80 shrink-0 ml-2 inline-flex items-center gap-1 text-[10px] underline underline-offset-2 cursor-pointer"
              >
                Inspect Dashboard &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Capabilities Trust Row */}
        <div data-slot="capabilities" className="rise mt-12 flex flex-col items-center gap-4 pb-6">
          <span className="liquid-glass inline-block rounded-full px-4 py-1 text-[11px] font-mono uppercase tracking-widest text-white/70 border border-white/10">
            Built to Make Your Spending Clearer
          </span>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-2 opacity-90 hover:opacity-100 transition-opacity">
            <li className="font-serif-prism text-xl tracking-tight text-white italic sm:text-2xl md:text-3xl">
              Expense Tracking
            </li>
            <li className="font-serif-prism text-xl tracking-tight text-white italic sm:text-2xl md:text-3xl">
              Budget Monitoring
            </li>
            <li className="font-serif-prism text-xl tracking-tight text-white italic sm:text-2xl md:text-3xl">
              Spending Insights
            </li>
            <li className="font-serif-prism text-xl tracking-tight text-white italic sm:text-2xl md:text-3xl">
              Data-Driven Decisions
            </li>
          </ul>

          {/* Scroll down indicator to explore the 5-Stage Story below */}
          <button
            type="button"
            onClick={onNavigateGallery}
            aria-label="Explore Your Financial Story"
            className="group mt-3 flex flex-col items-center gap-1 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">
              Explore Your Financial Story
            </span>
            <ChevronDown className="size-4 animate-bounce text-white/40 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </section>
  );
};
