import React from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import PowerChart from '../components/charts/PowerChart';
import { useSolar } from '../context/SolarContext';

export default function Home() {
  const { overview, loading } = useSolar();

  const fmt = (v, decimals = 1) =>
    v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—';

  const fmtINR = (v) =>
    v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-10 animate-fade-in">
      
      {/* Friendly Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-100 dark:bg-void-800/40 border border-slate-300 dark:border-void-700 p-8 rounded-3xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-solar-500 rounded-full blur-[100px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-wide mb-2">
            Good Afternoon.
          </h1>
          <p className="text-slate-600 dark:text-void-200 text-lg">
            Your solar grid is operating efficiently and generating revenue.
          </p>
        </div>

        {/* System Status Badge */}
        <div className="relative z-10 flex items-center gap-3 bg-slate-200 dark:bg-void-900 border border-energy-green/30 py-3 px-6 rounded-2xl shadow-green">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energy-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-energy-green"></span>
          </span>
          <span className="text-sm font-bold font-mono text-energy-green tracking-widest">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* The 3 Most Important Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Current Output"
          value={fmt(overview?.currentPower)}
          unit="kW"
          accent="solar"
          icon="⚡"
          loading={loading}
        />
        <StatCard
          label="Energy Today"
          value={fmt(overview?.todayEnergy)}
          unit="kWh"
          accent="green"
          icon="🔋"
          loading={loading}
        />
        <StatCard
          label="Revenue Today"
          value={fmtINR(overview?.todayRevenue)}
          accent="blue"
          icon="₹"
          loading={loading}
        />
      </div>

      {/* Simplified Live Chart */}
      <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-6 shadow-card">
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-6">Today's Generation Curve</h2>
        <div className="h-[300px]">
          <PowerChart />
        </div>
      </div>

      {/* Call to Action: Navigate to Detailed Dashboard */}
      <div className="flex justify-center pt-4">
        <Link 
          to="/dashboard" 
          className="group relative flex items-center gap-3 bg-slate-300 dark:bg-void-800 hover:bg-slate-400 dark:hover:bg-void-700 border border-slate-400 dark:border-void-600 hover:border-slate-500 dark:hover:border-solar-500/50 text-slate-900 dark:text-white px-8 py-4 rounded-xl font-display font-bold transition-all overflow-hidden">
        >
          <div className="absolute inset-0 bg-solar-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <span className="relative z-10">Open Detailed Dashboard</span>
          <span className="relative z-10 text-solar-400 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

    </div>
  );
}