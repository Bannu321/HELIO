import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dna, Building2, Zap, Users, ThermometerSun, Cpu, TrendingDown, LineChart as ChartIcon, Globe, Map, Activity, Plus } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function EnergyDNA() {
  const [blueprintData, setBlueprintData] = useState([]);
  const [timeSeriesDNA, setTimeSeriesDNA] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDNA = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dna/profiles');
        setBlueprintData(res.data.data.blueprint);
        setTimeSeriesDNA(res.data.data.timeSeries);
        setLoading(false);
      } catch (error) {
        // Fallback default campus load signature
        setBlueprintData([
          { name: 'Hostels', value: 3200, color: '#EF4444' },
          { name: 'Central Block', value: 2400, color: '#06B6D4' },
          { name: 'Academic Block 1', value: 1850, color: '#F59E0B' },
          { name: 'Academic Block 2', value: 1600, color: '#FBBF24' },
          { name: 'Central Library', value: 950, color: '#10B981' },
        ]);
        setTimeSeriesDNA([
          { time: '00:00', Library: 15, AB1: 20, CB: 40, AB2: 15, Hostels: 180 },
          { time: '04:00', Library: 10, AB1: 15, CB: 30, AB2: 10, Hostels: 120 },
          { time: '08:00', Library: 40, AB1: 150, CB: 200, AB2: 140, Hostels: 250 },
          { time: '12:00', Library: 120, AB1: 320, CB: 450, AB2: 300, Hostels: 90 },
          { time: '16:00', Library: 150, AB1: 280, CB: 380, AB2: 250, Hostels: 110 },
          { time: '20:00', Library: 180, AB1: 60, CB: 120, AB2: 50, Hostels: 350 },
          { time: '23:59', Library: 30, AB1: 25, CB: 50, AB2: 20, Hostels: 220 },
        ]);
        setLoading(false);
      }
    };

    fetchDNA();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 dark:border-void-700 border-t-energy-cyan"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="card p-6 md:p-8 bg-gradient-to-br from-white to-slate-50 dark:from-void-800 dark:to-void-850">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-energy-cyan flex items-center justify-center">
            <Dna className="w-4 h-4" />
          </div>
          <span className="stat-label">Campus Microgrid Profile</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Energy DNA & Building Load Signatures
        </h1>
        <p className="text-sm font-mono text-slate-600 dark:text-void-200 max-w-2xl">
          Granular 24-hour load decomposition across facilities, identifying peak thermal demand, baseload waste, and scheduled flexibility.
        </p>
      </div>

      {/* Campus Blueprint Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-void-700/60 pb-3">
          <Map className="w-4 h-4 text-slate-500 dark:text-void-300" />
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Facility Baseload Distribution (Daily Average)
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blueprintData} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(150,150,150,0.1)" />
                <XAxis type="number" unit=" kWh" stroke="#64748B" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(150,150,150,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(14, 20, 32, 0.95)', borderColor: '#1E293B', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {blueprintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div>
              <span className="stat-label">Microgrid Analytical Insights</span>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mt-1 mb-2">
                Facility Load Profile Analysis
              </h3>
              <p className="text-xs text-slate-600 dark:text-void-200 leading-relaxed font-mono">
                Hostels represent 34% of baseline energy draw due to continuous 24/7 HVAC and residential appliances. Academic Blocks (AB1/CB) peak synchronously with maximum solar daylight generation.
              </p>
            </div>
            <div className="p-3 bg-solar-50 dark:bg-solar-500/10 border border-solar-200 dark:border-solar-500/20 rounded-lg text-xs font-mono text-solar-700 dark:text-solar-400 mt-4">
              AI Recommendation: Dispatch surplus midday solar to pre-cool Central Block labs, shaving 180kW peak evening draw.
            </div>
          </div>
        </div>
      </div>

      {/* Building 24h Signatures */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-void-700/60 pb-3">
          <Activity className="w-4 h-4 text-slate-500 dark:text-void-300" />
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Individual Building Load Curves (24h Timeline)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Hostels & Living Quarters" dataKey="Hostels" color="#EF4444" desc="Bimodal peak (07:00 morning rush & 20:00 evening return)." />
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Central Research Block (CB)" dataKey="CB" color="#06B6D4" desc="Sharp midday bell curve. Heavy HVAC & supercomputing loads." />
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Academic Block 01 (AB1)" dataKey="AB1" color="#F59E0B" desc="Standard daylight academic profile. Strongly matches PV generation." />
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Academic Block 02 (AB2)" dataKey="AB2" color="#FBBF24" desc="Secondary afternoon lecture curve with evening lab sessions." />
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Central University Library" dataKey="Library" color="#10B981" desc="Gradual ramp up with extended late-night study periods." />

          <div className="card p-6 flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent hover:bg-slate-50 dark:hover:bg-void-800/50 cursor-pointer transition-colors group">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-void-700 flex items-center justify-center mb-2 group-hover:bg-solar-500 group-hover:text-void-950 transition-colors">
              <Plus className="w-4 h-4 text-slate-500 dark:text-void-300 group-hover:text-void-950" />
            </div>
            <span className="font-semibold text-xs text-slate-900 dark:text-white">Connect IoT Substation</span>
            <p className="text-[11px] font-mono text-slate-400 dark:text-void-400 mt-0.5">Map telemetry to new building</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DNAChartCard({ title, dataKey, color, desc, timeSeriesDNA }) {
  return (
    <div className="card p-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{title}</h4>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
        </div>
        <p className="text-[11px] font-mono text-slate-500 dark:text-void-300 mb-3">{desc}</p>
      </div>

      <div className="h-28 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeSeriesDNA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#64748B" fontSize={9} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} minTickGap={15} />
            <YAxis stroke="#64748B" fontSize={9} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(14, 20, 32, 0.95)', borderColor: '#1E293B', borderRadius: '6px', fontSize: '11px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}