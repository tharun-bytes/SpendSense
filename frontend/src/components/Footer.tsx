import React from 'react';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateYourMoney: () => void;
  onNavigateInsights: () => void;
  onNavigateHowItWorks: () => void;
  onNavigateDashboard: () => void;
  onOpenUpload: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateYourMoney,
  onNavigateInsights,
  onNavigateHowItWorks,
  onNavigateDashboard,
  onOpenUpload,
}) => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/80 py-10 px-6 sm:px-8 lg:px-16 text-xs text-zinc-400 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="size-6 rounded-lg liquid-glass flex items-center justify-center border border-white/20">
            <span className="font-serif italic text-sm font-bold text-white">S</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span className="text-sm font-medium tracking-tight text-white">SpendSense</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Financial Intelligence Console
            </span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <p className="text-zinc-500 text-[11px]">
            &copy; 2026 SpendSense. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 font-mono text-[11px] text-zinc-400">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={onNavigateYourMoney}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Your Money
          </button>
          <button
            type="button"
            onClick={onNavigateInsights}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Insights
          </button>
          <button
            type="button"
            onClick={onNavigateHowItWorks}
            className="hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Live Dashboard
          </button>
          <button
            type="button"
            onClick={onOpenUpload}
            className="hover:text-emerald-400 text-zinc-300 transition-colors cursor-pointer"
          >
            Analyze Spending &rarr;
          </button>
        </nav>
      </div>
    </footer>
  );
};
