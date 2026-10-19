import React from 'react';
import { Zap, Sparkles, BarChart3, Shield } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: <Zap className="size-4" />,
      title: 'Sub-Second Detection',
      description: 'Isolate cloud provisioning anomalies and rogue API calls before invoices compound.',
      delay: '0ms',
    },
    {
      icon: <Sparkles className="size-4" />,
      title: 'Obsessively Crafted',
      description: 'CFO-ready liquid glass dashboards that translate raw telemetry into executive strategy.',
      delay: '100ms',
    },
    {
      icon: <BarChart3 className="size-4" />,
      title: 'Autonomous Action',
      description: 'One-click killswitches for dormant SaaS seats, orphaned disks, and duplicate tools.',
      delay: '200ms',
    },
    {
      icon: <Shield className="size-4" />,
      title: 'Secure by Default',
      description: 'SOC2 Type II certified. Zero write access required. Read-only token isolation standard.',
      delay: '300ms',
    },
  ];

  return (
    <section id="work" data-slot="benefits" className="px-6 py-24 md:px-16 lg:px-24 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <div className="rise flex flex-col items-center text-center">
          <span className="liquid-glass inline-block rounded-full px-4 py-1 text-xs font-medium text-white/90 mb-4 border border-white/10">
            Why Us
          </span>
          <h2 className="font-serif-prism text-4xl leading-[0.9] tracking-tight text-white italic md:text-5xl lg:text-6xl">
            The difference is everything.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <article
              key={i}
              className="rise liquid-glass rounded-2xl p-6 border border-white/10 hover:border-white/25 transition-all duration-300"
              style={{ animationDelay: b.delay }}
            >
              <span className="liquid-glass-strong flex size-10 items-center justify-center rounded-full text-white">
                {b.icon}
              </span>
              <h3 className="mt-6 font-serif-prism text-xl text-white italic">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed font-light text-white/60">
                {b.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
