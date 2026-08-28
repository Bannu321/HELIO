import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home, Sun, Zap, Battery, BatteryWarning, BatteryLow, BatteryCharging,
  ArrowRightLeft, Activity, Share2, TrendingUp, TrendingDown,
  Minus, Wifi, WifiOff, RefreshCw, Leaf, AlertTriangle,
  ShieldAlert, Clock, PlugZap, Play, Pause, FastForward,
  Info, ShieldCheck, ThermometerSun, ChevronRight, BarChart3,
  CloudRain, Sunset, CheckCircle2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// ─── Solar Guardian API ───────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";

// Exact usable battery capacity per house (kWh)
const getBatteryCapacityKwh = (house) => {
  if (house?.battery_capacity_kwh) return house.battery_capacity_kwh;
  return 13.5;
};

const HOUSE_META = [
  { color: "#f59e0b", glowColor: "rgba(245,158,11,0.35)", defaultCap: 13.5 },
  { color: "#22d3ee", glowColor: "rgba(34,211,238,0.35)", defaultCap: 15.0 },
  { color: "#a78bfa", glowColor: "rgba(167,139,250,0.35)", defaultCap: 10.0 },
  { color: "#34d399", glowColor: "rgba(52,211,153,0.35)", defaultCap: 20.0 },
];

const HOUSE_POSITIONS = [
  { x: 22, y: 25 }, { x: 78, y: 25 }, { x: 22, y: 75 }, { x: 78, y: 75 },
];

const CONNECTIONS = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3], [1, 2]];

// ─── Real-World Case Studies & Scenarios ──────────────────────────────────────
const PRESET_SCENARIOS = {
  midday_p2p: {
    id: "midday_p2p",
    name: "☀️ Midday P2P Trade",
    badge: "Normal Operation",
    description: "High solar generation across most homes. Surpluses cover deficit homes via P2P trade before batteries need to discharge.",
    icon: Sun,
    houses: [
      { id: 1, name: "Eco Villa 101", solar: 24.5, consumption: 14.2, battery: 82, battery_capacity_kwh: 13.5, panel_num: 18 },
      { id: 2, name: "Solar Haven 202", solar: 32.0, consumption: 20.5, battery: 78, battery_capacity_kwh: 15.0, panel_num: 24 },
      { id: 3, name: "Green Horizon 303", solar: 8.5, consumption: 16.0, battery: 50, battery_capacity_kwh: 10.0, panel_num: 10 },
      { id: 4, name: "Sunridge Home 404", solar: 38.0, consumption: 18.0, battery: 92, battery_capacity_kwh: 20.0, panel_num: 28 },
    ]
  },
  evening_deficit: {
    id: "evening_deficit",
    name: "🌆 Evening Peak Deficit",
    badge: "P2P Depleted → Battery Drain",
    description: "Solar production drops to zero at dusk while home demand spikes (cooking, HVAC, EV charging). All homes draw directly from battery reserves.",
    icon: Sunset,
    houses: [
      { id: 1, name: "Eco Villa 101", solar: 0.8, consumption: 18.5, battery: 70, battery_capacity_kwh: 13.5, panel_num: 18 },
      { id: 2, name: "Solar Haven 202", solar: 1.2, consumption: 24.0, battery: 65, battery_capacity_kwh: 15.0, panel_num: 24 },
      { id: 3, name: "Green Horizon 303", solar: 0.2, consumption: 17.5, battery: 42, battery_capacity_kwh: 10.0, panel_num: 10 },
      { id: 4, name: "Sunridge Home 404", solar: 1.5, consumption: 22.0, battery: 80, battery_capacity_kwh: 20.0, panel_num: 28 },
    ]
  },
  isolated_deficit: {
    id: "isolated_deficit",
    name: "⚡ Isolated House Deficit",
    badge: "100% Battery-Only Fallback",
    description: "House 3 experiences extreme local deficit (0 solar, 19 kW load) with neighbors having no surplus to trade. Runs 100% on battery backup.",
    icon: Zap,
    houses: [
      { id: 1, name: "Eco Villa 101", solar: 15.0, consumption: 15.0, battery: 75, battery_capacity_kwh: 13.5, panel_num: 18 },
      { id: 2, name: "Solar Haven 202", solar: 19.0, consumption: 19.0, battery: 70, battery_capacity_kwh: 15.0, panel_num: 24 },
      { id: 3, name: "Green Horizon 303", solar: 0.0, consumption: 19.2, battery: 38, battery_capacity_kwh: 10.0, panel_num: 10 },
      { id: 4, name: "Sunridge Home 404", solar: 17.5, consumption: 17.5, battery: 85, battery_capacity_kwh: 20.0, panel_num: 28 },
    ]
  },
  storm_blackout: {
    id: "storm_blackout",
    name: "⛈️ Storm Blackout (Critical)",
    badge: "Critical Battery Defense",
    description: "Prolonged cloudy storm and grid outage. Batteries drop toward critical 15% threshold; DoD protection & load shedding alarms trigger.",
    icon: CloudRain,
    houses: [
      { id: 1, name: "Eco Villa 101", solar: 1.2, consumption: 16.0, battery: 22, battery_capacity_kwh: 13.5, panel_num: 18 },
      { id: 2, name: "Solar Haven 202", solar: 1.5, consumption: 20.0, battery: 18, battery_capacity_kwh: 15.0, panel_num: 24 },
      { id: 3, name: "Green Horizon 303", solar: 0.5, consumption: 14.0, battery: 14, battery_capacity_kwh: 10.0, panel_num: 10 },
      { id: 4, name: "Sunridge Home 404", solar: 2.0, consumption: 18.0, battery: 25, battery_capacity_kwh: 20.0, panel_num: 28 },
    ]
  }
};

