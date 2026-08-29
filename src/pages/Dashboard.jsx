import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/dashboard/StatCard";
import PowerChart from "../components/charts/PowerChart";
import WeatherWidget from "../components/weather/WeatherWidget";
import { useSolar } from "../context/SolarContext";
import {
  Sun,
  BatteryCharging,
  IndianRupee,
  Wrench,
  Zap,
  Activity,
  ArrowRight,
  Leaf,
  Cpu,
  Database,
  Network,
  Radio,
  Sparkles,
  Layers,
  X,
  TreePine,
  Factory,
  BrainCircuit,
  ShieldAlert,
  TrendingUp,
  Plug
} from "lucide-react";
import clsx from "clsx";
import { fetchAIDecision } from "../services/api";

export default function Dashboard() {
  const { overview, loading } = useSolar();
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [aiDecision, setAiDecision] = useState(null);

  // Poll AI decision every 60s; fire immediately on mount
  useEffect(() => {
    const load = () => fetchAIDecision().then(d => { if (d) setAiDecision(d); });
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const fmt = (v, decimals = 1) =>
    v != null
      ? Number(v).toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : "—";

  const fmtINR = (v) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  // Calculate CO2 avoided (India grid emission factor ~0.82 kg CO2/kWh)
  const co2SavedKg =
    overview?.co2Saved ??
    (overview?.todayEnergy ? overview.todayEnergy * 0.82 : 0);
  const co2SavedTonnes = (co2SavedKg / 1000).toFixed(3);

  const panelHealthVal = overview?.panelsFault > 0 ? (100 - (overview.panelsFault / (overview.panelsActive || 24)) * 100).toFixed(1) : "99.4";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* ── Top Header & System Status ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Overview
            </h1>
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-grid-500 animate-pulse" />
              MICROGRID ACTIVE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })} · Real-time SCADA Telemetry
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Carbon Footprint Avoidance Badge */}
          <button 
            onClick={() => setShowImpactModal(true)}
            className="flex items-center gap-2.5 bg-grid-50/80 dark:bg-grid-500/10 border border-grid-200 dark:border-grid-500/20 px-3.5 py-2 rounded-lg text-xs font-mono hover:bg-grid-100 dark:hover:bg-grid-500/20 transition-colors"
          >
            <Leaf className="w-4 h-4 text-grid-600 dark:text-grid-400 flex-shrink-0" />
            <div>
              <span className="text-slate-600 dark:text-void-300">CO₂ Avoided: </span>
              <span className="font-bold text-grid-700 dark:text-grid-400">
                {co2SavedTonnes} t
              </span>
            </div>
          </button>

          <Link
            to="/grid-community"
            className="btn-ghost text-xs"
          >
            <Network className="w-3.5 h-3.5 text-energy-cyan" />
            P2P Sandbox
          </Link>
        </div>
      </div>

      {/* ── Primary KPI Metrics (The Vital Pulse) ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/grid" className="block outline-none focus-visible:ring-2 focus-visible:ring-solar-500 rounded-xl">
          <StatCard
            label="Instant Power Flow"
            value={fmt(overview?.currentPower)}
            unit="kW"
            delta="+3.2% vs 1h ago"
            deltaUp={true}
            accent="solar"
            icon={Sun}
            loading={loading}
            variant="hero"
          />
        </Link>

        <Link to="/energy" className="block outline-none focus-visible:ring-2 focus-visible:ring-grid-500 rounded-xl">
          <StatCard
            label="Today's Generation"
            value={fmt(overview?.todayEnergy)}
            unit="kWh"
            delta="+12.4% vs daily avg"
            deltaUp={true}
            accent="green"
            icon={Zap}
            loading={loading}
          />
        </Link>

        <Link to="/revenue" className="block outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-xl">
          <StatCard
            label="Gross Savings / ROI"
            value={fmtINR(overview?.todayRevenue || (overview?.todayEnergy ? overview.todayEnergy * 15.2 : 0))}
            delta="Tariff ₹15.20/unit"
            deltaUp={true}
            accent="blue"
            icon={IndianRupee}
            loading={loading}
          />
        </Link>

        <Link to="/panels" className="block outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-xl">
          <StatCard
            label="PV Array Health"
            value={panelHealthVal}
            unit="%"
            delta={overview?.panelsFault > 0 ? `${overview.panelsFault} panel fault flagged` : "Optimal string health"}
            deltaUp={!(overview?.panelsFault > 0)}
            accent={overview?.panelsFault > 0 ? "rose" : "green"}
            icon={Wrench}
            loading={loading}
          />
        </Link>
      </div>

      {/* ── AI Energy Commander Panel ───────────────────────────── */}
      {aiDecision && (() => {
        const STRAT = {
          BATTERY_PRIORITY: { label: 'Battery Priority', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: BatteryCharging },
          TRADE:            { label: 'P2P Trading',       color: 'text-grid-400',  bg: 'bg-grid-500/10 border-grid-500/20',  icon: TrendingUp },
          GRID_IMPORT:      { label: 'Grid Import',       color: 'text-rose-400',  bg: 'bg-rose-500/10 border-rose-500/20',  icon: Plug },
          BALANCED:         { label: 'Balanced',          color: 'text-sky-400',   bg: 'bg-sky-500/10 border-sky-500/20',    icon: Activity },
        };
        const cfg = STRAT[aiDecision.strategy] || STRAT.BALANCED;
        const Icon = cfg.icon;
        return (
          <Link to="/flow" className="block">
            <div className="card p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-violet-500/40 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg flex-shrink-0">
                  <BrainCircuit className="w-5 h-5 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">AI Energy Commander</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    {aiDecision.override_greedy && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Override Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-void-300 mt-0.5 truncate">{aiDecision.primary_action}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-void-400 flex-shrink-0">
                <span className="hidden md:block">{Math.round((aiDecision.confidence || 0) * 100)}% confidence</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        );
      })()}

      {/* ── Main Analytical Views (Charts & Environment) ──────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Real-time Generation Timeline */}
        <div className="xl:col-span-2 card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Live Generation Timeline
              </h2>
              <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
                MPPT active power curve vs grid dispatch limit
              </p>
            </div>
            <Link
              to="/estimation"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-solar-600 dark:text-solar-400 hover:text-solar-700 dark:hover:text-solar-300 transition-colors"
            >
              AI Forecast <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[300px]">
            <PowerChart />
          </div>
        </div>

        {/* Environmental & Solar Weather Widget */}
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Solar Environment
              </h2>
              <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
                Irradiance, ambient temp, & UV index
              </p>
            </div>
            <Link
              to="/weather"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-energy-cyan hover:text-cyan-400 transition-colors"
            >
              Sensors <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1">
            <WeatherWidget />
          </div>
        </div>
      </div>

      {/* ── System Architecture & Node Pipeline ────────────────────── */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              End-to-End System Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
              Live telemetry pipeline · Edge Sensors → Cloud Ingestion → AI Forecasting Engine
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-grid-600 dark:text-grid-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-grid-500 animate-pulse" />
            6 / 6 NODES HEALTHY
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              icon: Sun,
              stage: "01. GENERATE",
              name: "PV Array",
              meta: "24 × 400W Monocrystalline",
              accent: "text-solar-500 bg-solar-50 dark:bg-solar-500/10 border-solar-200 dark:border-solar-500/20",
            },
            {
              icon: BatteryCharging,
              stage: "02. STORE",
              name: "BESS Storage",
              meta: "48kWh LiFePO4 Rack",
              accent: "text-energy-blue bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
            },
            {
              icon: Radio,
              stage: "03. INGEST",
              name: "IoT Gateway",
              meta: "MQTT + Modbus RS-485",
              accent: "text-slate-700 dark:text-void-200 bg-slate-100 dark:bg-void-700/60 border-slate-200 dark:border-void-600",
            },
            {
              icon: Database,
              stage: "04. BACKEND",
              name: "Node API",
              meta: "Express + MongoDB Cluster",
              accent: "text-slate-700 dark:text-void-200 bg-slate-100 dark:bg-void-700/60 border-slate-200 dark:border-void-600",
            },
            {
              icon: Cpu,
              stage: "05. AI CORE",
              name: "Python ML",
              meta: "Prophet + Neural Forecast",
              accent: "text-energy-cyan bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
            },
            {
              icon: Layers,
              stage: "06. CLIENT",
              name: "HELIO UI",
              meta: "Vite + Tailwind + Recharts",
              accent: "text-grid-600 dark:text-grid-400 bg-grid-50 dark:bg-grid-500/10 border-grid-200 dark:border-grid-500/20",
            },
          ].map((node) => {
            const NodeIcon = node.icon;
            return (
              <div
                key={node.name}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-void-700/70 bg-slate-50/50 dark:bg-void-850/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={clsx("w-7 h-7 rounded-md flex items-center justify-center border", node.accent)}>
                      <NodeIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-void-300 font-semibold">
                      {node.stage.split(".")[0]}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">
                    {node.name}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-void-300 truncate mt-2">
                  {node.meta}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sustainability Impact Modal */}
      {showImpactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-void-900 border border-slate-200 dark:border-void-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowImpactModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-void-300 bg-slate-100 dark:bg-void-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-grid-500/20 rounded-lg text-grid-500">
                  <Leaf className="w-6 h-6" />
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  Environmental Impact
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-void-300 mb-8">
                Your microgrid's contribution to sustainability and grid independence.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-void-800/50 border border-slate-100 dark:border-void-700 p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-void-400">
                    <Factory className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">CO₂ Emissions Avoided</span>
                  </div>
                  <div className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                    {co2SavedTonnes} <span className="text-lg text-slate-500 dark:text-void-400">tonnes</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Calculated using India Grid emission factor (0.82 kg/kWh).</p>
                </div>

                <div className="bg-grid-50 dark:bg-grid-500/10 border border-grid-100 dark:border-grid-500/20 p-5 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-grid-700 dark:text-grid-400">
                    <TreePine className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">Equivalent Trees Planted</span>
                  </div>
                  <div className="text-3xl font-display font-bold text-grid-700 dark:text-grid-400">
                    {Math.round(co2SavedKg / 21)} <span className="text-lg opacity-70">trees</span>
                  </div>
                  <p className="text-xs text-grid-700/70 dark:text-grid-400/70 mt-2">Based on avg 21kg CO₂ absorbed per tree annually.</p>
                </div>

                <div className="bg-solar-50 dark:bg-solar-500/10 border border-solar-100 dark:border-solar-500/20 p-5 rounded-xl col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-solar-700 dark:text-solar-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase font-bold tracking-wider">Renewable Energy Mix</span>
                    </div>
                    <div className="text-2xl font-display font-bold text-solar-700 dark:text-solar-400">
                      78.4%
                    </div>
                  </div>
                  <div className="h-2 w-full md:w-64 bg-slate-200 dark:bg-void-700 rounded-full overflow-hidden">
                    <div className="h-full bg-solar-500 rounded-full" style={{ width: '78.4%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}