import React from 'react';

export const Stats: React.FC = () => {
  const stats = [
    { label: 'Capital audited', value: '$4.2B+' },
    { label: 'Categorization precision', value: '99.8%' },
    { label: 'Average OpEx reduced', value: '26.4%' },
    { label: 'Zero-touch onboarding', value: '< 3 mins' },
  ];

  return (
    <section data-slot="stats" className="relative overflow-hidden px-6 py-32 md:px-16 lg:px-24">
      {/* Desaturated video backdrop from Prism */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover saturate-0 opacity-70"
        src="/media/templates/prism/stats.mp4"
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

      {/* Stats container */}
      <dl className="rise liquid-glass relative z-10 mx-auto grid max-w-6xl grid-cols-2 gap-8 rounded-3xl p-10 text-center md:p-16 lg:grid-cols-4 border border-white/10">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-2">
            <dt className="order-2 text-xs sm:text-sm font-light text-white/60">
              {stat.label}
            </dt>
            <dd className="font-serif-prism text-4xl tracking-tight text-white italic tabular-nums md:text-5xl lg:text-6xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