// ─── Energy Sharing Algorithm ─────────────────────────────────────────────────
function computeEnergySharing(houses) {
  const states = houses.map((h) => ({ id: h.id, net: (h.solar || 0) - (h.consumption || 0), color: h.color }));
  const surplus = states.filter((s) => s.net > 0).sort((a, b) => b.net - a.net);
  const deficit = states.filter((s) => s.net < 0).sort((a, b) => a.net - b.net);
  const flows = [];
  const remaining = states.map((s) => ({ ...s, rem: Math.abs(s.net) }));
  let si = 0, di = 0;
  while (si < surplus.length && di < deficit.length) {
    const src = surplus[si], dst = deficit[di];
    const srcRem = remaining.find((r) => r.id === src.id);
    const dstRem = remaining.find((r) => r.id === dst.id);
    const amount = Math.min(srcRem.rem, dstRem.rem);
    if (amount > 0.3) flows.push({ from: src.id - 1, to: dst.id - 1, amount: +amount.toFixed(1) });
    srcRem.rem -= amount; dstRem.rem -= amount;
    if (srcRem.rem < 0.3) si++;
    if (dstRem.rem < 0.3) di++;
  }
  return { states, flows };
}

// ─── Energy Priority Resolution per house ────────────────────────────────────
// Priority: 1) Solar self-gen  2) Traded power from surplus neighbours
//           3) Battery backup   → BATTERY ONLY if no solar & no supplier
function resolveEnergyPriority(house, flows, allHouses) {
  const solar = house.solar || 0;
  const consumption = house.consumption || 1;
  const hIdx = allHouses.findIndex((h) => h.id === house.id);

  // Traded power received by this house from neighbours
  const receivedFlow = flows.find((f) => f.to === hIdx);
  const tradedKwh = receivedFlow ? receivedFlow.amount : 0;

  // 1. Solar covers it fully → "Solar"
  const solarCoverage = Math.min(solar, consumption);
  let remaining = consumption - solarCoverage;

  // 2. Trade covers the rest → "Trade"
  const tradeCoverage = Math.min(tradedKwh, remaining);
  remaining -= tradeCoverage;

  // 3. Battery covers leftover → "Battery backup" or "Battery Only"
  const battCap = getBatteryCapacityKwh(house);
  const battKwhAvail = house.battery_kwh != null ? house.battery_kwh : ((house.battery || 0) / 100) * battCap;
  
  // Only allow battery discharge down to 10% DoD (Depth of Discharge)
  const minReserveKwh = battCap * 0.1;
  const usableBattKwh = Math.max(0, battKwhAvail - minReserveKwh);
  const batteryUsed = Math.min(remaining, usableBattKwh);
  remaining -= batteryUsed;

  // 4. Fallback to Live Power Supply (Grid Import) if still remaining
  const gridUsed = remaining > 0.1 ? remaining : 0;
  remaining -= gridUsed;

  const batteryOnly = solar < 0.5 && tradedKwh < 0.5 && battKwhAvail > minReserveKwh;
  const isDraining = batteryUsed > 0.1;
  const isCharging = solar > consumption && house.battery < 100;
  const blackout = remaining > 0.1; // Should be 0 now due to grid fallback

  // Time remaining on battery at current draw rate (hours)
  const batteryDrawRate = batteryUsed > 0 ? batteryUsed : (batteryOnly ? consumption : 0); // kWh/h equivalent
  const hoursLeft = batteryDrawRate > 0 ? usableBattKwh / batteryDrawRate : Infinity;
  const minutesLeft = isFinite(hoursLeft) ? Math.round(hoursLeft * 60) : null;

  // C-rate estimate (discharge power / capacity)
  const cRate = battCap > 0 ? +(batteryDrawRate / battCap).toFixed(2) : 0;

  return {
    solarCoverage: +solarCoverage.toFixed(2),
    tradedKwh: +tradedKwh.toFixed(2),
    batteryUsed: +batteryUsed.toFixed(2),
    gridUsed: +gridUsed.toFixed(2),
    batteryDrawRate: +batteryDrawRate.toFixed(2),
    battKwhAvail: +battKwhAvail.toFixed(2),
    battCap: +battCap.toFixed(1),
    batteryOnly,
    isDraining,
    isCharging,
    cRate,
    blackout,
    minutesLeft,
    sources: [
      ...(solarCoverage > 0 ? [{ label: "Solar", kwh: solarCoverage, color: "#fbbf24", Icon: Sun }] : []),
      ...(tradeCoverage > 0 ? [{ label: "Trade", kwh: tradeCoverage, color: "#22d3ee", Icon: ArrowRightLeft }] : []),
      ...(batteryUsed > 0 ? [{ label: "Battery", kwh: batteryUsed, color: "#818cf8", Icon: Battery }] : []),
      ...(gridUsed > 0 ? [{ label: "Grid", kwh: gridUsed, color: "#9ca3af", Icon: Zap }] : []),
    ],
  };
}

// ─── SVG Flow Lines ───────────────────────────────────────────────────────────
function FlowLine({ x1, y1, x2, y2, color, amount }) {
  const t = Math.min(2 + amount / 10, 5);
  const uid = `fl-${x1}-${y1}-${x2}-${y2}`;
  return (
    <g>
      <defs>
        <marker id={uid} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={color} />
        </marker>
      </defs>
      <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={color} strokeWidth={t + 3} opacity="0.12" />
      <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={color} strokeWidth={t}
        strokeDasharray="8 6" opacity="0.92" markerEnd={`url(#${uid})`}
        style={{ animation: "flowDash 1.2s linear infinite" }} />
    </g>
  );
}

function IdleLine({ x1, y1, x2, y2, isDark }) {
  return (
    <line
      x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
      stroke={isDark ? "rgba(148,163,184,0.18)" : "rgba(100,116,139,0.25)"}
      strokeWidth="1.5" strokeDasharray="4 5"
    />
  );
}

