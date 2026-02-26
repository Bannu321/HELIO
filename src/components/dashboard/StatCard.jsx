import React from "react";
import clsx from "clsx";

export default function StatCard({
  label,
  value,
  unit,
  delta,
  deltaUp,
  accent = "solar",
  icon,
  loading,
}) {
  const accentStyles = {
    solar: {
      bar: "bg-solar-500",
      value: "text-solar-400",
      glow: "border-solar-500/20",
    },
    green: {
      bar: "bg-energy-green",
      value: "text-energy-green",
      glow: "border-energy-green/20",
    },
    blue: {
      bar: "bg-energy-blue",
      value: "text-energy-blue",
      glow: "border-energy-blue/20",
    },
    rose: {
      bar: "bg-energy-rose",
      value: "text-energy-rose",
      glow: "border-energy-rose/20",
    },
  };
  const s = accentStyles[accent] || accentStyles.solar;

  return (
    <div
      className={clsx(
        "card relative overflow-hidden p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-default",
        s.glow,
        "border",
      )}
      role="region"
      aria-label={label}
    >
      {/* Top accent bar */}
      <div className={clsx("absolute top-0 left-0 right-0 h-[2px]", s.bar)} />

      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-mono text-slate-600 dark:text-void-200 tracking-widest uppercase">
          {label}
        </span>
        {icon && (
          <span className="text-xl opacity-60" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 bg-slate-300 dark:bg-void-600 rounded animate-pulse w-2/3" />
          {delta && (
            <div className="h-4 bg-slate-300 dark:bg-void-600 rounded animate-pulse w-1/2" />
          )}
        </div>
      ) : value === null || value === undefined ? (
        <div className="text-slate-500 dark:text-void-300 text-sm">
          No data available
        </div>
      ) : (
        <>
          <div
            className={clsx(
              "font-display font-extrabold text-3xl leading-none",
              s.value,
            )}
          >
            {value}
            {unit && (
              <span className="text-base font-normal text-slate-600 dark:text-void-200 ml-2">
                {unit}
              </span>
            )}
          </div>
          {delta && (
            <div
              className={clsx(
                "text-xs font-mono mt-3",
                deltaUp ? "text-energy-green" : "text-energy-rose",
              )}
            >
              {deltaUp ? "↑" : "↓"} {delta}
            </div>
          )}
        </>
      )}
    </div>
  );
}
