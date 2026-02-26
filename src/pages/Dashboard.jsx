import React from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/dashboard/StatCard";
import PowerChart from "../components/charts/PowerChart";
import WeatherWidget from "../components/weather/WeatherWidget";
import { useSolar } from "../context/SolarContext";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { overview, loading } = useSolar();

  const fmt = (v, decimals = 1) =>
    v != null
      ? Number(v).toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : "—";

  const fmtINR = (v) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-wide">
            System Overview
          </h1>
          <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 py-2 px-4 rounded-xl text-sm font-mono text-slate-700 dark:text-void-200">
          <span className="text-solar-600 dark:text-solar-400">⚡</span>
          CO₂ Saved Today:{" "}
          <span className="text-energy-green font-bold">
            {overview?.co2Saved ?? "—"} t
          </span>
        </div>
      </div>

      {/* KPI Stats Row (The Vital Pulse) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/grid" className="block group">
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
        </Link>
        <Link to="/energy" className="block group">
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
        </Link>
        <Link to="/revenue" className="block group">
          <StatCard
            label="Revenue Today"
            value={fmtINR(overview?.todayRevenue)}
            delta="On track for ₹6,200"
            deltaUp
            accent="blue"
            icon="₹"
            loading={loading}
          />
        </Link>
        <Link to="/panels" className="block group">
          <StatCard
            label="Panel Health"
            value="98.5"
            unit="%"
            delta="Array B needs cleaning"
            deltaUp={false}
            accent="rose"
            icon="🔧"
            loading={loading}
          />
        </Link>
      </div>

      {/* Main Visuals Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-5 shadow-card flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-slate-900 dark:text-white">
              Live Generation
            </h2>
            <Link
              to="/estimation"
              className="text-xs text-solar-400 hover:text-solar-300 flex items-center gap-1 transition-colors"
            >
              AI Forecast <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 min-h-[300px]">
            <PowerChart />
          </div>
        </div>

        {/* Weather Intelligence */}
        <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-5 shadow-card flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display font-bold text-slate-900 dark:text-white">
              Grid Environment
            </h2>
            <Link
              to="/weather"
              className="text-xs text-energy-cyan hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1">
            <WeatherWidget />
          </div>
        </div>
      </div>

      {/* Architecture strip (Kept because it's a great visual anchor) */}
      <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-5 shadow-card mt-8">
        <div className="font-display text-sm font-bold text-slate-900 dark:text-white mb-1">
          System Architecture
        </div>
        <div className="text-xs text-slate-600 dark:text-void-300 mb-5 font-mono">
          Data flow · MERN stack integration
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {[
            {
              icon: "☀️",
              layer: "INPUT",
              name: "Solar Array",
              sub: "24 × 400W panels",
            },
            {
              icon: "⚡",
              layer: "CONVERT",
              name: "Inverter",
              sub: "DC → AC 3-phase",
            },
            {
              icon: "🔋",
              layer: "STORE",
              name: "Battery Bank",
              sub: "48kWh LiFePO₄",
            },
            {
              icon: "📡",
              layer: "TRANSMIT",
              name: "IoT Gateway",
              sub: "MQTT + REST",
            },
            {
              icon: "🟢",
              layer: "BACKEND",
              name: "Node.js API",
              sub: "Express + MongoDB",
            },
            {
              icon: "⚛",
              layer: "FRONTEND",
              name: "React App",
              sub: "Tailwind + Recharts",
            },
            {
              icon: "📊",
              layer: "YOU ARE",
              name: "HELIO UI",
              sub: "This dashboard",
              highlight: true,
            },
          ].map((node, i, arr) => (
            <React.Fragment key={node.name}>
              <div
                className={`flex flex-col items-center text-center px-3 py-3 rounded-xl border transition-all ${
                  node.highlight
                    ? "bg-solar-500/10 border-solar-500/30 flex-1"
                    : "bg-slate-200 dark:bg-void-900 border-slate-300 dark:border-void-700 flex-1"
                }`}
              >
                <div className="text-xl mb-1">{node.icon}</div>
                <div className="text-[9px] font-mono text-slate-600 dark:text-void-400 tracking-widest">
                  {node.layer}
                </div>
                <div
                  className={`text-xs font-display font-bold mt-1 ${node.highlight ? "text-solar-600 dark:text-solar-400" : "text-slate-800 dark:text-void-100"}`}
                >
                  {node.name}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div className="text-slate-400 dark:text-void-500 text-sm font-mono flex-shrink-0">
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
