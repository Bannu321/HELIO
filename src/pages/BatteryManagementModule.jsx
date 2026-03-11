import React, { useState, useEffect } from "react";
import {
  BatteryCharging,
  ShieldAlert,
  Activity,
  Zap,
  Cpu,
  BrainCircuit,
  Sparkles,
  LineChart as ChartIcon,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock Data: 24h Battery SoC vs Campus Consumption
const batteryHistoryData = [
  { time: "00:00", soc: 65, consumption: 120 },
  { time: "04:00", soc: 40, consumption: 80 }, // Night base load draining battery
  { time: "08:00", soc: 30, consumption: 250 }, // Morning rush, solar starts
  { time: "12:00", soc: 85, consumption: 380 }, // High solar charging battery despite high load
  { time: "16:00", soc: 100, consumption: 320 }, // Fully charged
  { time: "20:00", soc: 80, consumption: 290 }, // Evening load, discharging
  { time: "23:59", soc: 60, consumption: 150 },
];

export default function BatteryManagementModule() {
  const [soc, setSoc] = useState(82.5);
  const [stability, setStability] = useState(98);
  const [isCharging, setIsCharging] = useState(true);

  // Core Integration Logic
  useEffect(() => {
    // interval only needs to restart when charging direction changes
    const syncInterval = setInterval(() => {
      setSoc((prevSoc) => {
        const delta = isCharging ? 0.02 : -0.04;
        const next = parseFloat(
          Math.min(Math.max(prevSoc + delta, 0), 100).toFixed(2),
        );

        // update stability based on the *new* soc value we just computed
        setStability((prevStab) => {
          const targetStability = next > 20 ? 99 : 75;
          const drift = (targetStability - prevStab) * 0.1;
          return parseFloat((prevStab + drift).toFixed(1));
        });

        return next;
      });
    }, 1000);
    return () => clearInterval(syncInterval);
  }, [isCharging]);

  const isStable = stability > 90;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* SECTION 1: GLOBAL STABILITY HUD */}
      <div
        className={`relative overflow-hidden rounded-3xl p-8 md:p-10 border transition-colors duration-500 ${
          isStable
            ? "bg-energy-green/5 border-energy-green/20 dark:bg-void-800 dark:border-void-600 shadow-green"
            : "bg-energy-rose/5 border-energy-rose/20 dark:bg-void-800 dark:border-energy-rose/30 shadow-[0_0_30px_rgba(255,76,106,0.15)]"
        }`}
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-xs font-mono tracking-[4px] text-slate-500 dark:text-void-300 mb-4 uppercase">
            <Activity className="w-4 h-4" /> Grid_Stability_Index
          </div>
          <div
            className={`font-display text-6xl md:text-8xl font-black tracking-tight mb-6 transition-colors duration-500 ${
              isStable ? "text-energy-green" : "text-energy-rose"
            }`}
          >
            {stability.toFixed(1)}
            <span className="text-3xl md:text-5xl opacity-50">%</span>
          </div>
          <div className="w-full max-w-2xl h-1.5 bg-slate-200 dark:bg-void-900 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-1000 ease-out ${isStable ? "bg-energy-green" : "bg-energy-rose"}`}
              style={{ width: `${stability}%` }}
            />
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-400 uppercase tracking-widest">
            STATUS:{" "}
            <span
              className={
                isStable
                  ? "text-energy-green font-bold"
                  : "text-energy-rose font-bold"
              }
            >
              {isStable ? "RELIANT" : "VULNERABLE"}
            </span>{" "}
            // NODE_SYNC: ACTIVE
          </p>
        </div>
      </div>

      {/* SECTION 2 & 3: ENERGY VAULT & CELL DIAGNOSTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-mono tracking-[3px] text-slate-500 dark:text-void-300 mb-8 uppercase">
            <BatteryCharging className="w-4 h-4 text-solar-500" />{" "}
            ENERGY_VAULT_01
          </div>

          <div className="flex items-center gap-8 md:gap-12 flex-1">
            <div className="relative p-2 border-2 border-slate-200 dark:border-void-600 rounded-xl w-24 flex flex-col gap-1.5 bg-slate-50 dark:bg-void-800">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-200 dark:bg-void-600 rounded-t-sm" />
              {[...Array(10)].map((_, i) => {
                const threshold = (10 - i) * 10;
                const isActive = threshold <= soc;
                return (
                  <div
                    key={i}
                    className={`h-4 rounded-sm transition-all duration-500 ${
                      isActive
                        ? "bg-energy-green shadow-[0_0_12px_rgba(0,229,160,0.4)]"
                        : "bg-slate-200 dark:bg-void-700"
                    }`}
                  />
                );
              })}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 dark:border-void-700 pb-3">
                <span className="text-xs font-mono text-slate-500 dark:text-void-300">
                  CHARGE_LEVEL
                </span>
                <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  {soc.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-100 dark:border-void-700 pb-3">
                <span className="text-xs font-mono text-slate-500 dark:text-void-300">
                  DIRECTION
                </span>
                <span
                  className={`font-mono font-bold text-sm ${isCharging ? "text-solar-500" : "text-energy-rose"}`}
                >
                  {isCharging ? "INFLOW_SOLAR" : "OUTFLOW_GRID"}
                </span>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setIsCharging(!isCharging)}
                  className="w-full flex items-center justify-center gap-2 border border-solar-500/50 hover:bg-solar-50 dark:hover:bg-solar-500/10 text-solar-600 dark:text-solar-400 font-mono text-xs font-bold tracking-widest px-4 py-3 rounded-lg transition-colors"
                >
                  <Zap className="w-4 h-4" /> TOGGLE_MANUAL_BYPASS
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-xs font-mono tracking-[3px] text-slate-500 dark:text-void-300 uppercase">
              <Cpu className="w-4 h-4 text-energy-cyan" />{" "}
              CELL_HEALTH_DIAGNOSTICS
            </div>
            <span className="text-xs font-mono text-energy-green bg-energy-green/10 px-2 py-1 rounded">
              OPTIMAL
            </span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 flex-1">
            {[...Array(12)].map((_, i) => {
              const voltage = (3.7 - Math.random() * 0.05).toFixed(2);
              return (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-void-800 border border-slate-200 dark:border-void-700 p-3 rounded-lg flex flex-col justify-between group hover:border-energy-cyan/50 transition-colors"
                >
                  <div className="text-[10px] font-mono text-slate-400 dark:text-void-400">
                    C_{String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="w-full h-1 bg-energy-cyan rounded-full my-2 opacity-80 group-hover:opacity-100 shadow-[0_0_8px_rgba(0,229,255,0.3)]" />
                  <div className="text-xs font-mono font-bold text-slate-700 dark:text-white">
                    {voltage}V
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: CHARGE / DISCHARGE GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChartIcon className="w-5 h-5 text-solar-500" />
            <h3 className="font-display font-bold text-slate-900 dark:text-white">
              Charge Profile vs. Campus Load
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer>
              <AreaChart
                data={batteryHistoryData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSoC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5A0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E5A0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4C6A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF4C6A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(150,150,150,0.1)"
                />
                <XAxis
                  dataKey="time"
                  stroke="#8892b0"
                  fontSize={10}
                  fontFamily="Space Mono"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#8892b0"
                  fontSize={10}
                  fontFamily="Space Mono"
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#FF4C6A"
                  fontSize={10}
                  fontFamily="Space Mono"
                  tickLine={false}
                  axisLine={false}
                  unit="kW"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 13, 20, 0.9)",
                    borderColor: "#222D42",
                    borderRadius: "8px",
                  }}
                />

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="soc"
                  name="Battery SoC (%)"
                  stroke="#00E5A0"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSoC)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="consumption"
                  name="Load (kW)"
                  stroke="#FF4C6A"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorCons)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SECTION 5: AI OPTIMIZATION ENGINE */}
        <div className="card-glow p-6 flex flex-col border-solar-200 dark:border-solar-500/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-solar-50 dark:bg-solar-500/10 rounded-lg text-solar-600 dark:text-solar-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white">
              AI Storage Logic
            </h3>
          </div>

          <div className="flex-1 space-y-4">
            {/* Prediction 1 */}
            <div className="bg-slate-50 dark:bg-void-800 p-4 rounded-xl border border-slate-200 dark:border-void-700">
              <div className="flex items-center gap-2 text-xs font-bold text-solar-600 dark:text-solar-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" /> Pre-Charge Suggested
              </div>
              <p className="text-sm text-slate-600 dark:text-void-200">
                Weather model predicts <strong>85% cloud cover</strong> tomorrow
                morning. Suggesting a 20% forced pre-charge from the grid
                tonight at 02:00 (off-peak tariff).
              </p>
              <button className="mt-3 text-xs font-mono text-slate-900 dark:text-white bg-slate-200 dark:bg-void-600 hover:bg-slate-300 dark:hover:bg-void-500 px-3 py-1.5 rounded transition-colors w-full text-left">
                [AUTHORIZE PRE-CHARGE]
              </button>
            </div>

            {/* Prediction 2 */}
            <div className="bg-slate-50 dark:bg-void-800 p-4 rounded-xl border border-slate-200 dark:border-void-700">
              <div className="flex items-center gap-2 text-xs font-bold text-energy-cyan uppercase tracking-wider mb-2">
                <Zap className="w-3 h-3" /> Discharge Optimization
              </div>
              <p className="text-sm text-slate-600 dark:text-void-200">
                Peak DISCOM tariff begins at 18:00. AI will hold battery charge
                until 17:55, then prioritize battery outflow to minimize grid
                import costs.
              </p>
            </div>

            {/* Anomaly Detection */}
            <div className="bg-slate-50 dark:bg-void-800 p-4 rounded-xl border border-slate-200 dark:border-void-700">
              <div className="flex items-center gap-2 text-xs font-bold text-energy-green uppercase tracking-wider mb-2">
                <ShieldAlert className="w-3 h-3" /> Resolved Anomaly
              </div>
              <p className="text-sm text-slate-600 dark:text-void-200">
                Cell string 4 exhibited minor voltage drift during noon peak.
                Active balancing circuit deployed. Issue resolved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