// ─── House Node Card (topology map) ──────────────────────────────────────────
function HouseNode({ house, priority, position, isSelected, onSelect, isDark }) {
  const net = (house.solar || 0) - (house.consumption || 0);
  const status = net > 0.5 ? "surplus" : net < -0.5 ? "deficit" : "balanced";
  const sm = {
    surplus: { Icon: TrendingUp, col: "#34d399" },
    deficit: { Icon: TrendingDown, col: "#fb7185" },
    balanced: { Icon: Minus, col: "#fbbf24" },
  };
  const { Icon, col } = sm[status];

  const cardBg = isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.96)";
  const cardBorder = priority.isDraining
    ? "#818cf8"
    : isSelected ? house.color
    : isDark ? "rgba(148,163,184,0.16)" : "rgba(100,116,139,0.2)";
  const netColor = isDark ? (net >= 0 ? "#34d399" : "#fb7185") : (net >= 0 ? "#16a34a" : "#e11d48");
  const unitColor = isDark ? "#64748b" : "#94a3b8";

  // Battery status color
  const battColor = house.battery > 50 ? "#34d399" : house.battery > 20 ? "#fbbf24" : "#fb7185";

  return (
    <div
      onClick={() => onSelect(house.id)}
      style={{
        position: "absolute", left: `${position.x}%`, top: `${position.y}%`,
        transform: "translate(-50%,-50%)", width: "196px", cursor: "pointer",
        zIndex: isSelected ? 20 : 10, transition: "all 0.3s",
      }}
    >
      <div style={{
        position: "absolute", inset: "-4px", borderRadius: "18px",
        background: `radial-gradient(ellipse,${priority.isDraining ? "rgba(129,140,248,0.45)" : house.glowColor} 0%,transparent 70%)`,
        opacity: isSelected ? 1 : priority.isDraining ? 0.85 : 0.4,
        pointerEvents: "none", transition: "opacity 0.3s",
      }} />
      <div style={{
        background: cardBg, backdropFilter: "blur(16px)",
        border: `1.5px solid ${cardBorder}`, borderRadius: "13px", padding: "11px",
        boxShadow: isSelected
          ? `0 0 24px ${house.glowColor},0 8px 32px rgba(0,0,0,${isDark ? "0.5" : "0.12"})`
          : priority.isDraining
          ? "0 0 18px rgba(129,140,248,0.3), 0 4px 16px rgba(0,0,0,0.3)"
          : `0 4px 16px rgba(0,0,0,${isDark ? "0.4" : "0.08"})`,
        transition: "all 0.3s",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
          <div style={{
            width: "25px", height: "25px", borderRadius: "7px",
            background: `${house.color}1a`, border: `1px solid ${house.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Home style={{ width: "12px", height: "12px", color: house.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: house.color, lineHeight: 1.2 }}>{house.name}</div>
            <div style={{ fontSize: "9px", color: col, display: "flex", alignItems: "center", gap: "3px" }}>
              <Icon style={{ width: "8px", height: "8px" }} />{status}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, fontFamily: "monospace", color: netColor }}>
              {net >= 0 ? "+" : ""}{net.toFixed(1)}
            </div>
            <div style={{ fontSize: "8px", color: unitColor }}>kWh net</div>
          </div>
        </div>

        {/* Solar & Load metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "6px" }}>
          <div style={{ background: isDark ? "rgba(251,191,36,0.08)" : "rgba(251,191,36,0.12)", borderRadius: "6px", padding: "3px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "8px", color: "#fbbf24", display: "flex", alignItems: "center", gap: "3px" }}>
              <Sun style={{ width: "8px", height: "8px" }} /> Solar
            </span>
            <span style={{ fontSize: "9px", fontWeight: 700, fontFamily: "monospace", color: "#fbbf24" }}>{house.solar.toFixed(1)} <span style={{ fontSize: "7px" }}>kWh</span></span>
          </div>
          <div style={{ background: isDark ? "rgba(251,113,133,0.08)" : "rgba(251,113,133,0.12)", borderRadius: "6px", padding: "3px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "8px", color: "#fb7185", display: "flex", alignItems: "center", gap: "3px" }}>
              <Zap style={{ width: "8px", height: "8px" }} /> Load
            </span>
            <span style={{ fontSize: "9px", fontWeight: 700, fontFamily: "monospace", color: "#fb7185" }}>{house.consumption.toFixed(1)} <span style={{ fontSize: "7px" }}>kWh</span></span>
          </div>
        </div>

        {/* Live Draw State Indicator */}
        {priority.gridUsed > 0.1 ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(156,163,175,0.15)", border: "1px solid rgba(156,163,175,0.4)",
            borderRadius: "6px", padding: "3px 6px", marginBottom: "6px",
            animation: "battPulse 1.8s ease-in-out infinite",
          }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "#9ca3af", display: "flex", alignItems: "center", gap: "3px" }}>
              <Zap style={{ width: "8px", height: "8px" }} /> LIVE GRID IMPORT
            </span>
            <span style={{ fontSize: "8.5px", fontFamily: "monospace", fontWeight: 800, color: "#9ca3af" }}>
              {priority.gridUsed.toFixed(1)} kW
            </span>
          </div>
        ) : priority.isDraining ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.4)",
            borderRadius: "6px", padding: "3px 6px", marginBottom: "6px",
            animation: "battPulse 1.8s ease-in-out infinite",
          }}>
            <span style={{ fontSize: "8px", fontWeight: 700, color: "#818cf8", display: "flex", alignItems: "center", gap: "3px" }}>
              <Zap style={{ width: "8px", height: "8px" }} /> DISCHARGING DEFICIT
            </span>
            <span style={{ fontSize: "8.5px", fontFamily: "monospace", fontWeight: 800, color: "#818cf8" }}>
              -{priority.batteryDrawRate.toFixed(1)} kW
            </span>
          </div>
        ) : null}

        {/* Priority breakdown badges */}
        <div style={{ display: "flex", gap: "3px", marginBottom: "7px", flexWrap: "wrap" }}>
          {priority.sources.map((s) => (
            <div key={s.label} style={{
              display: "flex", alignItems: "center", gap: "2px",
              background: `${s.color}18`, border: `1px solid ${s.color}40`,
              borderRadius: "4px", padding: "1px 5px", fontSize: "7.5px", fontWeight: 700, color: s.color,
            }}>
              <s.Icon style={{ width: "7px", height: "7px" }} />
              {s.label} {s.kwh.toFixed(1)} kWh
            </div>
          ))}
        </div>

        {/* Battery in kWh and % */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Battery style={{ width: "10px", height: "10px", color: battColor, flexShrink: 0 }} />
          <div style={{ flex: 1, height: "4px", background: isDark ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.15)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${house.battery}%`, background: `linear-gradient(90deg,${battColor}99,${battColor})`, borderRadius: "4px", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontFamily: "monospace", fontSize: "8.5px", color: battColor, fontWeight: 700, flexShrink: 0 }}>
            {priority.battKwhAvail.toFixed(1)} kWh <span style={{ opacity: 0.7, fontSize: "7.5px" }}>({Math.round(house.battery)}%)</span>
          </span>
        </div>

        {/* Real-time Time-to-Empty Countdown */}
        {priority.minutesLeft !== null && priority.minutesLeft < 600 && (
          <div style={{
            marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: priority.minutesLeft < 60 ? "rgba(251,113,133,0.12)" : "rgba(129,140,248,0.1)",
            border: `1px solid ${priority.minutesLeft < 60 ? "rgba(251,113,133,0.3)" : "rgba(129,140,248,0.25)"}`,
            borderRadius: "6px", padding: "3px 6px",
          }}>
            <span style={{ fontSize: "8px", display: "flex", alignItems: "center", gap: "3px", color: priority.minutesLeft < 60 ? "#fb7185" : "#818cf8" }}>
              <Clock style={{ width: "8px", height: "8px" }} /> Time to Empty:
            </span>
            <span style={{ fontSize: "8.5px", fontFamily: "monospace", fontWeight: 800, color: priority.minutesLeft < 60 ? "#fb7185" : "#818cf8" }}>
              {priority.minutesLeft >= 60
                ? `${Math.floor(priority.minutesLeft / 60)}h ${priority.minutesLeft % 60}m`
                : `${priority.minutesLeft}m remaining`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── House Energy Panel (right sidebar) ──────────────────────────────────────
function HouseEnergyCard({ house, priority, isDark }) {
  const battCritical = house.battery < 20;
  const battLow = house.battery < 40;
  const battColor = house.battery > 50 ? "#34d399" : battLow ? "#fbbf24" : "#fb7185";
  const cardBg = isDark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.92)";
  const cardBorder = priority.isDraining
    ? "rgba(129,140,248,0.45)"
    : isDark ? `${house.color}25` : `${house.color}30`;
  const muted = isDark ? "#64748b" : "#94a3b8";
  const text = isDark ? "#cbd5e1" : "#334155";

  return (
    <div style={{
      background: cardBg, border: `1px solid ${cardBorder}`,
      borderRadius: "13px", padding: "13px", backdropFilter: "blur(12px)",
      transition: "all 0.3s",
      boxShadow: priority.isDraining
        ? "0 0 16px rgba(129,140,248,0.25)"
        : "none",
    }}>
      {/* House header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <div style={{
          width: "24px", height: "24px", borderRadius: "7px",
          background: `${house.color}18`, border: `1px solid ${house.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Home style={{ width: "12px", height: "12px", color: house.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: house.color }}>{house.name}</div>
          <div style={{ fontSize: "8.5px", color: muted }}>{house.panel_num} panels · {house.efficiency_per_panel ?? "—"} kWh/panel</div>
        </div>
        {priority.isDraining && (
          <div style={{
            display: "flex", alignItems: "center", gap: "3px",
            background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.4)",
            borderRadius: "6px", padding: "3px 6px", fontSize: "8px", fontWeight: 700, color: "#818cf8",
          }}>
            <Zap style={{ width: "8px", height: "8px" }} />
            DEFICIT DRAW: -{priority.batteryDrawRate}kW
          </div>
        )}
      </div>

      {/* Energy source priority breakdown */}
      <div style={{ marginBottom: "9px" }}>
        <div style={{ fontSize: "8px", color: muted, fontFamily: "monospace", letterSpacing: "1.5px", marginBottom: "5px" }}>
          ENERGY SOURCE LADDER
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {[
            { label: "① Solar First", kwh: priority.solarCoverage, max: house.consumption, color: "#fbbf24", Icon: Sun, active: priority.solarCoverage > 0 },
            { label: "② Neighbor Trade", kwh: priority.tradedKwh, max: house.consumption, color: "#22d3ee", Icon: ArrowRightLeft, active: priority.tradedKwh > 0 },
            { label: "③ Battery Reserve", kwh: priority.batteryUsed, max: house.consumption, color: "#818cf8", Icon: Battery, active: priority.batteryUsed > 0 },
          ].map((row) => (
            <div key={row.label} style={{ opacity: row.active ? 1 : 0.35 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                <row.Icon style={{ width: "9px", height: "9px", color: row.color, flexShrink: 0 }} />
                <span style={{ fontSize: "8.5px", color: row.active ? text : muted, flex: 1 }}>{row.label}</span>
                <span style={{ fontFamily: "monospace", fontSize: "9px", fontWeight: 700, color: row.active ? row.color : muted }}>
                  {row.kwh.toFixed(2)} kWh
                </span>
              </div>
              <div style={{ height: "3px", background: isDark ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.12)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${house.consumption > 0 ? Math.min(100, (row.kwh / house.consumption) * 100) : 0}%`,
                  background: row.color, borderRadius: "3px", transition: "width 0.4s",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Battery status card */}
      <div style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(248,250,252,0.9)",
        border: `1px solid ${battColor}30`,
        borderRadius: "9px", padding: "8px 10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          {battCritical
            ? <BatteryLow style={{ width: "11px", height: "11px", color: "#fb7185" }} />
            : battLow
            ? <BatteryWarning style={{ width: "11px", height: "11px", color: "#fbbf24" }} />
            : <Battery style={{ width: "11px", height: "11px", color: battColor }} />
          }
          <span style={{ fontSize: "9px", color: muted, flex: 1 }}>Storage Capacity</span>
          <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 800, color: battColor }}>
            {priority.battKwhAvail.toFixed(2)} / {priority.battCap.toFixed(1)} kWh
          </span>
          <span style={{ fontSize: "8px", color: muted, fontFamily: "monospace" }}>({Math.round(house.battery)}%)</span>
        </div>
        <div style={{ height: "5px", background: isDark ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.12)", borderRadius: "5px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${house.battery}%`,
            background: `linear-gradient(90deg,${battColor}99,${battColor})`,
            borderRadius: "5px", transition: "width 0.4s",
          }} />
        </div>

        {/* Live Metrics: Discharge rate & Time to Empty */}
        <div style={{ marginTop: "6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "8px", fontFamily: "monospace" }}>
          <div style={{ background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.04)", padding: "3px 5px", borderRadius: "5px" }}>
            <span style={{ color: muted }}>Drain Rate: </span>
            <span style={{ fontWeight: 700, color: priority.isDraining ? "#818cf8" : "#34d399" }}>
              {priority.isDraining ? `-${priority.batteryDrawRate} kW` : "0.0 kW (Idle)"}
            </span>
          </div>
          <div style={{ background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.04)", padding: "3px 5px", borderRadius: "5px" }}>
            <span style={{ color: muted }}>C-Rate: </span>
            <span style={{ fontWeight: 700, color: text }}>{priority.cRate}C</span>
          </div>
        </div>

        {/* Countdown */}
        {priority.minutesLeft !== null && (
          <div style={{ marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock style={{ width: "8px", height: "8px", color: priority.minutesLeft < 60 ? "#fb7185" : muted }} />
            <span style={{ fontSize: "8px", fontFamily: "monospace", color: priority.minutesLeft < 60 ? "#fb7185" : muted }}>
              {priority.minutesLeft >= 60
                ? `~${Math.floor(priority.minutesLeft / 60)}h ${priority.minutesLeft % 60}m time to empty`
                : `~${priority.minutesLeft}m time to empty`}
            </span>
          </div>
        )}
        {battCritical && (
          <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", color: "#fb7185", fontSize: "8px", fontWeight: 700 }}>
            <AlertTriangle style={{ width: "8px", height: "8px" }} />
            CRITICAL — Depth of Discharge (DoD) protection active
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Case Analysis Breakdown Panel ────────────────────────────────────────────
function CaseAnalysisPanel({ activeScenario, isDark }) {
  const bg = isDark ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.9)";
  const border = isDark ? "rgba(148,163,184,0.12)" : "rgba(100,116,139,0.15)";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";

  const cases = [
    {
      title: "Case 1: P2P Solar Trade Buffer (Primary Defense)",
      desc: "Before any home touches its chemical battery bank, excess solar is transferred over the peer-to-peer microgrid. This avoids 12% round-trip battery inverter losses and preserves lithium cycle life.",
      eff: "98% Transmission Efficiency",
      status: "Active when neighbor solar > neighbor load",
      color: "#22d3ee",
      Icon: ArrowRightLeft,
    },
    {
      title: "Case 2: Deficit Battery Discharging (Secondary Fallback)",
      desc: "When community solar is depleted (nightfall or storm), deficit homes discharge their battery bank in real time. The draw rate is calibrated to household kW demand.",
      eff: "88-92% Round-Trip Inverter Efficiency",
      status: "Active when neighbor surplus = 0",
      color: "#818cf8",
      Icon: BatteryCharging,
    },
    {
      title: "Case 3: Depth-of-Discharge (DoD) & Islanding Defense",
      desc: "Batteries maintain a 15% safety reserve. When SoC drops below 20%, automated alerts flag critical load shedding to prevent total blackout and cellular degradation.",
      eff: "15% Hard Reserve Buffer",
      status: "Emergency defense threshold",
      color: "#fb7185",
      Icon: ShieldAlert,
    },
  ];

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: "14px",
      padding: "16px", backdropFilter: "blur(8px)", marginTop: "14px",
      transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BarChart3 style={{ width: "16px", height: "16px", color: "#fbbf24" }} />
          <h3 style={{ margin: 0, fontSize: "12.5px", fontWeight: 700, color: textPrimary }}>
            Microgrid Operational Case Studies & Deficit Analysis
          </h3>
        </div>
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "2px 8px", borderRadius: "6px" }}>
          Live Dynamic Model
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
        {cases.map((c) => (
          <div key={c.title} style={{
            background: isDark ? "rgba(255,255,255,0.02)" : "rgba(248,250,252,0.95)",
            border: `1px solid ${c.color}25`, borderRadius: "10px", padding: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <c.Icon style={{ width: "14px", height: "14px", color: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: "10.5px", fontWeight: 700, color: c.color }}>{c.title}</span>
            </div>
            <p style={{ fontSize: "9.5px", color: textSecondary, margin: "0 0 8px 0", lineHeight: 1.4 }}>
              {c.desc}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "8.5px", fontFamily: "monospace", borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", paddingTop: "6px" }}>
              <span style={{ color: c.color, fontWeight: 700 }}>{c.eff}</span>
              <span style={{ color: textSecondary }}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GridCommunity() {
  const { isDark } = useTheme();
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [apiStatus, setApiStatus] = useState("loading");
  const [lastPoll, setLastPoll] = useState(null);
  
  // Real-time Simulation Engine State
  const [activeScenario, setActiveScenario] = useState("midday_p2p");
  const [simSpeed, setSimSpeed] = useState(5); // 1x, 5x, 20x multiplier for visible drain
  const [isSimRunning, setIsSimRunning] = useState(true);
  const simIntervalRef = useRef(null);

  const mergeWithMeta = (rawHouses) =>
    rawHouses.map((h, i) => {
      const meta = HOUSE_META[i % HOUSE_META.length];
      const battCap = h.battery_capacity_kwh || meta.defaultCap;
      const battPct = h.battery != null ? h.battery : 80;
      const battKwh = h.battery_kwh != null ? h.battery_kwh : (battPct / 100) * battCap;
      return {
        ...h,
        solar: h.solar_generation != null ? h.solar_generation : (h.solar || 0),
        consumption: h.consumption || 15.0,
        battery: battPct,
        battery_capacity_kwh: battCap,
        battery_kwh: battKwh,
        ...meta,
      };
    });

  // Load preset scenario
  const applyScenario = (scenarioKey) => {
    setActiveScenario(scenarioKey);
    const scenario = PRESET_SCENARIOS[scenarioKey];
    if (scenario) {
      setHouses(mergeWithMeta(scenario.houses));
    }
  };

  // ── Fetch from Solar Guardian API ──────────────────────────────────────────
  const fetchHouses = useCallback(async (silent = false) => {
    if (!silent) setApiStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/houses`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error("non-2xx");
      const data = await res.json();
      setHouses(mergeWithMeta(data));
      setApiStatus("online");
      setLastPoll(new Date());
    } catch {
      if (!silent) setApiStatus("offline");
      else setApiStatus((prev) => (prev === "online" ? "online" : "offline"));
      // Apply default active scenario on first load
      setHouses((prev) => (prev.length === 0 ? mergeWithMeta(PRESET_SCENARIOS.midday_p2p.houses) : prev));
    }
  }, []);

  useEffect(() => {
    // Only fetch once on mount to establish baseline if no scenario is active
    fetchHouses();
    
    // Polling disabled to prevent overwriting local simulation scenarios.
    // const t = setInterval(() => fetchHouses(true), 10000);
    // return () => clearInterval(t);
  }, [fetchHouses]);

  // ── Real-Time Live Battery Drain & Charge Physics Simulation Engine ──────────
  useEffect(() => {
    if (!isSimRunning) return;

    const intervalMs = 1000;
    simIntervalRef.current = setInterval(() => {
      setHouses((prevHouses) => {
        if (!prevHouses || prevHouses.length === 0) return prevHouses;

        const { flows } = computeEnergySharing(prevHouses);

        return prevHouses.map((h) => {
          const priority = resolveEnergyPriority(h, flows, prevHouses);
          const battCap = getBatteryCapacityKwh(h);
          let currentKwh = h.battery_kwh != null ? h.battery_kwh : (h.battery / 100) * battCap;

          if (priority.isDraining) {
            // Drain battery based on deficit draw rate scaled by simSpeed
            // 1 hr = 3600 seconds. Draw in 1 second = (rate / 3600) * simSpeed
            const drainKwh = (priority.batteryDrawRate / 3600) * simSpeed;
            // Minimum DoD limit 10% (1.35 kWh)
            const minReserve = battCap * 0.1;
            currentKwh = Math.max(minReserve, currentKwh - drainKwh);
          } else if (priority.isCharging) {
            // Surplus solar slowly recharges battery
            const surplusRate = (h.solar - h.consumption);
            const chargeKwh = (surplusRate / 3600) * (simSpeed * 0.5);
            currentKwh = Math.min(battCap, currentKwh + chargeKwh);
          }

          const newPct = Math.min(100, Math.max(0, (currentKwh / battCap) * 100));

          return {
            ...h,
            battery: +newPct.toFixed(1),
            battery_kwh: +currentKwh.toFixed(3),
          };
        });
      });
    }, intervalMs);

    return () => clearInterval(simIntervalRef.current);
  }, [isSimRunning, simSpeed]);

  const handleSelect = (id) => setSelectedHouse((prev) => (prev === id ? null : id));

  // ── Derived: flows + priority per house ────────────────────────────────────
  const { flows } = computeEnergySharing(houses);
  const priorities = houses.map((h) => resolveEnergyPriority(h, flows, houses));

  const totalSolar    = houses.reduce((s, h) => s + (h.solar || 0), 0).toFixed(1);
  const totalLoad     = houses.reduce((s, h) => s + (h.consumption || 0), 0).toFixed(1);
  const totalNet      = (+totalSolar - +totalLoad).toFixed(1);
  const sharedEnergy  = flows.reduce((s, f) => s + f.amount, 0).toFixed(1);
  const totalCO2      = houses.reduce((s, h) => s + ((h.solar || 0) * 0.85), 0).toFixed(1);
  const totalBattKwh  = priorities.reduce((s, p) => s + (p.battKwhAvail || 0), 0).toFixed(1);
  const totalBattCap  = priorities.reduce((s, p) => s + (p.battCap || 0), 0).toFixed(1);
  const drainingCount = priorities.filter((p) => p.isDraining).length;

  const summaryStats = [
    { label: "Total Solar",  value: `${totalSolar} kWh`,  color: "#fbbf24", Icon: Sun },
    { label: "Total Load",   value: `${totalLoad} kWh`,   color: "#fb7185", Icon: Zap },
    { label: "Net Balance",  value: `${+totalNet >= 0 ? "+" : ""}${totalNet} kWh`, color: +totalNet >= 0 ? "#34d399" : "#fb7185", Icon: Activity },
    { label: "Traded",       value: `${sharedEnergy} kWh`, color: "#22d3ee", Icon: ArrowRightLeft },
    { label: "Battery Bank", value: `${totalBattKwh} / ${totalBattCap} kWh`, color: "#818cf8", Icon: Battery },
    { label: "CO₂ Saved",   value: `${totalCO2} kg`,      color: "#34d399", Icon: Leaf },
  ];

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const panelBg      = isDark ? "rgba(14,20,32,0.9)"  : "rgba(255,255,255,0.95)";
  const panelBorder  = isDark ? "rgba(20,28,44,0.9)" : "rgba(226,232,240,0.9)";
  const labelMuted   = isDark ? "#627799" : "#64748b";
  const labelVMuted  = isDark ? "#3d4f6e" : "#94a3b8";
  const textPrimary  = isDark ? "#ffffff"  : "#0f172a";
  const textSec      = isDark ? "#93a6c4"  : "#475569";
  const statCardBg   = isDark ? "rgba(14,20,32,0.95)" : "rgba(255,255,255,0.95)";
  const todColor     = isDark ? "rgba(148,163,184,0.07)" : "rgba(100,116,139,0.1)";
  const transTagBg   = isDark ? "rgba(20,28,44,0.6)" : "rgba(248,250,252,0.85)";
  const transTagBord = isDark ? "rgba(27,38,58,0.8)" : "rgba(226,232,240,0.9)";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-fade-in font-body">
      <style>{`
        @keyframes flowDash { from{stroke-dashoffset:0} to{stroke-dashoffset:-28} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes battPulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: "fixed", width: "600px", height: "600px", background: `radial-gradient(circle,${isDark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.07)"} 0%,transparent 70%)`, top: "-200px", left: "-200px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: "500px", height: "500px", background: `radial-gradient(circle,${isDark ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.06)"} 0%,transparent 70%)`, bottom: "-150px", right: "-150px", pointerEvents: "none" }} />

      {/* ── Scenario Selection & Real-Time Simulation Control Bar ──────────── */}
      <div style={{
        background: statCardBg, border: `1px solid ${panelBorder}`,
        borderRadius: "14px", padding: "10px 16px", marginBottom: "16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px", backdropFilter: "blur(12px)",
      }}>
        {/* Scenario Switcher Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", fontFamily: "monospace", color: labelMuted, fontWeight: 700, letterSpacing: "1px" }}>
            TEST CASE SCENARIOS:
          </span>
          {Object.entries(PRESET_SCENARIOS).map(([key, s]) => {
            const active = activeScenario === key;
            const Icon = s.icon;
            return (
              <button
                key={key}
                onClick={() => applyScenario(key)}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 11px", borderRadius: "8px", fontSize: "10.5px", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s",
                  background: active ? "rgba(245,158,11,0.18)" : "transparent",
                  color: active ? "#fbbf24" : textSec,
                  border: active ? "1px solid rgba(245,158,11,0.4)" : `1px solid ${panelBorder}`,
                }}
              >
                <Icon style={{ width: "12px", height: "12px" }} />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Live Simulation Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)", padding: "4px 8px", borderRadius: "8px" }}>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: labelMuted }}>SIM SPEED:</span>
            {[1, 5, 20].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                style={{
                  padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontFamily: "monospace", fontWeight: 700,
                  cursor: "pointer", border: "none",
                  background: simSpeed === spd ? "#fbbf24" : "transparent",
                  color: simSpeed === spd ? "#000" : textSec,
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSimRunning(!isSimRunning)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: isSimRunning ? "rgba(52,211,153,0.15)" : "rgba(251,113,133,0.15)",
              border: isSimRunning ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(251,113,133,0.35)",
              borderRadius: "8px", padding: "5px 10px", fontSize: "10px", fontWeight: 700, fontFamily: "monospace",
              color: isSimRunning ? "#34d399" : "#fb7185", cursor: "pointer",
            }}
          >
            {isSimRunning ? <Pause style={{ width: "10px", height: "10px" }} /> : <Play style={{ width: "10px", height: "10px" }} />}
            {isSimRunning ? "DRAIN ACTIVE" : "PAUSED"}
          </button>
        </div>
      </div>

      {/* ── Active Deficit / Battery Drain Alert Banner ─────────────────────── */}
      {drainingCount > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.35)",
          borderRadius: "11px", padding: "10px 16px", marginBottom: "14px",
          animation: "battPulse 2s ease-in-out infinite",
        }}>
          <Zap style={{ width: "16px", height: "16px", color: "#818cf8", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#818cf8" }}>
              Live Deficit Discharge Active — {drainingCount} house{drainingCount > 1 ? "s" : ""} consuming battery reserves
            </div>
            <div style={{ fontSize: "9.5px", color: labelMuted }}>
              Solar generation and P2P trade suppliers are insufficient to meet total demand. Remaining deficit is actively discharging from onboard lithium battery storage.
            </div>
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(245,158,11,0.13)", border: "1px solid rgba(245,158,11,0.26)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Share2 style={{ width: "16px", height: "16px", color: "#fbbf24" }} />
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: textPrimary, letterSpacing: "-0.5px", margin: 0 }}>Grid Community</h1>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "#fbbf24", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.26)", borderRadius: "6px", padding: "2px 8px", letterSpacing: "1.5px" }}>
              {apiStatus === "online" ? "LIVE IoT" : "SIMULATION"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "9px", fontFamily: "monospace" }}>
              <Wifi style={{ width: "10px", height: "10px", color: "#34d399" }} />
              <span style={{ color: "#34d399" }}>
                Active Scenario: {PRESET_SCENARIOS[activeScenario]?.name}
              </span>
            </div>
          </div>
          <p style={{ fontSize: "11px", color: textSec, margin: 0 }}>
            {PRESET_SCENARIOS[activeScenario]?.description}
          </p>
        </div>

        {/* Summary pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {summaryStats.map(({ label, value, color, Icon }) => (
            <div key={label} style={{ background: statCardBg, border: `1px solid ${panelBorder}`, borderRadius: "11px", padding: "8px 12px", textAlign: "center", backdropFilter: "blur(8px)", minWidth: "80px", transition: "background 0.3s" }}>
              <Icon style={{ width: "11px", height: "11px", color, margin: "0 auto 3px" }} />
              <div style={{ fontSize: "12px", fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
              <div style={{ fontSize: "8.5px", color: labelMuted, marginTop: "1px" }}>{label}</div>
            </div>
          ))}
          {/* Refresh */}
          <button
            onClick={() => fetchHouses()}
            style={{ background: statCardBg, border: `1px solid ${panelBorder}`, borderRadius: "11px", padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "9px", fontFamily: "monospace", fontWeight: 700, color: "#fbbf24", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = statCardBg; }}
          >
            <RefreshCw style={{ width: "10px", height: "10px" }} />REFRESH
          </button>
        </div>
      </div>

      {/* ── Main Layout ───────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 315px", gap: "16px", alignItems: "start" }}>

        {/* LEFT: topology + transfers + case study analysis */}
        <div>
          {/* Topology map */}
          <div style={{ background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: "18px", position: "relative", aspectRatio: "4/3", overflow: "hidden", backdropFilter: "blur(8px)", transition: "background 0.3s" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle,${todColor} 1px,transparent 1px)`, backgroundSize: "28px 28px" }} />
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }} preserveAspectRatio="none">
              {CONNECTIONS.map(([a, b], idx) => {
                const pA = HOUSE_POSITIONS[a], pB = HOUSE_POSITIONS[b];
                const flow = flows.find((f) => (f.from === a && f.to === b) || (f.from === b && f.to === a));
                if (flow) {
                  const fwd = flow.from === a;
                  return <FlowLine key={idx} x1={fwd ? pA.x : pB.x} y1={fwd ? pA.y : pB.y} x2={fwd ? pB.x : pA.x} y2={fwd ? pB.y : pA.y} color={houses[flow.from]?.color || "#fbbf24"} amount={flow.amount} />;
                }
                return <IdleLine key={idx} x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} isDark={isDark} />;
              })}
              <circle cx="50%" cy="50%" r="13" fill={isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.15)"} stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" />
              <circle cx="50%" cy="50%" r="5.5" fill={isDark ? "rgba(245,158,11,0.7)" : "rgba(245,158,11,0.9)"} />
              {HOUSE_POSITIONS.map((pos, i) => (
                <line key={i} x1="50%" y1="50%" x2={`${pos.x}%`} y2={`${pos.y}%`} stroke={isDark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.12)"} strokeWidth="1" strokeDasharray="3 7" />
              ))}
            </svg>
            {houses.map((h, i) => (
              <HouseNode
                key={h.id} house={h} priority={priorities[i] || {}}
                position={HOUSE_POSITIONS[i]} isSelected={selectedHouse === h.id}
                onSelect={handleSelect} isDark={isDark}
              />
            ))}
          </div>

          {/* Active energy transfers */}
          <div style={{ marginTop: "12px", background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: "13px", padding: "13px", backdropFilter: "blur(8px)", transition: "background 0.3s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "9px" }}>
              <div style={{ fontSize: "9px", color: labelMuted, fontFamily: "monospace", letterSpacing: "2px" }}>ACTIVE P2P ENERGY TRANSFERS</div>
              <div style={{ fontSize: "8px", color: labelVMuted, fontFamily: "monospace" }}>
                {flows.length} active trade routes
              </div>
            </div>
            {flows.length === 0 ? (
              <div style={{ textAlign: "center", padding: "8px", color: labelVMuted, fontSize: "10.5px" }}>
                ⚡ No active P2P trade needed or suppliers depleted — homes using self-solar or discharging battery banks
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {flows.map((flow, i) => {
                  const src = houses[flow.from], dst = houses[flow.to];
                  if (!src || !dst) return null;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", background: transTagBg, border: `1px solid ${transTagBord}`, borderRadius: "8px", padding: "6px 10px", fontSize: "11px" }}>
                      <span style={{ color: src.color, fontWeight: 700, fontSize: "10px" }}>{src.name}</span>
                      <ArrowRightLeft style={{ width: "9px", height: "9px", color: labelMuted }} />
                      <span style={{ color: dst.color, fontWeight: 700, fontSize: "10px" }}>{dst.name}</span>
                      <span style={{ fontFamily: "monospace", color: "#22d3ee", fontWeight: 800, background: "rgba(34,211,238,0.1)", borderRadius: "5px", padding: "1px 6px", fontSize: "10px" }}>
                        {flow.amount} kWh
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deep Case Studies & Deficit Analysis Breakdown */}
          <CaseAnalysisPanel activeScenario={activeScenario} isDark={isDark} />
        </div>

        {/* RIGHT: per-house energy status panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <PlugZap style={{ width: "11px", height: "11px", color: labelMuted }} />
            <span style={{ fontSize: "9px", color: labelMuted, fontFamily: "monospace", letterSpacing: "2px" }}>HOUSE ENERGY STATUS</span>
          </div>
          <p style={{ fontSize: "10px", color: labelVMuted, margin: "0" }}>
            Priority: Solar → Trade → Battery. Live drain rate and countdown active during deficit.
          </p>
          {houses.map((h, i) => (
            <HouseEnergyCard key={h.id} house={h} priority={priorities[i] || {}} isDark={isDark} />
          ))}
        </div>

      </div>
    </div>
  );
}
