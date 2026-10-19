import React, { useState } from 'react';
import { ArrowUpRight, Menu, X, Sparkles, BarChart3, HelpCircle, Layers, Receipt } from 'lucide-react';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateYourMoney: () => void;
  onNavigateInsights: () => void;
  onNavigateHowItWorks: () => void;
  onNavigateDashboard: () => void;
  onOpenUpload: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  onNavigateYourMoney,
  onNavigateInsights,
  onNavigateHowItWorks,
  onNavigateDashboard,
  onOpenUpload,
  activeSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPillClass = (isActive: boolean) =>
    `px-3 py-1.5 text-xs lg:text-sm font-medium transition-all rounded-full flex items-center gap-1.5 cursor-pointer ${
      isActive
        ? 'bg-white/15 text-white border border-white/20 shadow-sm'
        : 'text-white/80 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  const getMobileItemClass = (isActive: boolean) =>
    `px-4 py-2 text-sm text-left rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
      isActive
        ? 'bg-white/15 text-white font-medium border border-white/20 shadow-sm'
        : 'text-white/90 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6 lg:px-16 pointer-events-none">
      <nav className="flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr] pointer-events-auto">
        {/* Brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
          aria-label="SpendSense home"
          className="flex items-center gap-2.5 justify-self-start group cursor-pointer"
        >
          <div className="size-7 rounded-lg liquid-glass-strong flex items-center justify-center border border-white/20 group-hover:border-white/50 transition-colors">
            <span className="font-serif italic text-lg leading-none font-bold text-white">S</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-medium tracking-tight text-white">SpendSense</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50 font-mono">
              FINANCIAL INTELLIGENCE
            </span>
          </div>
        </a>

        {/* Center Pill Menu */}
        <div className="liquid-glass flex items-center gap-1 rounded-full p-1.5 md:ps-2">
          <div className="hidden items-center md:flex gap-0.5">
            {/* 1. Overview */}
            <button
              type="button"
              onClick={onNavigateHome}
              className={getPillClass(activeSection === 'overview')}
            >
              Overview
            </button>

            {/* 2. Your Money */}
            <button
              type="button"
              onClick={onNavigateYourMoney}
              className={getPillClass(activeSection === 'your-money')}
            >
              <Receipt className="size-3 text-emerald-400" />
              <span>Your Money</span>
            </button>

            {/* 3. Insights */}
            <button
              type="button"
              onClick={onNavigateInsights}
              className={getPillClass(activeSection === 'insights')}
            >
              <Sparkles className="size-3 text-amber-400" />
              <span>Insights</span>
            </button>

            {/* 4. How It Works */}
            <button
              type="button"
              onClick={onNavigateHowItWorks}
              className={getPillClass(activeSection === 'how-it-works')}
            >
              How It Works
            </button>

            {/* 5. Live Dashboard */}
            <button
              type="button"
              onClick={onNavigateDashboard}
              className={getPillClass(activeSection === 'dashboard')}
            >
              <BarChart3 className="size-3.5" />
              <span>Live Dashboard</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex shrink-0 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 size-8 md:hidden transition-colors cursor-pointer"
            type="button"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          {/* Action CTA Button */}
          <button
            onClick={onOpenUpload}
            className="inline-flex shrink-0 items-center justify-center text-xs font-semibold whitespace-nowrap transition-all outline-none bg-white text-black hover:bg-white/90 h-8 gap-1.5 rounded-full px-3.5 shadow-sm active:scale-95 cursor-pointer ml-1"
            type="button"
          >
            <span>Analyze My Spending</span>
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Right status badge (genuine personal finance intelligence descriptor) */}
        <div className="hidden md:flex justify-self-end items-center gap-2 text-xs text-white/50 font-mono">
          <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Verified Data Engine</span>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 liquid-glass-strong rounded-2xl p-4 flex flex-col gap-1.5 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto shadow-2xl">
          <button
            type="button"
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
            className={getMobileItemClass(activeSection === 'overview')}
          >
            <span>Overview</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono">Top</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateYourMoney();
              setMobileMenuOpen(false);
            }}
            className={getMobileItemClass(activeSection === 'your-money')}
          >
            <span className="flex items-center gap-2">
              <Receipt className="size-3.5 text-emerald-400" />
              <span>Your Money</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateInsights();
              setMobileMenuOpen(false);
            }}
            className={getMobileItemClass(activeSection === 'insights')}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Insights</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Radar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateHowItWorks();
              setMobileMenuOpen(false);
            }}
            className={getMobileItemClass(activeSection === 'how-it-works')}
          >
            <span>How It Works</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono">Story</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateDashboard();
              setMobileMenuOpen(false);
            }}
            className={getMobileItemClass(activeSection === 'dashboard')}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="size-3.5 text-indigo-400" />
              <span>Live Dashboard</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Console</span>
          </button>

          <div className="pt-2 border-t border-white/10 mt-1">
            <button
              type="button"
              onClick={() => {
                onOpenUpload();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <span>Analyze My Spending</span>
              <ArrowUpRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
