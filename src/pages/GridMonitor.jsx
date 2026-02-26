import React from 'react';
import EnergyRevenueChart from '../components/charts/EnergyRevenueChart';
import { useSolar } from '../context/SolarContext';
import { Activity, Zap, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function GridMonitor() {
  const { overview, loading } = useSolar();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <header>
        <h1 className="font-display text-2xl font-extrabold text-white tracking-wide">Grid Monitor</h1>
        <p className="text-sm text-void-300 mt-1 font-mono">Live electrical parameters and net metering</p>
      </header>

      {/* Technical Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TechCard title="Grid Frequency" value="50.02" unit="Hz" icon={Activity} color="text-energy-cyan" />
        <TechCard title="Grid Voltage" value="231.4" unit="V" icon={Zap} color="text-solar-400" />
        <TechCard title="Exporting" value="4.2" unit="kW" icon={ArrowUpFromLine} color="text-energy-green" />
        <TechCard title="Importing" value="0.0" unit="kW" icon={ArrowDownToLine} color="text-energy-rose" />
      </div>

      {/* Detailed Energy Chart */}
      <div className="bg-void-800 border border-void-700 rounded-2xl p-6 shadow-card">
        <h2 className="font-display font-bold text-white mb-4">Energy Flow & Revenue Mapping</h2>
        <div className="h-96">
          <EnergyRevenueChart />
        </div>
      </div>

      {/* Live IoT Log (Placeholder for your MQTT stream) */}
      <div className="bg-void-800 border border-void-700 rounded-2xl p-6 shadow-card">
        <h2 className="font-display font-bold text-white mb-4">Latest Inverter Telemetry</h2>
        <div className="space-y-2 font-mono text-sm">
          {[
            { time: '14:32:01', msg: 'Grid sync verified. Frequency stable.', status: 'text-energy-green' },
            { time: '14:30:45', msg: 'MPPT Tracker 2 efficiency optimized.', status: 'text-energy-cyan' },
            { time: '14:15:00', msg: 'Scheduled API sync completed.', status: 'text-void-300' },
          ].map((log, i) => (
            <div key={i} className="flex gap-4 border-b border-void-700/50 pb-2 last:border-0">
              <span className="text-void-400">{log.time}</span>
              <span className={log.status}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Minimal technical card for the Grid page
function TechCard({ title, value, unit, icon: Icon, color }) {
  return (
    <div className="bg-void-800/50 border border-void-700 rounded-xl p-5 flex items-center justify-between">
      <div>
        <h3 className="text-void-300 text-xs font-bold tracking-widest mb-1">{title.toUpperCase()}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-display font-bold text-white">{value}</span>
          <span className="text-xs font-mono text-void-400">{unit}</span>
        </div>
      </div>
      <Icon className={`w-8 h-8 opacity-50 ${color}`} />
    </div>
  );
}