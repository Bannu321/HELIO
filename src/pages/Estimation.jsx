import React from "react";
import EstimationPanel from "../components/dashboard/EstimationPanel";
import { BrainCircuit, Cpu, Target, Network } from "lucide-react";

export default function Estimation() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-10 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
          AI Power Estimation
        </h1>
        <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
          LSTM Time-Series & Perez Irradiance Forecast Models
        </p>
      </header>

      {/* Model Health Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <ModelCard
          title="Model Status"
          value="Online"
          icon={Cpu}
          color="text-energy-green"
        />
        <ModelCard
          title="Prediction Accuracy"
          value="94.2%"
          icon={Target}
          color="text-solar-400"
        />
        <ModelCard
          title="Data Points"
          value="1.2M+"
          icon={Network}
          color="text-energy-cyan"
        />
        <ModelCard
          title="Next Sync"
          value="12m 30s"
          icon={BrainCircuit}
          color="text-slate-600 dark:text-void-300"
        />
      </div>

      {/* Existing Estimation Panel Component */}
      <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-8 shadow-card">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-8">
          Generation Forecast
        </h2>
        {/* Render your existing EstimationPanel here */}
        <EstimationPanel />
      </div>

      {/* Variables Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-600 dark:text-void-200 uppercase tracking-widest mb-4">
            Current Input Variables
          </h3>
          <ul className="space-y-3 font-mono text-sm">
            <li className="flex justify-between text-slate-600 dark:text-void-300">
              <span className="text-slate-900 dark:text-white">
                Cloud Cover (NASA POWER)
              </span>{" "}
              12%
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300">
              <span className="text-slate-900 dark:text-white">
                Aerosol Optical Depth
              </span>{" "}
              0.14
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300">
              <span className="text-slate-900 dark:text-white">
                Panel Azimuth
              </span>{" "}
              180° (South)
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300">
              <span className="text-slate-900 dark:text-white">
                Soiling Loss Penalty
              </span>{" "}
              -2.1%
            </li>
          </ul>
        </div>
        <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-600 dark:text-void-200 uppercase tracking-widest mb-4">
            Model Confidence
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>1-Hour Forecast</span>{" "}
                <span className="text-energy-green">98%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-1.5">
                <div className="bg-energy-green h-1.5 rounded-full w-[98%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>6-Hour Forecast</span>{" "}
                <span className="text-solar-400">85%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-1.5">
                <div className="bg-solar-400 h-1.5 rounded-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>24-Hour Forecast</span>{" "}
                <span className="text-energy-amber">72%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-1.5">
                <div className="bg-energy-amber h-1.5 rounded-full w-[72%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-xl p-5 flex items-center justify-between">
      <div>
        <h3 className="text-slate-600 dark:text-void-400 text-xs font-bold tracking-widest mb-1">
          {title.toUpperCase()}
        </h3>
        <span className={`text-xl font-display font-bold ${color}`}>
          {value}
        </span>
      </div>
      <Icon className={`w-6 h-6 opacity-50 ${color}`} />
    </div>
  );
}
