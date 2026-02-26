import React from 'react';
import WeatherWidget from '../components/weather/WeatherWidget';
import { CloudRain, Sun, Thermometer, Wind, BrainCircuit } from 'lucide-react';

export default function WeatherAI() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-10 animate-fade-in">
      
      <header>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">Weather Intelligence & AI</h1>
        <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">Perez Irradiance Model & Forecast Diagnostics</p>
      </header>

      {/* Environmental Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <EnvCard title="Global Irradiance" value="912" unit="W/m²" icon={Sun} color="text-solar-400" />
        <EnvCard title="Panel Temp" value="42.5" unit="°C" icon={Thermometer} color="text-energy-rose" />
        <EnvCard title="Cloud Cover" value="12" unit="%" icon={CloudRain} color="text-slate-600 dark:text-void-300" />
        <EnvCard title="Wind Speed" value="14" unit="km/h" icon={Wind} color="text-energy-cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your existing Weather Widget */}
        <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-8 shadow-card h-full">
          <h2 className="font-display font-bold text-slate-900 dark:text-white mb-8">Live Meteorological Data</h2>
          <WeatherWidget />
        </div>

        {/* AI Forecast Panel */}
        <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-8 shadow-card relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-48 h-48 bg-energy-cyan rounded-full blur-[80px] opacity-10 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-energy-cyan/10 border border-energy-cyan/20 rounded-lg text-energy-cyan">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">LSTM Generation Forecast</h2>
          </div>

          <div className="flex-1 space-y-6">
            <div className="bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-700 rounded-xl p-4">
              <div className="text-xs text-slate-600 dark:text-void-400 font-mono mb-1">PREDICTED YIELD (NEXT 6 HOURS)</div>
              <div className="text-3xl font-display font-bold text-energy-cyan">18.5 <span className="text-lg text-slate-600 dark:text-void-300">kWh</span></div>
              <p className="text-xs text-slate-600 dark:text-void-300 mt-2">Confidence: <span className="text-energy-green">High (94%)</span></p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700 dark:text-void-200">AI Model Insights</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-void-300">
                <li className="flex gap-2">
                  <span className="text-solar-400">▹</span> Peak irradiance expected at 13:15 IST.
                </li>
                <li className="flex gap-2">
                  <span className="text-solar-400">▹</span> Minor cloud cover arriving at 15:00, expected drop: 12%.
                </li>
                <li className="flex gap-2">
                  <span className="text-energy-rose">▹</span> Panel temp exceeding 40°C causing -1.5% thermal efficiency loss.
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
        <h3 className="text-slate-600 dark:text-void-400 text-xs font-bold tracking-widest mb-1">{title.toUpperCase()}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-display font-bold text-slate-900 dark:text-white group-hover:text-solar-600 dark:group-hover:text-solar-100 transition-colors">{value}</span>
          <span className="text-xs font-mono text-slate-600 dark:text-void-400">{unit}</span>
        </div>
      </div>
      <Icon className={`w-8 h-8 opacity-60 ${color}`} />
    </div>
  );
}