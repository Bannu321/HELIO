import React from "react";
import clsx from "clsx";

export default function StatCard({
  label,
  value,
  unit,
  delta,
  deltaUp,
  accent = "solar",
  icon: Icon,
  loading,
  subtitle,
  variant = "default",
}) {
  const accentStyles = {
    solar: {
      bar: "bg-solar-500",
      iconBg: "bg-solar-50 dark:bg-solar-500/10 text-solar-600 dark:text-solar-400 border-solar-200 dark:border-solar-500/20",
      glow: "hover:border-solar-500/40",
      valueColor: "text-slate-900 dark:text-white",
    },
    green: {
      bar: "bg-grid-500",
      iconBg: "bg-grid-50 dark:bg-grid-500/10 text-grid-600 dark:text-grid-400 border-grid-200 dark:border-grid-500/20",
      glow: "hover:border-grid-500/40",
      valueColor: "text-slate-900 dark:text-white",
    },
    blue: {
      bar: "bg-energy-cyan",
      iconBg: "bg-cyan-50 dark:bg-cyan-500/10 text-energy-cyan border-cyan-200 dark:border-cyan-500/20",
      glow: "hover:border-energy-cyan/40",
      valueColor: "text-slate-900 dark:text-white",
    },
    rose: {
      bar: "bg-energy-rose",
      iconBg: "bg-rose-50 dark:bg-rose-500/10 text-energy-rose border-rose-200 dark:border-rose-500/20",
      glow: "hover:border-energy-rose/40",
      valueColor: "text-slate-900 dark:text-white",
    },
  };

  const s = accentStyles[accent] || accentStyles.solar;

  return (
    <div
      className={clsx(
        "card relative overflow-hidden p-5 transition-all duration-150 cursor-default group",
        s.glow,
        variant === "hero" ? "bg-gradient-to-br from-white to-slate-50/50 dark:from-void-800 dark:to-void-850" : ""
      )}
      role="region"
      aria-label={label}
    >
      {/* Top 2px subtle accent line */}
      <div className={clsx("absolute top-0 left-0 right-0 h-[2px]", s.bar)} />

      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="stat-label truncate">{label}</span>
        {Icon && (
          <div
            className={clsx(
              "w-7 h-7 rounded-md flex items-center justify-center border flex-shrink-0 transition-colors",
              s.iconBg
            )}
            aria-hidden="true"
          >
            {typeof Icon === "string" ? (
              <span className="text-sm">{Icon}</span>
            ) : (
              <Icon className="w-3.5 h-3.5" />
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2.5 py-1">
          <div className="h-7 bg-slate-200 dark:bg-void-700 rounded animate-pulse w-3/4" />
          {delta && (
            <div className="h-4 bg-slate-200 dark:bg-void-700 rounded animate-pulse w-1/2" />
          )}
        </div>
      ) : value === null || value === undefined ? (
        <div className="text-slate-400 dark:text-void-300 text-sm font-mono py-1">
          No data available
        </div>
      ) : (
        <div>
          {/* Prominent Metric Value & Unit */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span
              className={clsx(
                "stat-value tracking-tight leading-none",
                variant === "hero" ? "text-3xl lg:text-4xl" : "text-2xl lg:text-3xl",
                s.valueColor
              )}
            >
              {value}
            </span>
            {unit && (
              <span className="font-mono text-xs font-semibold text-slate-500 dark:text-void-300">
                {unit}
              </span>
            )}
          </div>

          {/* Delta / Subtitle */}
          {(delta || subtitle) && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-mono">
              {delta && (
                <span
                  className={clsx(
                    "inline-flex items-center font-medium",
                    deltaUp ? "text-grid-600 dark:text-grid-400" : "text-energy-rose"
                  )}
                >
                  {deltaUp ? "↑" : "↓"} {delta}
                </span>
              )}
              {subtitle && (
                <span className="text-slate-400 dark:text-void-400 text-[11px] truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
