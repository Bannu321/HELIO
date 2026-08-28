import React, { useState } from "react";
import { CloudRain, Sun, Thermometer, Wind, BrainCircuit, Cloud, CloudSun, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import clsx from "clsx";

const MAX_THEORETICAL_YIELD = 500;

const simulatedWeek = [
  {
    id: 0, day: "Mon", fullDay: "Monday",
    condition: "Clear Sky", icon: Sun,
    irradiance: 950, temp: 28, cloudCover: 5, windSpeed: 12,
    predictedYield: "420.5", confidence: "98%",
    insight: "Peak solar irradiance at 950 W/m² under clear atmosphere. Panel thermal dissipation optimal."
  },
  {
    id: 1, day: "Tue", fullDay: "Tuesday",
    condition: "Partly Cloudy", icon: CloudSun,
    irradiance: 750, temp: 26, cloudCover: 35, windSpeed: 18,
    predictedYield: "340.2", confidence: "92%",
    insight: "Scattered cumulus cloud formations forecast around 12:30–14:00. Expected output drop ~15%."
  },
  {
    id: 2, day: "Wed", fullDay: "Wednesday",
    condition: "Overcast", icon: Cloud,
    irradiance: 400, temp: 22, cloudCover: 80, windSpeed: 8,
    predictedYield: "180.8", confidence: "85%",
    insight: "High cloud density (80%). Recommend automated microgrid switch to discharge BESS reserves."
  },
  {
    id: 3, day: "Thu", fullDay: "Thursday",
    condition: "Extreme Heat Wave", icon: Sun,
    irradiance: 980, temp: 43, cloudCover: 0, windSpeed: 5,
    predictedYield: "385.0", confidence: "95%",
    insight: "Ambient temperature at 43°C elevates PV cell temperature >58°C. AI model applying a -9.2% thermal derate."
  },
  {
    id: 4, day: "Fri", fullDay: "Friday",
    condition: "High Wind & Clear", icon: Wind,
    irradiance: 900, temp: 25, cloudCover: 10, windSpeed: 35,
    predictedYield: "415.3", confidence: "96%",
    insight: "Convective cooling from 35 km/h ambient winds maintains cells at 38°C, boosting efficiency by +1.5%."
  },
  {
    id: 5, day: "Sat", fullDay: "Saturday",
    condition: "Precipitation / Rain", icon: CloudRain,
    irradiance: 150, temp: 20, cloudCover: 95, windSpeed: 22,
    predictedYield: "65.4", confidence: "88%",
    insight: "Low diffuse irradiance during monsoon shower. Soiling layer will be naturally cleaned for Sunday."
  },
  {
    id: 6, day: "Sun", fullDay: "Sunday",
    condition: "Optimal Post-Rain", icon: Sun,
    irradiance: 920, temp: 24, cloudCover: 15, windSpeed: 14,
    predictedYield: "410.9", confidence: "97%",
    insight: "Clean glass surface with high air transparency yielding pristine conversion curves."
  }
];

export default function WeatherAI() {
  const [activeDay, setActiveDay] = useState(0);
  const currentData = simulatedWeek[activeDay];

  const estimatedPanelTemp = currentData.temp + (currentData.irradiance > 500 ? 15 : 5);
  const isOverheating = estimatedPanelTemp > 45;
  const yieldPercentage = Math.min((parseFloat(currentData.predictedYield) / MAX_THEORETICAL_YIELD) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Weather AI & Yield Simulator
            </h1>
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-energy-cyan animate-pulse" />
              PROPHET ML INFERENCE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            Irradiance correlation, thermal derating models, and multi-day meteorological forecasts
          </p>
        </div>
      </div>

      {/* Interactive Day Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 p-1.5 bg-slate-100 dark:bg-void-850 rounded-xl border border-slate-200 dark:border-void-700/70">
        {simulatedWeek.map((day) => {
          const DayIcon = day.icon;
          const isSelected = activeDay === day.id;
          return (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={clsx(
                "flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all text-center focus:outline-none",
                isSelected
                  ? "bg-white dark:bg-void-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-void-600 font-semibold"
                  : "text-slate-500 dark:text-void-300 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-void-800/50"
              )}
            >
              <DayIcon className={clsx("w-4 h-4 mb-1", isSelected ? "text-solar-500" : "opacity-60")} />
              <span className="text-xs font-mono font-medium">{day.day}</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-void-400 mt-0.5">{day.predictedYield} kWh</span>
            </button>
          );
        })}
      </div>

      {/* Environmental Telemetry Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnvCard
          title="Global Horizontal Irradiance"
          value={currentData.irradiance}
          unit="W/m²"
          icon={Sun}
          accent="solar"
        />
        <EnvCard
          title="PV Cell Temperature (Est)"
          value={estimatedPanelTemp.toFixed(1)}
          unit="°C"
          icon={Thermometer}
          accent={isOverheating ? "rose" : "cyan"}
        />
        <EnvCard
          title="Cloud Layer Density"
          value={currentData.cloudCover}
          unit="%"
          icon={CloudRain}
          accent="slate"
        />
        <EnvCard
          title="Surface Wind Velocity"
          value={currentData.windSpeed}
          unit="km/h"
          icon={Wind}
          accent="green"
        />
      </div>

      {/* Detailed Forecast & AI Inference Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Weather Condition Highlight */}
        <div className="card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-solar-50 dark:bg-solar-500/10 border border-solar-200 dark:border-solar-500/20 flex items-center justify-center mb-4">
            <currentData.icon className="w-8 h-8 text-solar-500" />
          </div>
          <span className="stat-label mb-1">{currentData.fullDay} Simulation</span>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            {currentData.condition}
          </h2>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-void-700/60 w-full flex justify-around text-xs font-mono">
            <div>
              <span className="text-slate-400 dark:text-void-400 block">Ambient Temp</span>
              <span className="font-semibold text-slate-800 dark:text-void-100">{currentData.temp}°C</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-void-400 block">Wind Velocity</span>
              <span className="font-semibold text-slate-800 dark:text-void-100">{currentData.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Right: AI Prediction Model Panel */}
        <div className="lg:col-span-2 card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-energy-cyan">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Neural Forecast & Derating Engine
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-void-300">
                    Prophet + Microgrid Thermal Compensation Model
                  </p>
                </div>
              </div>
              <span className="live-badge text-xs">
                {currentData.confidence} Confidence
              </span>
            </div>

            {/* Yield Estimate Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-void-850 border border-slate-200 dark:border-void-700/70 mb-5">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-mono text-slate-500 dark:text-void-300 uppercase tracking-wider">
                  Predicted 24h Yield
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-void-300">
                  Capacity: {MAX_THEORETICAL_YIELD} kWh
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="stat-value text-3xl text-slate-900 dark:text-white">
                  {currentData.predictedYield}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-500 dark:text-void-300">
                  kWh / day
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-void-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-solar-500 rounded-full transition-all duration-500"
                  style={{ width: `${yieldPercentage}%` }}
                />
              </div>
            </div>

            {/* Model Insights List */}
            <div className="space-y-2.5">
              <span className="stat-label">Model Reasoning & Dispatch Strategy</span>
              <div className="space-y-2 font-mono text-xs text-slate-700 dark:text-void-200">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-void-700/60 bg-white dark:bg-void-800 flex items-start gap-2.5">
                  <span className="text-solar-500 font-bold">•</span>
                  <span>{currentData.insight}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-void-700/60 bg-white dark:bg-void-800 flex items-start gap-2.5">
                  <span className={isOverheating ? "text-energy-rose font-bold" : "text-grid-500 font-bold"}>•</span>
                  <span>
                    {isOverheating
                      ? `Thermal alert: Panel temperature (${estimatedPanelTemp.toFixed(1)}°C) exceeding safe nominal range. Efficiency de-rated by 9.2%.`
                      : `Thermal state within nominal envelope (${estimatedPanelTemp.toFixed(1)}°C). Zero thermal penalties applied.`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnvCard({ title, value, unit, icon: Icon, accent }) {
  const accentStyles = {
    solar: "text-solar-500 bg-solar-50 dark:bg-solar-500/10 border-solar-200 dark:border-solar-500/20",
    cyan: "text-energy-cyan bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
    green: "text-grid-600 dark:text-grid-400 bg-grid-50 dark:bg-grid-500/10 border-grid-200 dark:border-grid-500/20",
    rose: "text-energy-rose bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
    slate: "text-slate-600 dark:text-void-300 bg-slate-100 dark:bg-void-700/60 border-slate-200 dark:border-void-600",
  };

  const badgeClass = accentStyles[accent] || accentStyles.slate;

  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <span className="stat-label truncate block">{title}</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="stat-value text-2xl text-slate-900 dark:text-white">
            {value}
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-void-300">
            {unit}
          </span>
        </div>
      </div>
      <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0", badgeClass)}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}
