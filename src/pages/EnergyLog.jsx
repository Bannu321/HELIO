import React, { useState, useEffect } from "react";
import axios from "axios";
import { Battery, CalendarDays, Zap, DownloadCloud } from "lucide-react";
import PowerChart from "../components/charts/PowerChart";

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
        // Catch the error and stop the spinner
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };

    fetchLogData();
  }, []);

  // 1. Show spinner ONLY while actively loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-energy-cyan"></div>
      </div>
    );
  }

  // 2. Show the exact error if it failed!
  if (error || !logData) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="text-energy-rose text-xl font-bold">
          âš ï¸ Connection Failed
        </div>
        <div className="text-slate-600 dark:text-void-300 bg-slate-100 dark:bg-void-800 p-4 rounded-lg font-mono text-sm">
          {error || "No data received from backend"}
        </div>
      </div>
    );
  }

  const { stats, tableData } = logData;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
            Energy Generation Log
          </h1>
          <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
            Historical yield and performance tracking
          </p>
        </div>
        <button className="bg-slate-300 dark:bg-void-800 hover:bg-slate-400 dark:hover:bg-void-700 border border-slate-400 dark:border-void-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <DownloadCloud className="w-4 h-4" /> Export History
        </button>
      </header>

      {/* Historical Stats - Now entirely database driven */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LogCard
          title="Lifetime Yield"
          value={stats.lifetimeYieldMWh}
          unit="MWh"
          icon={Battery}
          color="text-energy-green"
        />
        <LogCard
          title="Peak Daily Generation"
          value={stats.peakGeneration}
          unit="kW"
          subtext={`Recorded on ${stats.peakDate}`}
          icon={Zap}
          color="text-solar-400"
        />
        <LogCard
          title="Avg Daily Yield (Last 7 Days)"
          value={stats.avgDailyYield}
          unit="kWh"
          subtext="Based on recent database logs"
          icon={CalendarDays}
          color="text-energy-cyan"
        />
      </div>

      {/* Historical Chart Section */}
      <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-6 shadow-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-bold text-slate-900 dark:text-white">
            Generation History (Last 7 Days)
          </h2>
          <select className="bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-700 text-slate-700 dark:text-void-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-solar-500">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="h-72">
          <PowerChart />
        </div>
      </div>

      {/* Dynamic Daily Log Table */}
      <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-6 shadow-card">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">
          Daily Summaries
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 dark:border-void-700 text-slate-600 dark:text-void-400 text-xs font-mono uppercase tracking-wider">
                <th className="pb-4 pl-2 font-medium">Date</th>
                <th className="pb-4 font-medium">Total Yield</th>
                <th className="pb-4 font-medium">Peak Power</th>
                <th className="pb-4 font-medium">Weather Condition</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tableData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-200 dark:border-void-700/50 hover:bg-slate-100 dark:hover:bg-void-700/20 transition-colors"
                >
                  <td className="py-4 pl-2 text-slate-800 dark:text-void-100">
                    {row.date}
                  </td>
                  <td className="py-4 text-energy-green font-bold">
                    {row.yield}
                  </td>
                  <td className="py-4 text-slate-600 dark:text-void-200">
                    {row.peak}
                  </td>
                  <td className="py-4 text-slate-600 dark:text-void-300">
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

function LogCard({ title, value, unit, subtext, icon: Icon, color }) {
  return (
    <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-2xl p-6 shadow-card flex items-start gap-4">
      <div
        className={`p-3 bg-slate-200 dark:bg-void-900 border border-slate-300 dark:border-void-700 rounded-xl ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-slate-700 dark:text-void-300 text-sm font-medium">
          {title}
        </h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">
            {value}
          </span>
          <span className="text-sm font-mono text-slate-600 dark:text-void-400">
            {unit}
          </span>
        </div>
        {subtext && (
          <p className="text-xs text-slate-600 dark:text-void-400 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
