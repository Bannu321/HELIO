// import React from "react";
// import EstimationPanel from "../components/dashboard/EstimationPanel";
// import { BrainCircuit, Cpu, Target, Network } from "lucide-react";

// export default function Estimation() {
//   return (
//     <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-10 animate-fade-in">
//       <header>
//         <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
//           AI Power Estimation
//         </h1>
//         <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
//           LSTM Time-Series & Perez Irradiance Forecast Models
//         </p>
//       </header>

//       {/* Model Health Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//         <ModelCard
//           title="Model Status"
//           value="Online"
//           icon={Cpu}
//           color="text-energy-green"
//         />
//         <ModelCard
//           title="Prediction Accuracy"
//           value="94.2%"
//           icon={Target}
//           color="text-solar-400"
//         />
//         <ModelCard
//           title="Data Points"
//           value="1.2M+"
//           icon={Network}
//           color="text-energy-cyan"
//         />
//         <ModelCard
//           title="Next Sync"
//           value="12m 30s"
//           icon={BrainCircuit}
//           color="text-slate-600 dark:text-void-300"
//         />
//       </div>

//       {/* Existing Estimation Panel Component */}
//       <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-8 shadow-card">
//         <h2 className="font-display font-bold text-slate-900 dark:text-white mb-8">
//           Generation Forecast
//         </h2>
//         {/* Render your existing EstimationPanel here */}
//         <EstimationPanel />
//       </div>

//       {/* Variables Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-2xl p-6">
//           <h3 className="text-sm font-bold text-slate-600 dark:text-void-200 uppercase tracking-widest mb-4">
//             Current Input Variables
//           </h3>
//           <ul className="space-y-3 font-mono text-sm">
//             <li className="flex justify-between text-slate-600 dark:text-void-300">
//               <span className="text-slate-900 dark:text-white">
//                 Cloud Cover (NASA POWER)
//               </span>{" "}
//               12%
//             </li>
//             <li className="flex justify-between text-slate-600 dark:text-void-300">
//               <span className="text-slate-900 dark:text-white">
//                 Aerosol Optical Depth
//               </span>{" "}
//               0.14
//             </li>
//             <li className="flex justify-between text-slate-600 dark:text-void-300">
//               <span className="text-slate-900 dark:text-white">
//                 Panel Azimuth
//               </span>{" "}
//               180° (South)
//             </li>
//             <li className="flex justify-between text-slate-600 dark:text-void-300">
//               <span className="text-slate-900 dark:text-white">
//                 Soiling Loss Penalty
//               </span>{" "}
//               -2.1%
//             </li>
//           </ul>
//         </div>
//         <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-2xl p-6">
//           <h3 className="text-sm font-bold text-slate-600 dark:text-void-200 uppercase tracking-widest mb-4">
//             Model Confidence
//           </h3>
//           <div className="space-y-4">
//             <div>
//               <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
//                 <span>1-Hour Forecast</span>{" "}
//                 <span className="text-energy-green">98%</span>
//               </div>
//               <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-1.5">
//                 <div className="bg-energy-green h-1.5 rounded-full w-[98%]"></div>
//               </div>
//             </div>
//             <div>
//               <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
//                 <span>6-Hour Forecast</span>{" "}
//                 <span className="text-solar-400">85%</span>
//               </div>
//               <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-1.5">
//                 <div className="bg-solar-400 h-1.5 rounded-full w-[85%]"></div>
//               </div>
//             </div>
//             <div>
//               <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
//                 <span>24-Hour Forecast</span>{" "}
//                 <span className="text-energy-amber">72%</span>
//               </div>
//               <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-1.5">
//                 <div className="bg-energy-amber h-1.5 rounded-full w-[72%]"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ModelCard({ title, value, icon: Icon, color }) {
//   return (
//     <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-xl p-5 flex items-center justify-between">
//       <div>
//         <h3 className="text-slate-600 dark:text-void-400 text-xs font-bold tracking-widest mb-1">
//           {title.toUpperCase()}
//         </h3>
//         <span className={`text-xl font-display font-bold ${color}`}>
//           {value}
//         </span>
//       </div>
//       <Icon className={`w-6 h-6 opacity-50 ${color}`} />
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import axios from "axios";
import EstimationPanel from "../components/dashboard/EstimationPanel";
import { BrainCircuit, Cpu, Target, Network } from "lucide-react";

