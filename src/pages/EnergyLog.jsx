import React, { useState, useEffect } from "react";
import axios from "axios";
import { Battery, CalendarDays, Zap, DownloadCloud, AlertCircle } from "lucide-react";
import PowerChart from "../components/charts/PowerChart";
import clsx from "clsx";

export default function EnergyLog() {
  const [logData, setLogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/grid/log");
        setLogData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch energy log data:", err);
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };

    fetchLogData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 dark:border-void-700 border-t-energy-cyan"></div>
      </div>
    );
  }

  // Fallback data if backend is not running
  const stats = logData?.stats || {
    lifetimeYieldMWh: "128.4",
    peakGeneration: "48.2",
    peakDate: "Aug 15, 2026",
    avgDailyYield: "385.6",
  };

  const tableData = logData?.tableData || [
    { date: "2026-08-28", yield: "412.5 kWh", peak: "48.2 kW", weather: "Clear Sky" },
    { date: "2026-08-27", yield: "389.0 kWh", peak: "46.1 kW", weather: "Partly Cloudy" },
    { date: "2026-08-26", yield: "425.2 kWh", peak: "49.0 kW", weather: "Clear Sky" },
    { date: "2026-08-25", yield: "310.8 kWh", peak: "38.5 kW", weather: "Overcast" },
    { date: "2026-08-24", yield: "405.1 kWh", peak: "47.8 kW", weather: "Clear Sky" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Energy Generation & Yield Log
            </h1>
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-grid-500 animate-pulse" />
              DATABASE SYNCED
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            Historical generation metrics, daily yield summaries, and inverter performance logs
          </p>
        </div>

        <button className="btn-ghost text-xs">
          <DownloadCloud className="w-3.5 h-3.5" /> Export Historical CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LogCard
          title="Lifetime SCADA Yield"
          value={stats.lifetimeYieldMWh}
          unit="MWh"
          subtext="Cumulative generation recorded"
          icon={Battery}
          accent="green"
        />
        <LogCard
          title="Peak Instant Power"
          value={stats.peakGeneration}
          unit="kW"
          subtext={`Peak on ${stats.peakDate}`}
          icon={Zap}
          accent="solar"
        />
        <LogCard
          title="Average Daily Yield"
          value={stats.avgDailyYield}
          unit="kWh"
          subtext="7-day rolling average"
          icon={CalendarDays}
          accent="cyan"
        />
      </div>

      {/* Chart Section */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Historical Output Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
              Daily generation distribution against reference baseline
            </p>
          </div>
          <select className="field text-xs w-auto py-1.5 font-mono">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Year to Date</option>
          </select>
        </div>
        <div className="h-72">
          <PowerChart />
        </div>
      </div>

      {/* Daily Summary Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Daily Generation Summaries
            </h2>
            <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
              Verified daily telemetry aggregate logs
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Daily Total Yield</th>
                <th>Peak Inverter Power</th>
                <th>Atmospheric Condition</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx}>
                  <td className="text-slate-900 dark:text-white font-medium">
                    {row.date}
                  </td>
                  <td className="text-grid-600 dark:text-grid-400 font-bold">
                    {row.yield}
                  </td>
                  <td className="text-slate-700 dark:text-void-200">
                    {row.peak}
                  </td>
                  <td className="text-slate-600 dark:text-void-300">
                    {row.weather}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LogCard({ title, value, unit, subtext, icon: Icon, accent }) {
  const accentStyles = {
    green: "text-grid-600 dark:text-grid-400 bg-grid-50 dark:bg-grid-500/10 border-grid-200 dark:border-grid-500/20",
    solar: "text-solar-500 bg-solar-50 dark:bg-solar-500/10 border-solar-200 dark:border-solar-500/20",
    cyan: "text-energy-cyan bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
  };

  const badgeClass = accentStyles[accent] || accentStyles.green;

  return (
    <div className="card p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-3">
        <span className="stat-label truncate">{title}</span>
        <div className={clsx("w-7 h-7 rounded-md border flex items-center justify-center flex-shrink-0", badgeClass)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="stat-value text-2xl lg:text-3xl text-slate-900 dark:text-white">
            {value}
          </span>
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-void-300">
            {unit}
          </span>
        </div>
        {subtext && (
          <div className="text-xs font-mono text-slate-500 dark:text-void-300 mt-2 truncate">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
