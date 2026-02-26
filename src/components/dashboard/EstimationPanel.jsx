import React, { useState, useEffect } from "react";
import { fetchEstimation } from "../../services/api";

export default function EstimationPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const d = await fetchEstimation();
        setData(d);
      } catch (err) {
        setError("Failed to load estimation data");
        console.error("Estimation error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (error) {
    return (
      <div className="card p-5">
        <div className="text-energy-rose text-sm flex items-center gap-2">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-bold text-white">
            Power Estimation
          </div>
          <div className="text-xs text-void-200 mt-0.5">
            AI forecast — remaining daylight hours
          </div>
        </div>
        <span className="text-[10px] font-mono text-energy-green bg-energy-green/10 border border-energy-green/20 px-2 py-1 rounded">
          {data?.summary.modelConfidence ?? "—"} CONFIDENCE
        </span>
      </div>

      {/* Summary cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-void-600/60 rounded-xl p-3 border border-solar-500/10">
            <div className="text-[9px] font-mono text-void-200 tracking-widest mb-1">
              DAY TOTAL EST.
            </div>
            <div className="font-display text-lg font-bold text-solar-400">
              {data.summary.dayTotalEstimate}
            </div>
          </div>
          <div className="bg-void-600/60 rounded-xl p-3 border border-energy-green/10">
            <div className="text-[9px] font-mono text-void-200 tracking-widest mb-1">
              REVENUE EST.
            </div>
            <div className="font-display text-lg font-bold text-energy-green">
              {data.summary.dayRevenueEstimate}
            </div>
          </div>
          <div className="bg-void-600/60 rounded-xl p-3">
            <div className="text-[9px] font-mono text-void-200 tracking-widest mb-1">
              PEAK WINDOW
            </div>
            <div className="text-sm font-mono text-white">
              {data.summary.peakWindow}
            </div>
          </div>
          <div className="bg-void-600/60 rounded-xl p-3">
            <div className="text-[9px] font-mono text-void-200 tracking-widest mb-1">
              SOILING LOSS
            </div>
            <div className="text-sm font-mono text-energy-rose">
              {data.summary.soilingLoss}
            </div>
          </div>
        </div>
      )}

      {/* Hourly slots */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono text-void-200 tracking-widest">
          HOURLY FORECAST
        </div>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-void-600 rounded animate-pulse" />
            ))
          : data?.slots.map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-void-600/40 hover:bg-void-600/70 rounded-lg px-3 py-2.5 transition-colors group"
              >
                <div className="font-mono text-[10px] text-void-200 w-28 flex-shrink-0">
                  {slot.slot}
                </div>
                <div className="flex-1">
                  <div className="progress-track h-1.5">
                    <div
                      className="progress-solar"
                      style={{
                        width: `${(parseFloat(slot.energy) / 60) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="font-mono text-xs text-solar-400 w-16 text-right">
                  {slot.energy}
                </div>
                <div className="font-mono text-xs text-energy-green w-16 text-right">
                  {slot.revenue}
                </div>
                <div className="text-[9px] font-mono text-void-300 w-12 text-right">
                  {slot.confidence}%
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
