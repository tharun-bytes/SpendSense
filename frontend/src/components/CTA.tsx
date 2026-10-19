import React, { useState } from 'react';
import { ArrowUpRight, Sparkles, Check, Mail } from 'lucide-react';

interface CTAProps {
  onOpenDashboard: () => void;
  onNavigateHome?: () => void;
  onNavigateYourMoney?: () => void;
  onNavigateInsights?: () => void;
  onNavigateHowItWorks?: () => void;
}

export const CTA: React.FC<CTAProps> = ({
  onOpenDashboard,
  onNavigateHome,
  onNavigateYourMoney,
  onNavigateInsights,
  onNavigateHowItWorks,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section data-slot="cta" className="relative overflow-hidden px-6 pt-32 pb-8 md:px-16 lg:px-24">
      {/* Looping video from Prism */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-75"
        src="/media/templates/prism/cta.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[200px] bg-gradient-to-b from-black to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[200px] bg-gradient-to-t from-black to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="rise flex flex-col items-center text-center">
          <h2 className="font-serif-prism text-4xl leading-[0.9] tracking-tight text-white italic max-w-3xl md:text-6xl lg:text-7xl">
            Your next fiscal leap starts here.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed font-light text-white/60 md:text-base">
            Initiate a zero-risk 14-day audit. Watch autonomous agents reclaim capital across your stack.
          </p>

          {/* Quick Subscribe / Request Audit input */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <Mail className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter work email..."
                required
                className="w-full pl-11 pr-4 py-3 rounded-full liquid-glass border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              {submitted ? (
                <>
                  <Check className="size-4 text-emerald-600" />
                  <span>Audit Queued</span>
                </>
              ) : (
                <>
                  <span>Request Audit</span>
                  <ArrowUpRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Button actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenDashboard}
              data-slot="glass-button"
              className="liquid-glass-strong inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-all outline-none hover:bg-white/10 active:scale-95 cursor-pointer"
            >
              <Sparkles className="size-4 text-white/70" />
              <span>Explore Interactive Dashboard</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer
          data-slot="footer"
          className="mt-32 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row"
        >
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-md liquid-glass flex items-center justify-center border border-white/20">
              <span className="font-serif italic text-xs font-bold text-white">S</span>
            </div>
            <p>© 2026 SpendSense — Personal Finance Intelligence. All rights reserved.</p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={onNavigateHome}
              className="transition-colors hover:text-white cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={onNavigateYourMoney}
              className="transition-colors hover:text-white cursor-pointer"
            >
              Your Money
            </button>
            <button
              type="button"
              onClick={onNavigateInsights}
              className="transition-colors hover:text-white cursor-pointer"
            >
              Insights
            </button>
            <button
              type="button"
              onClick={onNavigateHowItWorks}
              className="transition-colors hover:text-white cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="transition-colors hover:text-white cursor-pointer"
            >
              Live Dashboard
            </button>
          </nav>
        </footer>
      </div>
    </section>
  );
};
