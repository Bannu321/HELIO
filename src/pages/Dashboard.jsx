import React from 'react';
import StatCard from '../components/dashboard/StatCard';
import PowerChart from '../components/charts/PowerChart';
import EnergyRevenueChart from '../components/charts/EnergyRevenueChart';
import WeatherWidget from '../components/weather/WeatherWidget';
import RevenueTable from '../components/reports/RevenueTable';
import EstimationPanel from '../components/dashboard/EstimationPanel';
import PanelGrid from '../components/dashboard/PanelGrid';
import { useSolar } from '../context/SolarContext';

export default function Dashboard() {
  const { overview, loading } = useSolar();

  const fmt = (v, decimals = 1) =>
    v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : '—';

  const fmtINR = (v) =>
    v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

  return (
    <div className="p-6 space-y-5">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-extrabold text-white tracking-wide">Solar Grid Dashboard</h1>
          <p className="text-xs text-void-200 mt-0.5 font-mono">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-void-200">
          <span className="text-solar-400">⚡</span>
          CO₂ Saved Today:{' '}
          <span className="text-energy-green font-bold">{overview?.co2Saved ?? '—'} t</span>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Current Power"
          value={fmt(overview?.currentPower)}
          unit="kW"
          delta="+3.2% from last hour"
          deltaUp
          accent="solar"
          icon="⚡"
          loading={loading}
        />
        <StatCard
          label="Today's Energy"
          value={fmt(overview?.todayEnergy)}
          unit="kWh"
          delta="+12% vs daily avg"
          deltaUp
          accent="green"
          icon="🔋"
          loading={loading}
        />
        <StatCard
          label="Revenue Today"
          value={fmtINR(overview?.todayRevenue)}
          delta="On track for ₹6,200"
          deltaUp
          accent="blue"
          icon="₹"
          loading={loading}
        />
        <StatCard
          label="Monthly Total"
          value={fmtINR(overview?.monthlyRevenue)}
          delta="+8.4% vs last month"
          deltaUp
          accent="solar"
          icon="📈"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <PowerChart />
        </div>
        <div>
          <WeatherWidget />
        </div>
      </div>

      {/* Energy + Revenue chart row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <EnergyRevenueChart />
        </div>
        <div>
          <EstimationPanel />
        </div>
      </div>

      {/* Revenue Table */}
      <RevenueTable />

      {/* Panel Grid */}
      <PanelGrid />

      {/* Architecture strip */}
      <div className="card p-5">
        <div className="font-display text-sm font-bold text-white mb-1">System Architecture</div>
        <div className="text-xs text-void-200 mb-4">Data flow · MERN stack integration</div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {[
            { icon:'☀️', layer:'INPUT',     name:'Solar Array',   sub:'24 × 400W panels' },
            { icon:'⚡', layer:'CONVERT',   name:'Inverter',      sub:'DC → AC 3-phase' },
            { icon:'🔋', layer:'STORE',     name:'Battery Bank',  sub:'48kWh LiFePO₄' },
            { icon:'📡', layer:'TRANSMIT',  name:'IoT Gateway',   sub:'MQTT + REST' },
            { icon:'🟢', layer:'BACKEND',   name:'Node.js API',   sub:'Express + MongoDB' },
            { icon:'⚛', layer:'FRONTEND',  name:'React App',     sub:'Tailwind + Recharts' },
            { icon:'📊', layer:'YOU ARE',   name:'HELIO UI',      sub:'This dashboard', highlight: true },
          ].map((node, i, arr) => (
            <React.Fragment key={node.name}>
              <div className={`flex flex-col items-center text-center px-3 py-3 rounded-xl border transition-all ${
                node.highlight
                  ? 'bg-solar-500/10 border-solar-500/30 flex-1'
                  : 'bg-void-600/40 border-void-500 hover:bg-void-600/70 flex-1'
              }`}>
                <div className="text-xl mb-1">{node.icon}</div>
                <div className="text-[8px] font-mono text-void-300 tracking-widest">{node.layer}</div>
                <div className={`text-xs font-display font-bold mt-0.5 ${node.highlight ? 'text-solar-400' : 'text-white'}`}>{node.name}</div>
                <div className="text-[9px] text-void-200 mt-0.5">{node.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="text-void-400 text-sm font-mono animate-[arrow-flow_1.5s_ease-in-out_infinite] flex-shrink-0">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
