import React from "react";
import { useSolar } from "../../context/SolarContext";

export default function WeatherWidget() {
  const { weather, loading, error } = useSolar();

  if (loading || !weather) {
    return (
      <div className="card p-5 space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-void-600 rounded animate-pulse w-1/3" />
        <div className="h-16 bg-slate-200 dark:bg-void-600 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-200 dark:bg-void-600 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="card p-5">
        <div className="text-energy-rose text-sm">
          <span>⚠</span> Unable to load weather data
        </div>
      </div>
    );
  }

  const irradPct = Math.round((weather.irradiance / 1000) * 100);

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-bold text-white">
            Weather Intelligence
          </div>
          <div className="text-xs text-slate-600 dark:text-void-200 mt-0.5">
            {weather.location}
          </div>
        </div>
        <span className="text-xs font-mono text-slate-600 dark:text-void-200 bg-slate-200 dark:bg-void-600 px-2 py-1 rounded">
          AI FORECAST
        </span>
      </div>

      {/* Main weather display */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-5xl leading-none animate-float">
            {weather.icon}
          </div>
          <div className="text-xs text-slate-600 dark:text-void-200 mt-2 max-w-[120px] leading-relaxed">
            {weather.label}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-extrabold text-solar-400">
            {weather.temp}°<span className="text-xl">C</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-void-200 mt-1">
            Feels {weather.feelsLike}°C
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "HUMIDITY", val: `${weather.humidity}%`, icon: "💧" },
          { label: "WIND", val: `${weather.wind} km/h`, icon: "🌬" },
          { label: "UV INDEX", val: `${weather.uvIndex} — High`, icon: "☀" },
          { label: "CLOUD COVER", val: `${weather.cloud}%`, icon: "☁" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-slate-200 dark:bg-void-600/60 rounded-xl p-3"
          >
            <div className="text-[9px] font-mono text-slate-600 dark:text-void-200 tracking-widest">
              {item.label}
            </div>
            <div className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
              {item.icon} {item.val}
            </div>
          </div>
        ))}
      </div>

      {/* Irradiance bar */}
      <div>
        <div className="flex justify-between text-[10px] font-mono mb-1.5">
          <span className="text-slate-600 dark:text-void-200 tracking-wider">
            SOLAR IRRADIANCE
          </span>
          <span className="text-solar-600 dark:text-solar-400 font-bold">
            {weather.irradiance} W/m²
          </span>
        </div>
        <div className="progress-track h-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-solar-600 to-solar-300 transition-all duration-1000"
            style={{ width: `${irradPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-600 dark:text-void-300 font-mono mt-1">
          <span>0 W/m²</span>
          <span>1000 W/m²</span>
        </div>
      </div>

      {/* 5-day forecast strip */}
      <div>
        <div className="text-[10px] font-mono text-slate-600 dark:text-void-200 tracking-widest mb-2">
          5-DAY FORECAST
        </div>
        <div className="flex gap-1.5">
          {weather.forecast?.map((day, i) => (
            <div
              key={day.day}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                i === 0
                  ? "bg-solar-500/10 border border-solar-500/20"
                  : "bg-slate-200 dark:bg-void-600/40 hover:bg-slate-300 dark:hover:bg-void-600/70"
              }`}
            >
              <span className="text-[9px] font-mono text-slate-600 dark:text-void-200">
                {day.day}
              </span>
              <span className="text-base leading-none">{day.icon}</span>
              <span className="text-[10px] font-mono text-slate-900 dark:text-white">
                {day.high}°
              </span>
              <span className="text-[9px] font-mono text-slate-600 dark:text-void-300">
                {day.low}°
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
