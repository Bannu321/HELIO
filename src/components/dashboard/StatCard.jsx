import React from 'react';
import clsx from 'clsx';

export default function StatCard({ label, value, unit, delta, deltaUp, accent = 'solar', icon, loading }) {
  const accentStyles = {
    solar: { bar: 'bg-solar-500', value: 'text-solar-400', glow: 'border-solar-500/20' },
    green: { bar: 'bg-energy-green', value: 'text-energy-green', glow: 'border-energy-green/20' },
    blue:  { bar: 'bg-energy-blue', value: 'text-energy-blue', glow: 'border-energy-blue/20' },
    rose:  { bar: 'bg-energy-rose', value: 'text-energy-rose', glow: 'border-energy-rose/20' },
  };
  const s = accentStyles[accent] || accentStyles.solar;

  return (
    <div className={clsx(
      'card relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-default',
      s.glow, 'border'
    )}>
      {/* Top accent bar */}
      <div className={clsx('absolute top-0 left-0 right-0 h-[2px]', s.bar)} />

      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-mono text-void-200 tracking-widest uppercase">{label}</span>
        {icon && <span className="text-xl opacity-60">{icon}</span>}
      </div>

      {loading ? (
        <div className="h-8 bg-void-600 rounded animate-pulse w-2/3 mb-2" />
      ) : (
        <div className={clsx('font-display font-extrabold text-2xl leading-none', s.value)}>
          {value}
          {unit && <span className="text-sm font-normal text-void-200 ml-1.5">{unit}</span>}
        </div>
      )}

      {delta && (
        <div className={clsx('text-xs font-mono mt-2', deltaUp ? 'text-energy-green' : 'text-energy-rose')}>
          {deltaUp ? '↑' : '↓'} {delta}
        </div>
      )}
    </div>
  );
}