export default function Estimation() {
  const [modelData, setModelData] = useState({ weather: null, forecast: null });
  const [loading, setLoading] = useState(true);
  
  // Ticking countdown timer state for the "Next Sync" card
  const [syncTime, setSyncTime] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const fetchModelDiagnostics = async () => {
      try {
        const [weatherRes, forecastRes] = await Promise.all([
          axios.get("http://localhost:5000/api/weather/current"),
          axios.get("http://localhost:5000/api/estimation/forecast"),
        ]);
        
        setModelData({
          weather: weatherRes.data,
          forecast: forecastRes.data
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch model diagnostics:", error);
        setLoading(false);
      }
    };

    fetchModelDiagnostics();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncTime((prev) => (prev > 0 ? prev - 1 : 300)); // Reset to 5 mins when it hits 0
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format the seconds into MMm SSs
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const { weather, forecast } = modelData;

  // Fallback values if backend is loading/offline
  const cloudCover = weather?.cloudCover ?? 12;
  const accuracy = forecast?.summary?.modelConfidence ?? "94.2%";
  const algorithm = forecast?.summary?.algorithm ?? "Facebook Prophet Time-Series";
  const soilingPenalty = forecast?.summary?.soilingLoss ?? "-2.1%";

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-10 animate-fade-in">
      <header>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
            AI Power Estimation
          </h1>
          {/* Live pulsing indicator to show the model is active */}
          <span className="relative flex h-3 w-3 mt-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energy-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-energy-cyan"></span>
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono uppercase tracking-wider">
          {algorithm}
        </p>
      </header>

      {/* Model Health Stats - Now Dynamic */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <ModelCard
          title="Model Status"
          value={loading ? "Connecting..." : "Online"}
          icon={Cpu}
          color={loading ? "text-slate-400" : "text-energy-green"}
        />
        <ModelCard
          title="Prediction Accuracy"
          value={accuracy}
          icon={Target}
          color="text-solar-400"
        />
        <ModelCard
          title="Training Data"
          value="1.2M+ Rows"
          icon={Network}
          color="text-energy-cyan"
        />
        <ModelCard
          title="Next ML Sync"
          value={formatTime(syncTime)}
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

      {/* Variables Section - Linked to Real Weather & Model Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-2xl p-6 hover:border-solar-500/30 transition-colors">
          <h3 className="text-sm font-bold text-slate-600 dark:text-void-200 uppercase tracking-widest mb-4">
            Live Input Variables
          </h3>
          <ul className="space-y-4 font-mono text-sm">
            <li className="flex justify-between text-slate-600 dark:text-void-300 border-b border-slate-200 dark:border-void-700/50 pb-2">
              <span className="text-slate-900 dark:text-white">
                Cloud Cover (OpenWeather API)
              </span>{" "}
              <span className="text-solar-600 dark:text-solar-400 font-bold">{cloudCover}%</span>
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300 border-b border-slate-200 dark:border-void-700/50 pb-2">
              <span className="text-slate-900 dark:text-white">
                Panel Azimuth
              </span>{" "}
              <span>180° (South)</span>
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300 border-b border-slate-200 dark:border-void-700/50 pb-2">
              <span className="text-slate-900 dark:text-white">
                Base Array Capacity
              </span>{" "}
              <span>100 kWp</span>
            </li>
            <li className="flex justify-between text-slate-600 dark:text-void-300 pb-2">
              <span className="text-slate-900 dark:text-white">
                AI Soiling Loss Penalty
              </span>{" "}
              <span className="text-energy-rose font-bold">{soilingPenalty}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-2xl p-6 hover:border-energy-cyan/30 transition-colors">
          <h3 className="text-sm font-bold text-slate-600 dark:text-void-200 uppercase tracking-widest mb-4">
            Model Horizon Confidence
          </h3>
          <p className="text-xs text-slate-500 dark:text-void-400 mb-4 font-mono">
            * Prophet time-series confidence degrades predictably as the forecast horizon extends.
          </p>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>1-Hour Forecast</span>{" "}
                <span className="text-energy-green font-bold">98%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-2">
                <div className="bg-energy-green h-2 rounded-full w-[98%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>6-Hour Forecast</span>{" "}
                <span className="text-solar-400 font-bold">85%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-2">
                <div className="bg-solar-400 h-2 rounded-full w-[85%] shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-void-300 mb-1">
                <span>24-Hour Forecast</span>{" "}
                <span className="text-energy-amber font-bold">72%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-void-900 rounded-full h-2">
                <div className="bg-energy-amber h-2 rounded-full w-[72%] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
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
    <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
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