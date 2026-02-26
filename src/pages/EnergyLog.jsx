import React from 'react';
import { Battery, CalendarDays, Zap, DownloadCloud } from 'lucide-react';
// Assuming you have a BarChart or similar historical chart; we'll reuse PowerChart as a placeholder for now
import PowerChart from '../components/charts/PowerChart'; 

export default function EnergyLog() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-wide">Energy Generation Log</h1>
          <p className="text-sm text-void-300 mt-1 font-mono">Historical yield and performance tracking</p>
        </div>
        <button className="bg-void-800 hover:bg-void-700 border border-void-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <DownloadCloud className="w-4 h-4" /> Export History
        </button>
      </header>

      {/* Historical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LogCard title="Lifetime Yield" value="12.4" unit="MWh" icon={Battery} color="text-energy-green" />
        <LogCard title="Peak Daily Generation" value="45.2" unit="kWh" subtext="Recorded on Feb 12, 2026" icon={Zap} color="text-solar-400" />
        <LogCard title="Avg Daily Yield (Feb)" value="36.8" unit="kWh" subtext="+4.2% vs Jan" icon={CalendarDays} color="text-energy-cyan" />
      </div>

      {/* Historical Chart Section */}
      <div className="bg-void-800 border border-void-700 rounded-2xl p-6 shadow-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-bold text-white">Generation History (Last 7 Days)</h2>
          <select className="bg-void-900 border border-void-700 text-void-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-solar-500">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="h-72">
          {/* We reuse the PowerChart here, but in a real app you might pass a 'type="bar"' or historical data prop */}
          <PowerChart />
        </div>
      </div>

      {/* Simple Daily Log Table */}
      <div className="bg-void-800 border border-void-700 rounded-2xl p-6 shadow-card">
        <h2 className="font-display font-bold text-white mb-4">Daily Summaries</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-void-700 text-void-400 text-xs font-mono uppercase tracking-wider">
                <th className="pb-4 pl-2 font-medium">Date</th>
                <th className="pb-4 font-medium">Total Yield</th>
                <th className="pb-4 font-medium">Peak Power</th>
                <th className="pb-4 font-medium">Weather Condition</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { date: 'Feb 25, 2026', yield: '38.4 kWh', peak: '5.8 kW', weather: 'Clear Sky' },
                { date: 'Feb 24, 2026', yield: '32.1 kWh', peak: '4.9 kW', weather: 'Partly Cloudy' },
                { date: 'Feb 23, 2026', yield: '41.0 kWh', peak: '6.1 kW', weather: 'High Irradiance' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-void-700/50 hover:bg-void-700/20 transition-colors">
                  <td className="py-4 pl-2 text-void-100">{row.date}</td>
                  <td className="py-4 text-energy-green font-bold">{row.yield}</td>
                  <td className="py-4 text-void-200">{row.peak}</td>
                  <td className="py-4 text-void-300">{row.weather}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LogCard({ title, value, unit, subtext, icon: Icon, color }) {
  return (
    <div className="bg-void-800/50 border border-void-700 rounded-2xl p-6 shadow-card flex items-start gap-4">
      <div className={`p-3 bg-void-900 border border-void-700 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-void-300 text-sm font-medium">{title}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-display font-bold text-white">{value}</span>
          <span className="text-sm font-mono text-void-400">{unit}</span>
        </div>
        {subtext && <p className="text-xs text-void-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}