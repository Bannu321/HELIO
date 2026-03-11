import React, { useState } from "react";
import WeatherWidget from "../components/weather/WeatherWidget"; 
import { CloudRain, Sun, Thermometer, Wind, BrainCircuit, Cloud, CloudSun } from "lucide-react";

// The maximum theoretical generation if conditions are 100% perfect (used for the progress bar)
const MAX_THEORETICAL_YIELD = 500; 

// ðŸš€ HACKATHON MAGIC: 7 distinct days to show off the AI's logic
const simulatedWeek = [
  {
    id: 0, day: "Mon", fullDay: "Monday",
    condition: "Clear", icon: Sun,
    irradiance: 950, temp: 28, cloudCover: 5, windSpeed: 12,
    predictedYield: "420.5", confidence: "98%",
    insight: "Clear skies detected. Irradiance levels optimal at 950 W/mÂ². Panel thermal state stable."
  },
  {
    id: 1, day: "Tue", fullDay: "Tuesday",
    condition: "Partly Cloudy", icon: CloudSun,
    irradiance: 750, temp: 26, cloudCover: 35, windSpeed: 18,
    predictedYield: "340.2", confidence: "92%",
    insight: "Minor cloud cover expected during peak noon window. Expecting a 15% drop in generation."
  },
  {
    id: 2, day: "Wed", fullDay: "Wednesday",
    condition: "Overcast", icon: Cloud,
    irradiance: 400, temp: 22, cloudCover: 80, windSpeed: 8,
    predictedYield: "180.8", confidence: "85%",
    insight: "Heavy cloud cover (80%) severely restricting output. Suggest drawing from campus battery reserves."
  },
  {
    id: 3, day: "Thu", fullDay: "Thursday",
    condition: "Extreme Heat", icon: Sun,
    irradiance: 980, temp: 43, cloudCover: 0, windSpeed: 5,
    predictedYield: "385.0", confidence: "95%",
    insight: "Warning: Ambient temp at 43Â°C pushing panel temps above 55Â°C. AI factoring in a 9.2% thermal efficiency loss."
  },
  {
    id: 4, day: "Fri", fullDay: "Friday",
    condition: "Windy & Clear", icon: Wind,
    irradiance: 900, temp: 25, cloudCover: 10, windSpeed: 35,
    predictedYield: "415.3", confidence: "96%",
    insight: "High wind speeds providing natural convective cooling to panels, boosting efficiency by 1.5%."
  },
  {
    id: 5, day: "Sat", fullDay: "Saturday",
    condition: "Heavy Rain", icon: CloudRain,
    irradiance: 150, temp: 20, cloudCover: 95, windSpeed: 22,
    predictedYield: "65.4", confidence: "88%",
    insight: "Severe weather protocol active. Generation negligible. Soiling losses will be washed away for Sunday."
  },
  {
    id: 6, day: "Sun", fullDay: "Sunday",
    condition: "Optimal", icon: Sun,
    irradiance: 920, temp: 24, cloudCover: 15, windSpeed: 14,
    predictedYield: "410.9", confidence: "97%",
    insight: "Perfect post-rain conditions. Panels are clean, temps are low, and irradiance is high."
  }
];

