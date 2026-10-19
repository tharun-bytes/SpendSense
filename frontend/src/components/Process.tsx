import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ProcessProps {
  onOpenDashboard: () => void;
}

export const Process: React.FC<ProcessProps> = ({ onOpenDashboard }) => {
  return (
    <section
      id="process"
      data-slot="process"
      className="relative flex min-h-[700px] items-center overflow-hidden px-6 py-32 md:px-16 lg:px-24 scroll-mt-24"
    >
      {/* Background Video from Prism */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-75"
        src="/media/templates/prism/process.mp4"
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
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[220px] bg-gradient-to-b from-black to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[220px] bg-gradient-to-t from-black to-transparent"
      />

      {/* Content */}
      <div className="rise relative z-10 mx-auto flex min-h-[500px] w-full max-w-3xl flex-col items-center justify-center text-center">
        <span className="liquid-glass inline-block rounded-full px-4 py-1 text-xs font-medium text-white/90 mb-4 border border-white/10">
          How It Works
        </span>

        <h2 className="font-serif-prism text-4xl leading-[0.9] tracking-tight text-white italic md:text-5xl lg:text-6xl">
          You connect. We optimize.
        </h2>

        <p className="mt-6 max-w-xl text-sm leading-relaxed font-light text-white/60 md:text-base">
          Read-only connection in 90 seconds to AWS, GCP, Stripe, Ramp, and Brex.
          Prism autonomously ingests telemetry, isolates anomalous spikes, and activates instant recovery.
        </p>

        {/* 3 Steps Liquid Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 w-full text-left">
          <div className="liquid-glass rounded-2xl p-5 border border-white/10">
            <span className="font-serif-prism italic text-white/40 text-xl font-bold">01</span>
            <h3 className="mt-2 text-sm font-semibold text-white">Zero-Agent Connect</h3>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">
              Read-only API access with bank-grade encryption. No code instrumentation.
            </p>
          </div>
          <div className="liquid-glass rounded-2xl p-5 border border-white/10">
            <span className="font-serif-prism italic text-white/40 text-xl font-bold">02</span>
            <h3 className="mt-2 text-sm font-semibold text-white">AI Anomaly Audit</h3>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">
              Machine learning compares every line item against 50M+ benchmark pricing points.
            </p>
          </div>
          <div className="liquid-glass rounded-2xl p-5 border border-white/10">
            <span className="font-serif-prism italic text-white/40 text-xl font-bold">03</span>
            <h3 className="mt-2 text-sm font-semibold text-white">Instant Capital Recovery</h3>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">
              Kill runaway instances, de-provision idle seats, and renegotiate contracts on autopilot.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDashboard}
          data-slot="glass-button"
          className="liquid-glass-strong inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap text-white transition-all outline-none hover:bg-white/10 active:scale-95 cursor-pointer mt-10 group"
        >
          <span>Run Live Audit</span>
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </section>
  );
};
