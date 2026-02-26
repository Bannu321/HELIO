import React, { useState, useEffect } from 'react';
import { useSolar } from '../../context/SolarContext';

export default function Topbar() {
  const { refresh, lastRefresh } = useSolar();
  const [time, setTime]         = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <header className="h-[68px] flex items-center justify-between px-8 border-b border-void-500 bg-void-800/70 backdrop-blur-md sticky top-0 z-50">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-void-200 text-sm font-mono">
        <span className="text-solar-400">HELIO</span>
        <span>/</span>
        <span className="text-white">Dashboard</span>
      </div>

      {/* Center: Live status bar */}
      <div className="flex items-center gap-6">
        <div className="live-badge">
          <div className="w-1.5 h-1.5 rounded-full bg-energy-green animate-blink" />
          GRID LIVE
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-void-200">
          <span>
            Last sync:{' '}
            <span className="text-void-100">
              {lastRefresh?.toLocaleTimeString('en-IN', { hour12: false }) ?? '—'}
            </span>
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-void-100">{time}</span>

        <button
          onClick={handleRefresh}
          className={`btn-ghost flex items-center gap-2 ${refreshing ? 'opacity-60' : ''}`}
          disabled={refreshing}
        >
          <span className={refreshing ? 'animate-spin inline-block' : ''}>↻</span>
          Refresh
        </button>

        {/* Notification dot */}
        <button className="relative btn-ghost px-2.5 py-2">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-energy-rose border border-void-800" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-solar-500 to-solar-700 flex items-center justify-center text-xs font-bold text-void-900 cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
