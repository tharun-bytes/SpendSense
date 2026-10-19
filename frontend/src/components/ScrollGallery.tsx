import React, { useEffect, useRef } from 'react';
import { animate, scroll } from 'motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface GalleryStage {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  img: string;
  alt: string;
}

const STAGES: GalleryStage[] = [
  {
    id: 'stage-1',
    label: 'FINANCIAL OVERVIEW',
    title: 'See the Full Picture',
    subtitle: 'Introduce SpendSense: Ingest, normalize, and track cashflow velocity with zero guesswork.',
    img: '/photos/spendsense/1.svg',
    alt: 'Financial Overview dashboard showing gross inflows, disbursements, and capital retention rate',
  },
  {
    id: 'stage-2',
    label: 'SPENDING BREAKDOWN',
    title: 'Understand Your Spending',
    subtitle: 'Automated sector distribution across 11 financial categories with zero manual tagging.',
    img: '/photos/spendsense/2.svg',
    alt: 'Spending Breakdown category distribution across housing, travel, food, and essentials',
  },
  {
    id: 'stage-3',
    label: 'BUDGET HEALTH',
    title: 'Stay on Budget',
    subtitle: 'Dynamic category budget caps vs actual disbursements with active month threshold alerts.',
    img: '/photos/spendsense/3.svg',
    alt: 'Budget Health monitoring card showing active allocations, exceeded warnings, and progress bars',
  },
  {
    id: 'stage-4',
    label: 'ANOMALY DETECTION',
    title: 'Discover Patterns',
    subtitle: 'Nonparametric IQR statistical anomaly detection & recurring subscription tracker to eliminate waste.',
    img: '/photos/spendsense/4.svg',
    alt: 'Anomaly Detection radar with nonparametric IQR bounds, outlier transaction alerts, and recurring liability detection',
  },
  {
    id: 'stage-5',
    label: 'ACTIONABLE INSIGHTS',
    title: 'Make Smarter Decisions',
    subtitle: 'Grounded portfolio optimizations, waste elimination, and audit-compliant statement exports.',
    img: '/photos/spendsense/5.svg',
    alt: 'Actionable Insights matrix with portfolio audit validation, discretionary reallocations, and statement export options',
  },
];

interface ScrollGalleryProps {
  onOpenUpload?: () => void;
  onOpenDashboard?: () => void;
}

