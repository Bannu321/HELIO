import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Wrench,
  Dna,
  Network,
  IndianRupee,
  Database,
  CloudSun,
  LineChart,
  Zap,
  BatteryCharging,
  Bell,
  Settings,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import clsx from "clsx";
import { useSolar } from "../../context/SolarContext";

const navGroups = [
  {
    label: "Core Operations",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: Activity, label: "Grid Monitor", path: "/grid" },
      { icon: Wrench, label: "Panel Health", path: "/panels" },
      { icon: Network, label: "Grid Community", path: "/grid-community" },
      { icon: Dna, label: "Energy DNA", path: "/energy-dna" },
    ],
  },
  {
    label: "Analytics & Reports",
    items: [
      { icon: IndianRupee, label: "Revenue & ROI", path: "/revenue" },
      { icon: Database, label: "Energy Log", path: "/energy" },
      { icon: CloudSun, label: "Weather AI", path: "/weather" },
      { icon: LineChart, label: "Generation AI", path: "/estimation" },
      { icon: Zap, label: "Power Flow", path: "/flow" },
      { icon: BatteryCharging, label: "BESS Management", path: "/battery" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: Cpu, label: "Hardware & IoT", path: "/hardware" },
      { icon: Bell, label: "Alerts & Faults", path: "/alerts" },
      { icon: Settings, label: "Configuration", path: "/settings" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { overview } = useSolar();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-void-700/80 bg-white/95 dark:bg-void-900/95 backdrop-blur-md flex flex-col transition-colors duration-200 overflow-y-auto">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-200 dark:border-void-700/80">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 text-left w-full group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-solar-500 flex items-center justify-center text-void-950 font-black shadow-sm group-hover:bg-solar-400 transition-colors">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-base font-bold tracking-widest text-slate-900 dark:text-white group-hover:text-solar-500 transition-colors">
              HELIO
            </div>
            <div className="text-[10px] font-mono font-medium tracking-wider text-slate-500 dark:text-void-300">
              GRID INTELLIGENCE
            </div>
          </div>
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[10px] text-slate-500 dark:text-void-300 font-mono tracking-wider uppercase font-semibold">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={clsx(
                      "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors duration-150",
                      isActive
                        ? "bg-solar-50 dark:bg-solar-500/10 text-solar-700 dark:text-solar-400 font-semibold border border-solar-200/80 dark:border-solar-500/20"
                        : "text-slate-600 dark:text-void-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-void-800/80"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={clsx("w-4 h-4 flex-shrink-0", isActive ? "text-solar-600 dark:text-solar-400" : "text-slate-400 dark:text-void-400")} />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-solar-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Microgrid Quick Telemetry Widget */}
      <div className="p-3 border-t border-slate-200 dark:border-void-700/80 bg-slate-50/60 dark:bg-void-850/60">
        <div className="p-3 rounded-lg border border-slate-200/80 dark:border-void-700/60 bg-white dark:bg-void-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-void-300 font-medium">
              Microgrid Status
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-grid-600 dark:text-grid-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-grid-500 animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1 font-mono">
                <span className="text-slate-500 dark:text-void-300">Efficiency</span>
                <span className="font-semibold text-slate-800 dark:text-void-100">
                  {overview?.gridEfficiency ?? "98.2"}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-void-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-solar-500 rounded-full transition-all duration-500"
                  style={{ width: `${overview?.gridEfficiency ?? 98.2}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1 font-mono">
                <span className="text-slate-500 dark:text-void-300">BESS Level</span>
                <span className="font-semibold text-energy-blue">
                  {overview?.batteryLevel ?? "84"}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-void-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-energy-blue rounded-full transition-all duration-500"
                  style={{ width: `${overview?.batteryLevel ?? 84}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-void-700/60 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-void-300">
            <span>{overview?.panelsActive ?? 24} Panels Live</span>
            <span className="text-grid-600 dark:text-grid-400">0 Faults</span>
          </div>
        </div>
      </div>
    </aside>
  );
}