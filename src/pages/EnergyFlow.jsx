import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sun, Plug, Battery, Leaf, BrainCircuit, Activity, Zap, ShieldAlert, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { fetchAIDecision } from "../services/api";
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

// Strategy badge styles
const STRATEGY_CONFIG = {
  BATTERY_PRIORITY: { label: 'Battery Priority',  color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',  icon: Battery },
  TRADE:            { label: 'P2P Trading',         color: 'bg-grid-500/20 text-grid-400 border-grid-500/30',    icon: TrendingUp },
  GRID_IMPORT:      { label: 'Grid Import',         color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',    icon: Plug },
  BALANCED:         { label: 'Balanced Mode',       color: 'bg-sky-500/20 text-sky-400 border-sky-500/30',       icon: Activity },
};

export default function EnergyFlow() {
  // Simulator Inputs
  const [irradiance, setIrradiance] = useState(800); // W/m² (0-1000)
  const [temperature, setTemperature] = useState(25); // °C (10-50)
  const [baseLoad, setBaseLoad] = useState(30); // kW (0-50)
  const [isGovGridImport, setIsGovGridImport] = useState(false);

  const [metrics, setMetrics] = useState({ solar: 0, load: 0, grid: 0, battery: 0, bState: 'standby' });
  const [caption, setCaption] = useState("");
  const [activePaths, setActivePaths] = useState([]);

  // AI Decision State
  const [aiDecision, setAiDecision]   = useState(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiLastUpdate, setAiLastUpdate] = useState(null);
  const debounceRef = useRef(null);

  const requestAIDecision = useCallback(async (irr, temp, load) => {
    setAiLoading(true);
    try {
      const decision = await fetchAIDecision({ irradiance: irr, temperature: temp, load });
      if (decision) {
        setAiDecision(decision);
        setAiLastUpdate(new Date());
      }
    } finally {
      setAiLoading(false);
    }
  }, []);

  // Trigger LLM re-analysis 1.5s after sliders stop moving
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      requestAIDecision(irradiance, temperature, baseLoad);
    }, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [irradiance, temperature, baseLoad, requestAIDecision]);

  // 🧠 GREEDY ALGORITHM: Ensures perfect mathematical balancing (Input = Output)
  useEffect(() => {
    let s = 0, l = 0, g = 0, b = 0;
    let paths = ['ai-load']; // Load is always drawing power
    let cap = "";
    let batteryState = 'standby';

    // Calculate simulated solar generation
    // Base capacity = 20kW. Derate based on temp (0.4% per degree above 25)
    const capacity = 40; // max possible generation in kW
    const tempDerating = temperature > 25 ? 1 - ((temperature - 25) * 0.004) : 1;
    s = capacity * (irradiance / 1000) * tempDerating;
    l = baseLoad;

    if (s > l + 2) { // Need a small buffer to prevent rapid switching text
      // STATE 1: Solar Excess (Charge Battery)
      b = s - l; 
      paths.push('solar-ai', 'ai-battery-charge');
      batteryState = 'charging';
      cap = "Solar excess charging the BESS (Battery Energy Storage System).";
    } else if (Math.abs(s - l) <= 2) {
      // STATE 2: Perfectly Balanced
      b = 0;
      g = 0;
      paths.push('solar-ai');
      cap = "Perfect balance. Solar generation matches campus load exactly.";
    } else {
      // STATE 3: Solar Deficit
      const deficit = l - s;
      
      if (isGovGridImport) {
        // OVERRIDE: Force grid import for the entire deficit
        b = 0;
        g = deficit;
        paths.push('solar-ai', 'grid-ai');
        batteryState = 'standby';
        cap = "Grid Override Active. Bypassing battery and importing deficit directly from the grid.";
      } else if (deficit <= 15) {
        // Draw from battery
        g = 0;
        paths.push('solar-ai', 'battery-ai-discharge');
        batteryState = 'discharging';
        cap = "Solar deficit. Discharging battery to meet campus load.";
      } else {
        b = 15; // Max battery draw
        g = deficit - 15; // Draw rest from grid
        paths.push('solar-ai', 'battery-ai-discharge', 'grid-ai');
        batteryState = 'discharging';
        cap = "High load / Low solar. Pulling from battery and power grid.";
      }
    }

    if (s === 0) {
      // No solar active path if 0
      paths = paths.filter(p => p !== 'solar-ai');
    }

    setMetrics({ solar: s, load: l, grid: g, battery: b, bState: batteryState });
    setCaption(cap);
    setActivePaths(paths);
  }, [irradiance, temperature, baseLoad, isGovGridImport]);

  // ── AI Decision Card render helper ──
  const renderAIDecision = () => {
    if (aiLoading) {
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-void-800/50 border border-void-700 text-void-400 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>HELIO AI analysing energy state...</span>
        </div>
      );
    }
    if (!aiDecision) {
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-void-800/50 border border-void-700 text-void-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>AI Engine offline — greedy algorithm active. Start the backend to enable AI decisions.</span>
        </div>
      );
    }
    const cfg = STRATEGY_CONFIG[aiDecision.strategy] || STRATEGY_CONFIG.BALANCED;
    const Icon = cfg.icon;
    const isOverride = aiDecision.override_greedy;
    return (
      <div className={`p-5 rounded-xl border ${ isOverride ? 'bg-amber-500/5 border-amber-500/25' : 'bg-void-800/50 border-void-700' }`}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${cfg.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${cfg.color}`}>{cfg.label}</span>
                {isOverride && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> OVERRIDES GREEDY
                  </span>
                )}
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${ aiDecision.source === 'llm' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20' }`}>
                  {aiDecision.source === 'llm' ? '🧠 AI' : '⚙️ Rules'}
                </span>
              </div>
              <p className="text-xs text-void-400 mt-1">
                {aiLastUpdate ? `Updated ${Math.round((new Date() - aiLastUpdate) / 1000)}s ago · Expires in ${aiDecision.expires_minutes}m` : ''}
              </p>
            </div>
          </div>
          {/* Confidence Bar */}
          <div className="flex items-center gap-2 text-xs text-void-400">
            <span>Confidence</span>
            <div className="w-24 h-1.5 bg-void-700 rounded-full overflow-hidden">
              <div className="h-full bg-grid-500 rounded-full transition-all" style={{ width: `${(aiDecision.confidence || 0) * 100}%` }} />
            </div>
            <span className="font-mono text-grid-400">{Math.round((aiDecision.confidence || 0) * 100)}%</span>
          </div>
        </div>
        <p className="text-sm text-slate-200 font-medium mb-1">{aiDecision.primary_action}</p>
        <p className="text-xs text-void-300 leading-relaxed mb-2">{aiDecision.reasoning}</p>
        {aiDecision.load_advice && (
          <div className="flex items-start gap-2 text-xs text-solar-400 bg-solar-500/5 border border-solar-500/15 rounded-lg px-3 py-2 mt-1">
            <Zap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{aiDecision.load_advice}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* 🚀 ANIMATION LOGIC: Notice the reverse-flow keyframe! */}
      <style>{`
        @keyframes flow { to { stroke-dashoffset: -24; } }
        @keyframes reverse-flow { to { stroke-dashoffset: 24; } }
        .path-flow { stroke-dasharray: 8; animation: flow 0.8s linear infinite; }
        .path-flow-reverse { stroke-dasharray: 8; animation: reverse-flow 0.8s linear infinite; }
      `}</style>

      <header>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
              Energy Flow &amp; Routing
            </h1>
            <p className="text-sm text-slate-500 dark:text-void-300 mt-1 font-mono">
              Greedy algorithm handles real-time routing · AI commander dictates strategy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-energy-cyan animate-pulse" />
              LIVE ROUTING
            </span>
            <span className="live-badge bg-violet-500/10 border-violet-500/20 text-violet-400">
              <BrainCircuit className="w-3 h-3" />
              AI ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* ── AI Override Command ─────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            AI Energy Commander
          </h2>
          <span className="text-xs text-void-400 font-mono ml-auto">
            Move sliders → AI re-analyses
          </span>
        </div>
        {renderAIDecision()}
      </div>

      {/* 🟢 Live Power Routing Animation */}
      <div className="card p-6 md:p-8 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-6">
          <div>
            <h2 className="font-display font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              Digital Twin Sandbox
              <span className="live-badge ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-energy-cyan animate-pulse" />
                INTERACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-void-300 mt-1">
              Adjust environmental inputs to test the greedy routing algorithm in real-time.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-void-900/50 rounded-xl p-4 border border-slate-200 dark:border-void-700 w-full md:w-auto min-w-[300px]">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono font-medium text-slate-600 dark:text-void-300 mb-2">
                  <span>Irradiance (W/m²)</span>
                  <span className="text-solar-600 dark:text-solar-400 font-bold">{irradiance}</span>
                </div>
                <input type="range" min="0" max="1000" step="10" value={irradiance} onChange={(e) => setIrradiance(Number(e.target.value))} className="w-full accent-solar-500" />
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-mono font-medium text-slate-600 dark:text-void-300 mb-2">
                  <span>Temperature (°C)</span>
                  <span className="text-energy-rose font-bold">{temperature}°C</span>
                </div>
                <input type="range" min="10" max="50" step="1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full accent-energy-rose" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono font-medium text-slate-600 dark:text-void-300 mb-2">
                  <span>Campus Load (kW)</span>
                  <span className="text-energy-green font-bold">{baseLoad} kW</span>
                </div>
                <input type="range" min="0" max="50" step="1" value={baseLoad} onChange={(e) => setBaseLoad(Number(e.target.value))} className="w-full accent-energy-green" />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsGovGridImport(!isGovGridImport)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                    isGovGridImport 
                      ? 'bg-energy-rose/20 text-energy-rose border border-energy-rose/40' 
                      : 'bg-slate-200 dark:bg-void-800 text-slate-500 dark:text-void-400 border border-slate-300 dark:border-void-700'
                  }`}
                >
                  <Plug className="w-4 h-4" />
                  {isGovGridImport ? "GOV GRID IMPORT: ACTIVE" : "FORCE GOV GRID IMPORT"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center font-mono text-sm font-bold text-slate-700 dark:text-white mb-6 bg-slate-100 dark:bg-void-800 py-3 px-4 rounded-lg border border-slate-200 dark:border-void-600 transition-all duration-300 min-h-[46px] flex items-center justify-center">
          {caption}
        </div>

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
