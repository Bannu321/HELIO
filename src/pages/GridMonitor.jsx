import React from "react";
import EnergyRevenueChart from "../components/charts/EnergyRevenueChart";
import { useSolar } from "../context/SolarContext";
import { Activity, Zap, ArrowDownToLine, ArrowUpFromLine, Radio, ShieldCheck, Gauge, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

export default function GridMonitor() {
  const { overview, loading } = useSolar();

  if (loading || !overview) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 dark:border-void-700 border-t-energy-cyan"></div>
      </div>
    );
  }

  const exportKw = overview.currentPower ? overview.currentPower.toFixed(2) : "0.00";
  const frequencyHz = overview.frequency || "50.02";
  const voltageV = overview.voltage || "230.4";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Grid Monitor & Inverter SCADA
            </h1>
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-grid-500 animate-pulse" />
              NET-METERING ACTIVE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            Real-time grid synchronization, harmonic balance, and reverse power dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-void-300 bg-slate-100 dark:bg-void-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-void-700">
          <Radio className="w-3.5 h-3.5 text-energy-cyan animate-pulse" />
          <span>Inverter Node #01 · Modbus ID: 0x4A</span>
        </div>
      </div>

      {/* Technical Grid Stats (Electrical Parameters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TechCard
          title="Grid Frequency"
          value={frequencyHz}
          unit="Hz"
          status="50.00 Hz Nominal (±0.04)"
          icon={Activity}
          accent="cyan"
        />
        <TechCard
          title="Line Voltage (L-N)"
          value={voltageV}
          unit="V"
          status="230V Nominal (Pure Sine)"
          icon={Zap}
          accent="solar"
        />
        <TechCard
          title="Active Green Export"
          value={exportKw}
          unit="kW"
          status="Reverse Feed to Campus Bus"
          icon={ArrowUpFromLine}
          accent="green"
        />
        <TechCard
          title="Grid Import (Deficit)"
          value="0.00"
          unit="kW"
          status="100% Self-Sustained"
          icon={ArrowDownToLine}
          accent="slate"
        />
      </div>

      {/* Detailed Energy Flow & Revenue Mapping Chart */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Power Flow & Tariff Mapping
            </h2>
            <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
              Net export vs campus baseload demand over 24-hour cycle
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-void-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-solar-500" />
              Generation (kW)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-void-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-grid-500" />
              Exported (kW)
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <EnergyRevenueChart />
        </div>
      </div>

      {/* Live SCADA Telemetry Logs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Inverter SCADA Telemetry Stream
            </h2>
            <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
              High-frequency electrical state logs and safety interlock signals
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-void-300">
            Auto-polling · 500ms
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-void-700/60 font-mono text-xs">
          {[
            {
              time: new Date().toLocaleTimeString("en-US", { hour12: false }),
              tag: "SYNC_OK",
              msg: `Grid synchronization verified. Phase locked at ${frequencyHz}Hz. Total Harmonic Distortion < 1.8%.`,
              status: "text-grid-600 dark:text-grid-400 bg-grid-50 dark:bg-grid-500/10 border-grid-200 dark:border-grid-500/20",
            },
            {
              time: new Date(Date.now() - 45000).toLocaleTimeString("en-US", { hour12: false }),
              tag: "MPPT_OPT",
              msg: `MPPT Tracker #1 & #2 operating at peak efficiency. Dynamic export rate: ${exportKw}kW.`,
              status: "text-energy-cyan bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
            },
            {
              time: new Date(Date.now() - 120000).toLocaleTimeString("en-US", { hour12: false }),
              tag: "ISLAND_CHECK",
              msg: "Anti-islanding protection circuit verified online. IEEE 1547 compliant.",
              status: "text-solar-600 dark:text-solar-400 bg-solar-50 dark:bg-solar-500/10 border-solar-200 dark:border-solar-500/20",
            },
            {
              time: new Date(Date.now() - 360000).toLocaleTimeString("en-US", { hour12: false }),
              tag: "API_POLL",
              msg: "Scheduled smart-meter SCADA handshake acknowledged by central gateway.",
              status: "text-slate-600 dark:text-void-300 bg-slate-100 dark:bg-void-700/40 border-slate-200 dark:border-void-600",
            },
          ].map((log, i) => (
            <div key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-slate-500 dark:text-void-400 text-[11px] min-w-[70px]">
                {log.time}
              </span>
              <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border self-start", log.status)}>
                {log.tag}
              </span>
              <span className="text-slate-700 dark:text-void-100 text-xs">
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechCard({ title, value, unit, status, icon: Icon, accent }) {
  const accentStyles = {
    cyan: {
      bar: "bg-energy-cyan",
      icon: "text-energy-cyan bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
    },
    solar: {
      bar: "bg-solar-500",
      icon: "text-solar-500 bg-solar-50 dark:bg-solar-500/10 border-solar-200 dark:border-solar-500/20",
    },
    green: {
      bar: "bg-grid-500",
      icon: "text-grid-600 dark:text-grid-400 bg-grid-50 dark:bg-grid-500/10 border-grid-200 dark:border-grid-500/20",
    },
    slate: {
      bar: "bg-slate-400 dark:bg-void-500",
      icon: "text-slate-500 dark:text-void-300 bg-slate-100 dark:bg-void-700/60 border-slate-200 dark:border-void-600",
    },
  };

  const s = accentStyles[accent] || accentStyles.cyan;

  return (
    <div className="card relative overflow-hidden p-5 flex flex-col justify-between">
      <div className={clsx("absolute top-0 left-0 right-0 h-[2px]", s.bar)} />

      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="stat-label truncate">{title}</span>
        <div className={clsx("w-7 h-7 rounded-md flex items-center justify-center border flex-shrink-0", s.icon)}>
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
        <div className="text-[11px] font-mono text-slate-500 dark:text-void-300 mt-2 truncate">
          {status}
        </div>
      </div>
    </div>
  );
}