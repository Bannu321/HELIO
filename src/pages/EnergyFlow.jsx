import React, { useState, useEffect } from "react";
import { Sun, Plug, Battery, Leaf, BrainCircuit, Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// Static mock data for the 24h Area Chart at the bottom
const energyMixData = [
  { time: "00:00", solar: 0, grid: 12, battery: 5 },
  { time: "04:00", solar: 0, grid: 15, battery: 2 },
  { time: "08:00", solar: 15, grid: 5, battery: -5 },
  { time: "12:00", solar: 45, grid: 0, battery: -15 },
  { time: "16:00", solar: 25, grid: 0, battery: -10 },
  { time: "20:00", solar: 0, grid: 8, battery: 15 },
  { time: "23:59", solar: 0, grid: 10, battery: 8 },
];

export default function EnergyFlow() {
  const [scenarioStep, setScenarioStep] = useState(0);
  const [metrics, setMetrics] = useState({ solar: 0, load: 0, grid: 0, battery: 0, bState: 'standby' });
  const [caption, setCaption] = useState("");
  const [activePaths, setActivePaths] = useState([]);

  // Loop through the 4 states every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setScenarioStep((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // ðŸ§  GREEDY ALGORITHM: Ensures perfect mathematical balancing (Input = Output)
  useEffect(() => {
    let s = 0, l = 0, g = 0, b = 0;
    let paths = ['ai-load']; // Load is always drawing power
    let cap = "";
    let batteryState = 'standby';

    // Base random load for realism (between 25.0 and 40.0 kW)
    const baseLoad = Math.floor(Math.random() * 15) + 25; 

    if (scenarioStep === 0) {
      // STATE 1: Solar Excess (Charge Battery)
      l = baseLoad;
      s = l + Math.floor(Math.random() * 15) + 10; // Generate 10-25kW excess
      b = s - l; // Greedy: route all exact excess to battery
      
      paths.push('solar-ai', 'ai-battery-charge');
      batteryState = 'charging';
      cap = "Solar energy excess provides the power to battery";

    } else if (scenarioStep === 1) {
      // STATE 2: Perfectly Balanced
      l = baseLoad;
      s = l; // Greedy: Solar perfectly matches load, nothing left over
      
      paths.push('solar-ai');
      cap = "Solar energy sufficient to load only no energy left to route to battery";

    } else if (scenarioStep === 2) {
      // STATE 3: Solar Deficit (Use Battery)
      l = baseLoad;
      s = Math.floor(Math.random() * 10) + 5; // Solar drops very low
      b = l - s; // Greedy: pull exact deficit from battery first
      
      paths.push('solar-ai', 'battery-ai-discharge');
      batteryState = 'discharging';
      cap = "Solar energy not sufficient taking energy from battery reserves";

    } else if (scenarioStep === 3) {
      // STATE 4: Solar Deficit (Use Grid because battery is empty)
      l = baseLoad;
      s = Math.floor(Math.random() * 10) + 5; // Solar drops very low
      g = l - s; // Greedy: pull exact deficit from power grid
      
      paths.push('solar-ai', 'grid-ai');
      cap = "Solar energy not sufficient taking energy from power grid also";
    }

    setMetrics({ solar: s, load: l, grid: g, battery: b, bState: batteryState });
    setCaption(cap);
    setActivePaths(paths);
  }, [scenarioStep]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* ðŸš€ ANIMATION LOGIC: Notice the reverse-flow keyframe! */}
      <style>{`
        @keyframes flow { to { stroke-dashoffset: -24; } }
        @keyframes reverse-flow { to { stroke-dashoffset: 24; } }
        .path-flow { stroke-dasharray: 8; animation: flow 0.8s linear infinite; }
        .path-flow-reverse { stroke-dasharray: 8; animation: reverse-flow 0.8s linear infinite; }
      `}</style>

      <header>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
          Energy Flow & Routing
        </h1>
        <p className="text-sm text-slate-500 dark:text-void-300 mt-1 font-mono">
          Greedy algorithm routing green energy, grid dependency, and battery reserves.
        </p>
      </header>

      {/* ðŸŸ¢ Live Power Routing Animation */}
      <div className="card p-6 md:p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-lg">
            Dynamic AI Grid Router
          </h2>
          <div className="flex items-center gap-2 bg-solar-50 dark:bg-solar-500/10 px-3 py-1.5 rounded-full border border-solar-200 dark:border-solar-500/20">
            <Activity className="w-4 h-4 text-solar-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-solar-600 dark:text-solar-400">
              GREEDY ALGO ACTIVE
            </span>
          </div>
        </div>

        <p className="text-center font-mono text-sm font-bold text-slate-700 dark:text-white mb-6 bg-slate-100 dark:bg-void-800 py-3 px-4 rounded-lg border border-slate-200 dark:border-void-600 transition-all duration-300 min-h-[46px] flex items-center justify-center">
          {caption}
        </p>

        {/* Diagram Container */}
        <div className="w-full overflow-x-auto">
          <div className="relative min-w-[700px] h-[400px] mx-auto">
            {/* SVG Routing Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Top Left: Solar to AI */}
              <AnimatedPath active={activePaths.includes("solar-ai")} d="M 20 25 L 50 50" color="#f59e0b" reverse={false} />
              
              {/* Bottom Left: Grid to AI */}
              <AnimatedPath active={activePaths.includes("grid-ai")} d="M 20 75 L 50 50" color="#FF4C6A" reverse={false} />
              
              {/* Top Right: AI to Load */}
              <AnimatedPath active={activePaths.includes("ai-load")} d="M 50 50 L 80 25" color="#00E5A0" reverse={false} />
              
              {/* Bottom Right: AI to Battery (Notice how we reverse it if discharging!) */}
              <AnimatedPath 
                active={activePaths.includes("ai-battery-charge") || activePaths.includes("battery-ai-discharge")} 
                d="M 50 50 L 80 75" 
                color="#3FA9F5" 
                reverse={activePaths.includes("battery-ai-discharge")} 
              />
            </svg>

            {/* Nodes */}
            <div className="absolute top-[25%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10">
              <FlowNode
                icon={Sun} label="Solar Array"
                value={`${metrics.solar.toFixed(1)} kW`}
                color="text-solar-500" borderColor="border-solar-500/30"
                active={activePaths.includes("solar-ai")}
              />
            </div>

            <div className="absolute top-[75%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10">
              <FlowNode
                icon={Plug} label="Power Grid"
                value={activePaths.includes("grid-ai") ? `Importing ${metrics.grid.toFixed(1)} kW` : "Standby (0.0 kW)"}
                color="text-energy-rose" borderColor="border-energy-rose/30"
                active={activePaths.includes("grid-ai")}
              />
            </div>

            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="flex flex-col items-center justify-center p-6 w-44 h-44 rounded-full bg-white dark:bg-void-800 border-4 border-solar-500 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                <BrainCircuit className="w-10 h-10 mb-2 text-solar-500" />
                <span className="text-xs font-bold text-slate-500 dark:text-void-300 uppercase tracking-widest text-center">
                  Smart AI Routing
                </span>
              </div>
            </div>

            <div className="absolute top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10">
              <FlowNode
                icon={Leaf} label="Campus Load"
                value={`${metrics.load.toFixed(1)} kW`}
                color="text-energy-green" borderColor="border-energy-green/30"
                active={activePaths.includes("ai-load")}
              />
            </div>

            <div className="absolute top-[75%] left-[80%] -translate-x-1/2 -translate-y-1/2 z-10">
              <FlowNode
                icon={Battery} label="Battery Storage"
                value={metrics.bState === 'charging' ? `Charging ${metrics.battery.toFixed(1)} kW` : metrics.bState === 'discharging' ? `Draining ${metrics.battery.toFixed(1)} kW` : "Standby (0.0 kW)"}
                color="text-energy-blue" borderColor="border-energy-blue/30"
                active={metrics.bState !== 'standby'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ðŸ“ˆ 24h Energy Mix Chart */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-6">
          Daily Energy Mix (Generation vs Usage)
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <AreaChart data={energyMixData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4C6A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF4C6A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3FA9F5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3FA9F5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
              <XAxis dataKey="time" stroke="#8892b0" fontSize={10} fontFamily="Space Mono" tickLine={false} axisLine={false} />
              <YAxis stroke="#8892b0" fontSize={10} fontFamily="Space Mono" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "rgba(10, 13, 20, 0.9)", borderColor: "#222D42", borderRadius: "8px" }} />
              <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "Space Mono", paddingTop: "10px" }} />
              <Area type="monotone" dataKey="solar" name="Solar Gen (kW)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorSolar)" />
              <Area type="monotone" dataKey="grid" name="Grid Usage (kW)" stroke="#FF4C6A" strokeWidth={2} fillOpacity={1} fill="url(#colorGrid)" />
              <Area type="monotone" dataKey="battery" name="Battery Charging (kW)" stroke="#3FA9F5" strokeWidth={2} fillOpacity={1} fill="url(#colorBattery)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function AnimatedPath({ d, active, color, reverse }) {
  return (
    <>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-void-600" />
      {active && (
        <path
          d={d} fill="none" stroke={color} strokeWidth="1.5"
          className={reverse ? "path-flow-reverse" : "path-flow"}
          style={{ color: color, filter: `drop-shadow(0 0 8px ${color})` }}
        />
      )}
    </>
  );
}

function FlowNode({ icon: Icon, label, value, color, borderColor, active }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 w-40 h-32 rounded-2xl bg-white dark:bg-void-800 border-2 transition-all duration-300 ${active ? borderColor + " shadow-[0_0_20px_rgba(255,255,255,0.05)]" : "border-slate-200 dark:border-void-700 opacity-60"}`}>
      <Icon className={`w-8 h-8 mb-2 transition-colors ${active ? color : "text-slate-400 dark:text-void-400"}`} />
      <span className="text-[10px] font-bold text-slate-500 dark:text-void-300 uppercase tracking-widest text-center">{label}</span>
      <span className={`font-display font-bold mt-1 text-sm ${active ? color : "text-slate-500 dark:text-void-400"}`}>{value}</span>
    </div>
  );
}
