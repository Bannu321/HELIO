import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useSolar } from "../../context/SolarContext";

const navGroups = [
  {
    label: "Overview",
    items: [
      { icon: "◉", label: "Dashboard", path: "/dashboard" },
      { icon: "⚡", label: "Grid Monitor", path: "/grid" },
      { icon: "☀", label: "Panel Health", path: "/panels" },
    ],
  },
  {
    label: "Reports",
    items: [
      { icon: "₹", label: "Revenue", path: "/revenue" },
      { icon: "📊", label: "Energy Log", path: "/energy" },
      { icon: "🌦", label: "Weather AI", path: "/weather" },
      { icon: "🔮", label: "Estimation", path: "/estimation" },
    ],
  },
  {
    label: "Config",
    items: [
      { icon: "🔔", label: "Alerts", path: "/alerts" },
      { icon: "⚙", label: "Settings", path: "/settings" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { overview } = useSolar();

  return (
    <aside className="w-60 flex-shrink-0 border-r border-slate-300 dark:border-void-500 bg-white dark:bg-void-800 backdrop-blur-sm flex flex-col transition-colors duration-300">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-200 dark:border-void-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-solar-500 animate-glow shadow-solar" />
            <div className="absolute inset-[-6px] rounded-full border border-dashed border-solar-500/30 animate-spin-slow" />
          </div>
          <div>
            <div className="font-display text-lg font-extrabold tracking-[4px] text-solar-500 dark:text-solar-400">
              <button
                onClick={() => {
                  navigate("/");
                }}
              >
                HELIO
              </button>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-void-200 tracking-[2px] mt-0.5">
              SOLAR INTELLIGENCE
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-3 py-1.5 text-[10px] text-slate-500 dark:text-void-300 font-mono tracking-[2px] uppercase mb-1">
              {group.label}
            </div>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={clsx(
                    "w-full text-left mb-0.5 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm",
                    isActive
                      ? "bg-solar-50 dark:bg-solar-500/20 text-solar-600 dark:text-solar-400 border border-solar-200 dark:border-solar-500/30"
                      : "text-slate-700 dark:text-void-100 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-void-600 border border-transparent",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="w-5 text-center text-base flex-shrink-0">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto text-solar-600 dark:text-solar-400">
                      →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Grid Health Widget */}
      <div className="px-3 pb-5">
        <div className="card-glow p-4 rounded-xl">
          <div className="text-[10px] text-slate-600 dark:text-void-200 font-mono tracking-widest mb-3">
            GRID HEALTH
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-700 dark:text-void-100">
                  Efficiency
                </span>
                <span className="text-xs font-mono text-solar-600 dark:text-solar-400">
                  {overview?.gridEfficiency ?? "—"}%
                </span>
              </div>
              <div className="progress-track h-1.5">
                <div
                  className="progress-solar"
                  style={{ width: `${overview?.gridEfficiency ?? 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-700 dark:text-void-100">
                  Battery
                </span>
                <span className="text-xs font-mono text-energy-blue">
                  {overview?.batteryLevel ?? "—"}%
                </span>
              </div>
              <div className="progress-track h-1.5">
                <div
                  className="progress-blue"
                  style={{ width: `${overview?.batteryLevel ?? 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-energy-green animate-blink" />
            <span className="text-[10px] text-slate-600 dark:text-void-200 font-mono">
              {overview?.panelsActive ?? "—"} panels active ·{" "}
              {overview?.panelsFault ?? 0} faults
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
