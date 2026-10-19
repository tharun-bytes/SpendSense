import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CapabilitiesProps {
  onOpenDashboard: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Capabilities: React.FC<CapabilitiesProps> = ({ onOpenDashboard, onNavigateTab }) => {
  return (
    <section id="services" data-slot="features" className="px-6 py-24 md:px-16 lg:px-24 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <div className="rise flex flex-col items-center text-center">
          <span className="liquid-glass inline-block rounded-full px-4 py-1 text-xs font-medium text-white/90 mb-4 border border-white/10">
            Capabilities
          </span>
          <h2 className="font-serif-prism text-4xl leading-[0.9] tracking-tight text-white italic md:text-5xl lg:text-6xl">
            Pro intelligence. Zero complexity.
          </h2>
        </div>

        <div className="mt-16 flex flex-col gap-16 md:mt-20 md:gap-24">
          {/* Feature 1 */}
          <article className="rise flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
            <div className="flex-1">
              <h3 className="font-serif-prism text-3xl leading-[0.95] tracking-tight text-white italic md:text-4xl">
                Trained to detect waste. Built to preserve capital.
              </h3>
              <p className="mt-5 max-w-md text-sm leading-relaxed font-light text-white/60">
                Every transaction and API call is audited at runtime. Our neural agents benchmark your rates against thousands of companies, automatically highlighting overages before billing cycles close.
              </p>
              <button
                type="button"
                onClick={onOpenDashboard}
                data-slot="glass-button"
                className="liquid-glass-strong inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-all outline-none hover:bg-white/10 active:scale-95 cursor-pointer mt-8"
              >
                <span>Explore Detection Engine</span>
                <ArrowUpRight className="size-4" />
              </button>
            </div>
            <div className="liquid-glass relative aspect-[4/3] w-full flex-1 overflow-hidden rounded-2xl border border-white/10 group">
              <video
                className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="/media/templates/prism/stats.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                tabIndex={-1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl liquid-glass border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">AWS & GCP Spend Stream</span>
                  <span className="text-emerald-400 font-mono">-$14,280 Recovered</span>
                </div>
              </div>
            </div>
          </article>

          {/* Feature 2 (Reversed) */}
          <article className="rise flex flex-col items-center gap-10 lg:gap-16 [animation-delay:150ms] lg:flex-row-reverse">
            <div className="flex-1">
              <h3 className="font-serif-prism text-3xl leading-[0.95] tracking-tight text-white italic md:text-4xl">
                It gets smarter. Automatically.
              </h3>
              <p className="mt-5 max-w-md text-sm leading-relaxed font-light text-white/60">
                Your financial model continuously sharpens. Prism learns team provisioning habits, seasonal compute workloads, and contractor billing trends to suggest automated volume tier transitions.
              </p>
              <button
                type="button"
                onClick={() => (onNavigateTab ? onNavigateTab('insights') : onOpenDashboard())}
                data-slot="glass-button"
                className="liquid-glass-strong inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-all outline-none hover:bg-white/10 active:scale-95 cursor-pointer mt-8"
              >
                <span>Inspect Anomaly Radar</span>
                <ArrowUpRight className="size-4" />
              </button>
            </div>
            <div className="liquid-glass relative aspect-[4/3] w-full flex-1 overflow-hidden rounded-2xl border border-white/10 group">
              <video
                className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="/media/templates/prism/cta.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                tabIndex={-1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl liquid-glass border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">SaaS Subscription Redundancy</span>
                  <span className="text-amber-300 font-mono">42 Dormant Seats</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
