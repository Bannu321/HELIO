import React from "react";
import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from "lucide-react";

const alertsData = [
  {
    id: 1,
    type: "critical",
    title: "Inverter Comm Loss",
    time: "10 mins ago",
    desc: "Lost connection to Inverter A. Attempting reconnect.",
  },
  {
    id: 2,
    type: "warning",
    title: "Soiling Loss Detected",
    time: "2 hours ago",
    desc: "Dust accumulation on Array B reducing output by 2.1%. Maintenance recommended.",
  },
  {
    id: 3,
    type: "info",
    title: "Grid Tariff Updated",
    time: "5 hours ago",
    desc: "DISCOM peak tariff period started. Export profitability increased.",
  },
  {
    id: 4,
    type: "success",
    title: "System Optimal",
    time: "Yesterday",
    desc: "Daily generation exceeded estimation by 4%.",
  },
];

export default function Alerts() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-fade-in">
      <header className="flex justify-between items-end border-b border-slate-300 dark:border-void-700 pb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
            System Alerts
          </h1>
          <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
            Notifications and diagnostics
          </p>
        </div>
        <button className="text-xs font-mono text-slate-600 dark:text-void-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          MARK ALL AS READ
        </button>
      </header>

      <div className="space-y-6">
        {alertsData.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

function AlertRow({ alert }) {
  const config = {
    critical: {
      icon: ShieldAlert,
      color: "text-energy-rose",
      bg: "bg-energy-rose/10",
      border: "border-energy-rose/30",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-energy-amber",
      bg: "bg-energy-amber/10",
      border: "border-energy-amber/30",
    },
    info: {
      icon: Info,
      color: "text-energy-cyan",
      bg: "bg-energy-cyan/10",
      border: "border-energy-cyan/30",
    },
    success: {
      icon: CheckCircle2,
      color: "text-energy-green",
      bg: "bg-energy-green/10",
      border: "border-energy-green/30",
    },
  };

  const { icon: Icon, color, bg, border } = config[alert.type];

  return (
    <div
      className={`flex items-start gap-4 p-5 rounded-2xl border ${border} ${bg} backdrop-blur-sm transition-all hover:bg-opacity-20 bg-slate-50 dark:bg-slate-950`}
    >
      <div className={`mt-1 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`font-display font-bold ${color}`}>{alert.title}</h3>
          <span className="text-xs font-mono text-slate-600 dark:text-void-400">
            {alert.time}
          </span>
        </div>
        <p className="text-sm text-slate-700 dark:text-void-200">
          {alert.desc}
        </p>
      </div>
    </div>
  );
}
