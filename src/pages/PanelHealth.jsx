import React from "react";
import PanelGrid from "../components/dashboard/PanelGrid";
import { useSolar } from "../context/SolarContext";
import { Wrench, ShieldCheck, AlertTriangle, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function PanelHealth() {
  const { overview, loading } = useSolar();

  const gridEfficiency = overview?.gridEfficiency || 92.4;
  const isOptimal = gridEfficiency >= 90;
  const isCritical = gridEfficiency < 75;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hardware & PV Array Health
            </h1>
            <span className={isOptimal ? "live-badge" : "warning-badge"}>
              <span className={clsx("w-1.5 h-1.5 rounded-full", isOptimal ? "bg-grid-500 animate-pulse" : "bg-solar-500")} />
              {isOptimal ? "STRING SENSORS OPTIMAL" : "ATTENTION REQUIRED"}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            Individual module telemetry, bypass diode diagnostics, and soiling loss detection
          </p>
        </div>

        <button className="btn-ghost text-xs">
          <Wrench className="w-3.5 h-3.5 text-solar-500" />
          Schedule Robot Wash
        </button>
      </div>

      {/* Health Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* System Status Card */}
        <div className="card p-5 flex items-start gap-4">
          <div
            className={clsx(
              "p-3 rounded-lg border flex-shrink-0",
              isCritical
                ? "bg-rose-50 dark:bg-rose-500/10 text-energy-rose border-rose-200 dark:border-rose-500/20"
                : isOptimal
                ? "bg-grid-50 dark:bg-grid-500/10 text-grid-600 dark:text-grid-400 border-grid-200 dark:border-grid-500/20"
                : "bg-solar-50 dark:bg-solar-500/10 text-solar-600 dark:text-solar-400 border-solar-200 dark:border-solar-500/20"
            )}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="stat-label">Array Health Status</span>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
              {isCritical ? "Degraded" : isOptimal ? "Optimal Condition" : "Sub-Optimal"}
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
              {loading ? "Scanning modules..." : `${overview?.panelsActive || 24}/24 Panels Online`}
            </p>
          </div>
        </div>

        {/* Action Required Card */}
        <div className="card p-5 flex items-start gap-4">
          <div className="p-3 rounded-lg border bg-solar-50 dark:bg-solar-500/10 text-solar-600 dark:text-solar-400 border-solar-200 dark:border-solar-500/20 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="stat-label">Preventative Maintenance</span>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
              Soiling Drop (2.1%)
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
              Array B dust accumulation detected
            </p>
          </div>
        </div>

        {/* Average Efficiency Card */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <span className="stat-label">Average Photovoltaic Yield</span>
            <div className="flex items-baseline justify-between mt-1 mb-2">
              <span className="stat-value text-2xl text-slate-900 dark:text-white">
                {loading ? "—" : `${gridEfficiency.toFixed(1)}%`}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-void-400">
                Target: 95.0%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-void-700 rounded-full h-2 overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full transition-all duration-500",
                gridEfficiency >= 90 ? "bg-grid-500" : gridEfficiency >= 80 ? "bg-solar-500" : "bg-energy-rose"
              )}
              style={{ width: `${Math.min(gridEfficiency, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Live Physical Panel Array Map */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Physical PV String Heatmap
            </h2>
            <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
              Click individual panels to inspect string voltage, current output, and bypass state
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-void-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-grid-500" /> &gt;90% Optimal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-solar-500" /> 75–90% Dust Loss
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-energy-rose" /> &lt;75% Shaded/Fault
            </span>
          </div>
        </div>

        <PanelGrid />
      </div>
    </div>
  );
}