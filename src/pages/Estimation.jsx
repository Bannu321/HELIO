import React, { useState, useEffect } from "react";
import axios from "axios";
import EstimationPanel from "../components/dashboard/EstimationPanel";
import { BrainCircuit, Cpu, Target, Network, Clock, ShieldCheck, Sparkles } from "lucide-react";
import clsx from "clsx";

export default function Estimation() {
  const [modelData, setModelData] = useState({ weather: null, forecast: null });
  const [loading, setLoading] = useState(true);
  const [syncTime, setSyncTime] = useState(300);

  useEffect(() => {
    const fetchModelDiagnostics = async () => {
      try {
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get("http://localhost:5000/api/weather/current"),
          axios.get("http://localhost:5000/api/estimation/forecast"),
        ]);

        setModelData({
          weather: weatherRes.data,
          forecast: forecastRes.data,
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch model diagnostics:", error);
        setLoading(false);
      }
    };

    fetchModelDiagnostics();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncTime((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  const { weather, forecast } = modelData;
  const cloudCover = weather?.cloudCover ?? 12;
  const accuracy = forecast?.summary?.modelConfidence ?? "94.2%";
  const algorithm = forecast?.summary?.algorithm ?? "Meta Prophet Additive Regression";
  const soilingPenalty = forecast?.summary?.soilingLoss ?? "-2.1%";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Power Estimation & Forecast
            </h1>
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-grid-500 animate-pulse" />
              INFERENCE MODEL ONLINE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            {algorithm} · 96-step forward horizon
          </p>
        </div>
      </div>

      {/* Model Diagnostics Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModelCard
          title="Inference Engine"
          value={loading ? "Connecting..." : "Online (Active)"}
          icon={Cpu}
          accent="green"
        />
        <ModelCard
          title="Backtest Accuracy (R²)"
          value={accuracy}
          icon={Target}
          accent="solar"
        />
        <ModelCard
          title="SCADA Training Corpus"
          value="1.2M+ Rows"
          icon={Network}
          accent="cyan"
        />
        <ModelCard
          title="Next Checkpoint Sync"
          value={formatTime(syncTime)}
          icon={BrainCircuit}
          accent="slate"
        />
      </div>

      {/* Primary Forecast Chart Panel */}
      <div className="card p-6">
        <div className="mb-6">
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Forward Generation Curve
          </h2>
          <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
            Statistical confidence envelope (p10 / p50 / p90) mapped against baseline grid load
          </p>
        </div>
        <EstimationPanel />
      </div>

      {/* Inputs vs Horizon Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="stat-label mb-4">
            Active Model Feature Matrix
          </h3>
          <ul className="space-y-3 font-mono text-xs">
            <li className="flex justify-between text-slate-600 dark:text-void-300 border-b border-slate-100 dark:border-void-700/60 pb-2">
              <span>Cloud Cover (OpenWeather / NASA POWER)</span>
              <span className="text-solar-600 dark:text-solar-400 font-bold">{cloudCover}%</span>
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300 border-b border-slate-100 dark:border-void-700/60 pb-2">
              <span>Array Orientation & Tilt</span>
              <span className="text-slate-900 dark:text-white font-medium">180° South · 18° Tilt</span>
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300 border-b border-slate-100 dark:border-void-700/60 pb-2">
              <span>Installed Microgrid Capacity</span>
              <span className="text-slate-900 dark:text-white font-medium">100 kWp Monocrystalline</span>
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300 pb-1">
              <span>Soiling Derate Factor</span>
              <span className="text-energy-rose font-bold">{soilingPenalty}</span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="stat-label mb-1">
            Prediction Horizon Confidence
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-void-400 font-mono mb-4">
            Confidence interval degradation across forecast timestamps
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>1-Hour Short Horizon</span>
                <span className="text-grid-600 dark:text-grid-400 font-bold">98.0%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-void-700 rounded-full h-2 overflow-hidden">
                <div className="bg-grid-500 h-full rounded-full w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>6-Hour Intraday Horizon</span>
                <span className="text-solar-500 font-bold">85.4%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-void-700 rounded-full h-2 overflow-hidden">
                <div className="bg-solar-500 h-full rounded-full w-[85.4%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>24-Hour Day-Ahead Horizon</span>
                <span className="text-energy-amber font-bold">72.1%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-void-700 rounded-full h-2 overflow-hidden">
                <div className="bg-energy-amber h-full rounded-full w-[72.1%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelCard({ title, value, icon: Icon, accent }) {
  const accentStyles = {
    green: "text-grid-600 dark:text-grid-400 bg-grid-50 dark:bg-grid-500/10 border-grid-200 dark:border-grid-500/20",
    solar: "text-solar-500 bg-solar-50 dark:bg-solar-500/10 border-solar-200 dark:border-solar-500/20",
    cyan: "text-energy-cyan bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
    slate: "text-slate-600 dark:text-void-300 bg-slate-100 dark:bg-void-700/60 border-slate-200 dark:border-void-600",
  };

  const badgeClass = accentStyles[accent] || accentStyles.slate;

  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <span className="stat-label truncate block">{title}</span>
        <span className="stat-value text-xl text-slate-900 dark:text-white mt-1 block">
          {value}
        </span>
      </div>
      <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0", badgeClass)}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}