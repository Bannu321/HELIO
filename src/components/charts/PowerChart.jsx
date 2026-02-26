import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { fetchPowerSeries } from "../../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-void-700 border border-solar-500/20 rounded-xl p-3 shadow-xl text-xs font-mono">
      <div className="text-void-200 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-void-100 capitalize">{p.name}:</span>
          <span className="text-white font-bold">
            {p.value != null ? `${p.value} kW` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

const tabs = ["24H", "7D", "30D"];

export default function PowerChart() {
  const [data, setData] = useState([]);
  const [tab, setTab] = useState("24H");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const d = await fetchPowerSeries(tab);
        setData(d);
      } catch (err) {
        setError("Failed to load power data");
        console.error("Power series error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tab]);

  const now = new Date().getHours();

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-bold text-white tracking-wide">
            Power Generation
          </div>
          <div className="text-xs text-void-200 mt-0.5">
            Real-time output ·{" "}
            {tab === "24H"
              ? "1-hour intervals"
              : tab === "7D"
                ? "daily"
                : "weekly"}{" "}
            intervals
          </div>
        </div>
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                tab === t
                  ? "bg-solar-500/15 text-solar-400 border border-solar-500/30"
                  : "text-void-200 hover:text-white hover:bg-void-600"
              }`}
              aria-pressed={tab === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-energy-rose/10 border border-energy-rose/20 rounded-lg p-3 text-sm text-energy-rose">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-52 bg-void-600/50 rounded-lg animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-void-300 text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3FA9F5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3FA9F5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fontFamily: "Space Mono" }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              unit=" kW"
              tick={{ fontSize: 10, fontFamily: "Space Mono" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontSize: 10,
                fontFamily: "Space Mono",
                paddingTop: 8,
              }}
              iconType="circle"
              iconSize={6}
            />
            <ReferenceLine
              x={`${String(now).padStart(2, "0")}:00`}
              stroke="rgba(255,184,0,0.3)"
              strokeDasharray="4 4"
              label={{
                value: "NOW",
                position: "top",
                fill: "#F59E0B",
                fontSize: 9,
              }}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#3FA9F5"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fill="url(#gradPred)"
              dot={false}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#gradActual)"
              dot={false}
              connectNulls
              activeDot={{
                r: 5,
                fill: "#F59E0B",
                stroke: "#0F1520",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