export default function WeatherAI() {
  const [activeDay, setActiveDay] = useState(0);
  const currentData = simulatedWeek[activeDay];

  // Dynamic calculations for the UI based on the selected day
  const estimatedPanelTemp = currentData.temp + (currentData.irradiance > 500 ? 15 : 5);
  const isOverheating = estimatedPanelTemp > 45;
  
  // Calculate the percentage for the progress bar
  const yieldPercentage = Math.min((parseFloat(currentData.predictedYield) / MAX_THEORETICAL_YIELD) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-10 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
          Weather Intelligence & AI
        </h1>
        <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
          Interactive Machine Learning Scenario Simulator
        </p>
      </header>

      {/* --- INTERACTIVE DAY SELECTOR --- */}
      <div className="flex flex-wrap gap-2 md:gap-4 p-2 bg-slate-100 dark:bg-void-800/50 rounded-2xl border border-slate-300 dark:border-void-700">
        {simulatedWeek.map((day) => (
          <button
            key={day.id}
            onClick={() => setActiveDay(day.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 ${
              activeDay === day.id
                ? "bg-energy-cyan text-slate-900 shadow-md transform scale-105"
                : "text-slate-600 dark:text-void-300 hover:bg-slate-200 dark:hover:bg-void-700"
            }`}
          >
            <day.icon className={`w-5 h-5 mb-1 ${activeDay === day.id ? "text-slate-900" : ""}`} />
            <span className="text-xs font-bold uppercase tracking-wider">{day.day}</span>
          </button>
        ))}
      </div>

      {/* Environmental Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <EnvCard
          title="Global Irradiance"
          value={currentData.irradiance}
          unit="W/mÂ²"
          icon={Sun}
          color="text-solar-400"
        />
        <EnvCard
          title="Est. Panel Temp"
          value={estimatedPanelTemp.toFixed(1)}
          unit="Â°C"
          icon={Thermometer}
          color={isOverheating ? "text-energy-rose" : "text-energy-cyan"} 
        />
        <EnvCard
          title="Cloud Cover"
          value={currentData.cloudCover}
          unit="%"
          icon={CloudRain}
          color="text-slate-600 dark:text-void-300"
        />
        <EnvCard
          title="Wind Speed"
          value={currentData.windSpeed}
          unit="km/h"
          icon={Wind}
          color="text-energy-cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Live Meteorological Data Widget */}
        <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-8 shadow-card h-full flex flex-col items-center justify-center text-center">
          <currentData.icon className="w-24 h-24 text-solar-400 mb-6 drop-shadow-lg" />
          <h2 className="font-display font-bold text-4xl text-slate-900 dark:text-white mb-2">
            {currentData.condition}
          </h2>
          <p className="text-slate-500 dark:text-void-300 font-mono">
            {currentData.fullDay} Simulation Active
          </p>
        </div>

        {/* AI Forecast Panel */}
        <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-8 shadow-card relative overflow-hidden flex flex-col transition-all duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-energy-cyan rounded-full blur-[80px] opacity-10 pointer-events-none" />

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-energy-cyan/10 border border-energy-cyan/20 rounded-lg text-energy-cyan">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">
              AI Generation Forecast
            </h2>
          </div>

          <div className="flex-1 space-y-6">
            <div className="bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-700 rounded-xl p-5 transform transition-all">
              <div className="flex justify-between items-start mb-1">
                <div className="text-xs text-slate-600 dark:text-void-400 font-mono">
                  PREDICTED DAY YIELD
                </div>
                <div className="text-xs text-energy-green font-mono font-bold">
                  {currentData.confidence} CONFIDENCE
                </div>
              </div>
              
              <div className="text-4xl font-display font-bold text-energy-cyan flex items-baseline gap-2 mb-4">
                {currentData.predictedYield}
                <span className="text-lg text-slate-600 dark:text-void-300 font-medium">
                  kWh
                </span>
              </div>
              
              {/* --- NEW PREDICTION FILL BAR --- */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-void-400 uppercase">
                  <span>Capacity Used</span>
                  <span>Max: {MAX_THEORETICAL_YIELD} kWh</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-void-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-solar-400 to-energy-cyan transition-all duration-1000 ease-out rounded-full relative"
                    style={{ width: `${yieldPercentage}%` }}
                  >
                    {/* Tiny animated shine effect on the bar */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse-slow"></div>
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700 dark:text-void-200">
                Prophet Model Insights
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-void-300 leading-relaxed">
                <li className="flex gap-2 items-start">
                  <span className="text-solar-400 mt-1">â–¹</span> 
                  <span>{currentData.insight}</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className={isOverheating ? "text-energy-rose mt-1" : "text-energy-cyan mt-1"}>â–¹</span> 
                  <span>
                    {isOverheating 
                      ? `Critical: Panel temps at ${estimatedPanelTemp.toFixed(1)}Â°C triggering thermal degradation algorithms.` 
                      : `Panel thermal state stable at ${estimatedPanelTemp.toFixed(1)}Â°C. No heat penalties applied.`}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnvCard({ title, value, unit, icon: Icon, color }) {
  return (
    <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-xl p-5 flex items-center justify-between group hover:bg-slate-200 dark:hover:bg-void-800 transition-colors">
      <div>
        <h3 className="text-slate-600 dark:text-void-400 text-xs font-bold tracking-widest mb-1">
          {title.toUpperCase()}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-display font-bold text-slate-900 dark:text-white group-hover:text-solar-600 dark:group-hover:text-solar-100 transition-colors">
            {value}
          </span>
          <span className="text-xs font-mono text-slate-600 dark:text-void-400">
            {unit}
          </span>
        </div>
      </div>
      <Icon className={`w-8 h-8 opacity-60 ${color}`} />
    </div>
  );
}
