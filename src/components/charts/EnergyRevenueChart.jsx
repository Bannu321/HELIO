import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { fetchEnergySeries } from '../../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-void-700 border border-void-400 rounded-xl p-3 shadow-xl text-xs font-mono">
      <div className="text-void-200 mb-2 font-bold">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-void-100">{p.name}:</span>
          <span className="text-white font-bold">
            {p.name === 'revenue' ? `₹${p.value?.toLocaleString('en-IN')}` : `${p.value} kWh`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function EnergyRevenueChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnergySeries().then(d => { setData(d); setLoading(false); });
  }, []);

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div>
        <div className="font-display text-sm font-bold text-white tracking-wide">Energy & Revenue</div>
        <div className="text-xs text-void-200 mt-0.5">Monthly overview · kWh sold vs ₹ earned</div>
      </div>

      {loading ? (
        <div className="h-52 bg-void-600/50 rounded-lg animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left"  unit=" kWh" tick={{ fontSize: 10, fontFamily: 'Space Mono' }} tickLine={false} axisLine={false} width={58} />
            <YAxis yAxisId="right" orientation="right" unit="k₹" tickFormatter={v => `${(v/1000).toFixed(0)}`} tick={{ fontSize: 10, fontFamily: 'Space Mono' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Space Mono', paddingTop: 8 }} iconType="circle" iconSize={6} />
            <Bar yAxisId="left" dataKey="energy" fill="#F59E0B" fillOpacity={0.8} radius={[4,4,0,0]} barSize={18} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#00E5A0" strokeWidth={2} dot={{ r:3, fill:'#00E5A0', stroke:'#0F1520', strokeWidth:2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