export const ScrollGallery: React.FC<ScrollGalleryProps> = ({ onOpenUpload, onOpenDashboard }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let activeCleanups: Array<() => void> = [];

    const initMotion = () => {
      activeCleanups.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
      activeCleanups = [];

      // Check prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const isMobile = window.innerWidth < 1024;
      const textY = isMobile ? [15, -15] : [45, -45];
      const cardY = isMobile ? [-10, 10] : [-25, 25];
      const cardScale = isMobile ? [0.98, 1, 1, 0.98] : [0.96, 1, 1, 0.96];
      const cardOpacity = [0.85, 1, 1, 0.85];

      // Progress bar representing gallery scroll (active strictly within gallery stages)
      const progressEl = container.querySelector('.gallery-progress') as HTMLElement | null;
      if (progressEl) {
        let isTicking = false;
        const updateProgress = () => {
          isTicking = false;
          if (!container || !progressEl) return;

          const rect = container.getBoundingClientRect();
          const vh = window.innerHeight;
          const totalDistance = container.offsetHeight - vh;

          if (totalDistance <= 0) {
            progressEl.style.opacity = '0';
            progressEl.style.visibility = 'hidden';
            return;
          }

          // Active stage window:
          // User enters the stages when rect.top <= 0
          // User completes stage 5 when rect.bottom <= vh
          if (rect.top > 0) {
            // Above the stages (Hero or gallery header)
            progressEl.style.opacity = '0';
            progressEl.style.visibility = 'hidden';
            progressEl.style.transform = 'scaleX(0)';
          } else if (rect.bottom < vh) {
            // Below the stages (in Dashboard)
            progressEl.style.opacity = '0';
            progressEl.style.visibility = 'hidden';
            progressEl.style.transform = 'scaleX(1)';
          } else {
            // Actively traversing stages
            const current = -rect.top;
            const progressRatio = Math.min(Math.max(current / totalDistance, 0), 1);
            progressEl.style.visibility = 'visible';
            progressEl.style.opacity = '1';
            progressEl.style.transform = `scaleX(${progressRatio})`;
          }
        };

        const handleScroll = () => {
          if (!isTicking) {
            isTicking = true;
            window.requestAnimationFrame(updateProgress);
          }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        updateProgress();

        activeCleanups.push(() => {
          window.removeEventListener('scroll', handleScroll);
          if (progressEl) {
            progressEl.style.opacity = '0';
            progressEl.style.visibility = 'hidden';
          }
        });
      }

      // Parallax scroll on each stage item
      const stageItems = container.querySelectorAll('.gallery-stage-item');
      stageItems.forEach((stageEl) => {
        const infoEl = stageEl.querySelector('.stage-info') as HTMLElement | null;
        const visualEl = stageEl.querySelector('.stage-visual') as HTMLElement | null;

        if (infoEl) {
          try {
            const infoScroll = scroll(
              animate(infoEl, { y: textY }, { ease: 'linear' }),
              {
                target: stageEl,
                offset: ['start end', 'end start'],
              }
            );
            if (typeof infoScroll === 'function') activeCleanups.push(infoScroll);
          } catch (e) {
            console.warn('Motion stage info scroll init warning:', e);
          }
        }

        if (visualEl) {
          try {
            const visualScroll = scroll(
              animate(
                visualEl,
                { y: cardY, scale: cardScale, opacity: cardOpacity },
                { ease: 'linear' }
              ),
              {
                target: stageEl,
                offset: ['start end', 'end start'],
              }
            );
            if (typeof visualScroll === 'function') activeCleanups.push(visualScroll);
          } catch (e) {
            console.warn('Motion stage visual scroll init warning:', e);
          }
        }
      });
    };

    initMotion();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initMotion();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      activeCleanups.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    };
  }, []);

  return (
    <div
      id="gallery"
      ref={containerRef}
      className="gallery-section relative z-20 overflow-hidden scroll-mt-24 pb-20"
    >
      {/* From Uiverse.io by chase2k25 - Shared Dashboard & Gallery Charcoal Grid Background */}
      <div className="dashboard-chase-bg container" aria-hidden="true" />

      {/* Gallery Section Header in Prism Style */}
      <div className="relative z-10 pt-28 pb-12 px-6 text-center max-w-4xl mx-auto">
        <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white mb-4 border border-white/20">
          <Sparkles className="size-3.5 text-emerald-400" />
          <span>SpendSense Intelligence Walkthrough</span>
        </span>
        <h2 className="[font-family:var(--font-prism-serif)] text-4xl leading-[0.9] tracking-tight text-white italic sm:text-5xl md:text-6xl lg:text-7xl">
          Five Stages of Financial Clarity
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-zinc-400 font-light leading-relaxed">
          Follow the automated intelligence pipeline. As you scroll, each section links to real analytics from your financial portfolio with interactive storytelling.
        </p>
      </div>

      {/* 5 Viewport-Height Stage Sections with Rock-Solid Column Stability */}
      <div className="gallery-snap-track relative z-10">
        {STAGES.map((stage) => {
          return (
            <section
              key={stage.id}
              className="gallery-stage-item"
            >
              <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                {/* Stage Information Column (Consistently Left on Desktop) */}
                <div className="stage-info flex flex-col items-start lg:col-span-5 order-1">
                  {/* Descriptive Label (Replaces #001 - #005) */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md shadow-sm">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{stage.label}</span>
                  </div>

                  {/* Stage Title */}
                  <h3 className="[font-family:var(--font-prism-serif)] italic text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight mt-4 leading-[1.15]">
                    {stage.title}
                  </h3>

                  {/* Stage Description */}
                  <p className="mt-4 text-zinc-300 text-sm sm:text-base font-light leading-relaxed max-w-xl">
                    {stage.subtitle}
                  </p>

                  {/* Stage 5 Interactive Action Buttons */}
                  {stage.id === 'stage-5' && (
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      {onOpenUpload && (
                        <button
                          onClick={onOpenUpload}
                          type="button"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs sm:text-sm font-semibold shadow-xl active:scale-95 transition-all cursor-pointer"
                        >
                          <span>Analyze My Spending</span>
                          <ArrowUpRight className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenDashboard) {
                            onOpenDashboard();
                          } else {
                            const el = document.getElementById('dashboard');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass text-white hover:bg-white/10 text-xs sm:text-sm font-semibold border border-white/20 shadow-2xl active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Launch Live Console</span>
                        <ArrowUpRight className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Visual Card Column (Consistently Right on Desktop) */}
                <div className="stage-visual flex justify-center lg:col-span-7 order-2">
                  <div className="gallery-visual-card relative rounded-2xl overflow-hidden liquid-glass-strong border border-white/20 shadow-2xl transition-all duration-500 hover:border-white/35">
                    <img
                      src={stage.img}
                      alt={stage.alt}
                      className="w-full h-full object-contain block select-none"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Fixed Scroll Progress Bar (Motion-driven, fades in during gallery traversal) */}
      <div className="progress gallery-progress" aria-hidden="true" />
    </div>
  );
};
