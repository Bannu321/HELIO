// import React from 'react';
// import { Dna, Building2, Zap, Users, ThermometerSun, Cpu, TrendingDown, LineChart as ChartIcon, Globe, Map } from 'lucide-react';
// import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// // Mock Data: Building daily averages (Blueprint Data)
// const blueprintData = [
//   { name: 'Hostels', value: 3200, color: '#FF4C6A' }, // energy-rose
//   { name: 'Central Block', value: 2400, color: '#00E5FF' }, // energy-cyan
//   { name: 'AB1', value: 1850, color: '#f59e0b' },     // solar-500
//   { name: 'AB2', value: 1600, color: '#fcd34d' },     // solar-300
//   { name: 'Library', value: 950, color: '#00E5A0' },  // energy-green
// ];

// // Mock Data: 24h Time vs Load (kW) for each building
// const timeSeriesDNA = [
//   { time: '00:00', Library: 15, AB1: 20, CB: 40, AB2: 15, Hostels: 180 },
//   { time: '04:00', Library: 10, AB1: 15, CB: 30, AB2: 10, Hostels: 120 },
//   { time: '08:00', Library: 40, AB1: 150, CB: 200, AB2: 140, Hostels: 250 }, // Morning rush
//   { time: '12:00', Library: 120, AB1: 320, CB: 450, AB2: 300, Hostels: 90 },  // Classes active
//   { time: '16:00', Library: 150, AB1: 280, CB: 380, AB2: 250, Hostels: 110 },
//   { time: '20:00', Library: 180, AB1: 60, CB: 120, AB2: 50, Hostels: 350 },  // Evening return
//   { time: '23:59', Library: 30, AB1: 25, CB: 50, AB2: 20, Hostels: 220 },
// ];

// export default function EnergyDNA() {
//   return (
//     <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-12">
      
//       {/* Hero / Pitch Section */}
//       <div className="relative bg-white dark:bg-void-800 border border-slate-200 dark:border-void-700 rounded-3xl p-8 md:p-12 overflow-hidden shadow-lg transition-colors duration-300">
//         <div className="absolute top-0 right-0 w-96 h-96 bg-energy-cyan rounded-full blur-[120px] opacity-10 dark:opacity-20 pointer-events-none" />
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-solar-500 rounded-full blur-[100px] opacity-10 dark:opacity-20 pointer-events-none" />
        
//         <div className="relative z-10 max-w-3xl">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2.5 bg-energy-cyan/10 border border-energy-cyan/20 rounded-xl text-energy-cyan animate-pulse-slow">
//               <Dna className="w-8 h-8" />
//             </div>
//             <h1 className="font-display text-sm font-bold tracking-widest text-slate-500 dark:text-void-300 uppercase">
//               Core Innovation
//             </h1>
//           </div>
//           <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
//             Energy DNA Campus
//           </h2>
//           <p className="text-xl md:text-2xl font-body text-slate-600 dark:text-void-200 italic border-l-4 border-solar-500 pl-6">
//              “We decode the Energy DNA of every building to make campuses truly alive with sustainable intelligence.”
//           </p>
//         </div>
//       </div>

//       {/* 📊 NEW: Campus Blueprint (Average Daily Load) */}
//       <div className="space-y-6">
//         <div className="flex items-center gap-3 border-b border-slate-200 dark:border-void-700 pb-4">
//           <Map className="w-6 h-6 text-slate-400 dark:text-void-300" />
//           <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Campus Blueprint: Average Daily Load</h3>
//         </div>
        
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 card p-6 h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={blueprintData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(150,150,150,0.1)" />
//                 <XAxis type="number" unit=" kWh" stroke="#8892b0" fontSize={12} fontFamily="Space Mono" tickLine={false} axisLine={false} />
//                 <YAxis dataKey="name" type="category" stroke="#8892b0" fontSize={12} fontFamily="Space Mono" tickLine={false} axisLine={false} />
//                 <Tooltip 
//                   cursor={{fill: 'rgba(150,150,150,0.05)'}}
//                   contentStyle={{ backgroundColor: 'rgba(10, 13, 20, 0.9)', borderColor: '#222D42', borderRadius: '8px', color: '#fff' }}
//                 />
//                 <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
//                   {blueprintData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="card-glow p-6 flex flex-col justify-center">
//             <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Macro Analysis</h4>
//             <p className="text-sm text-slate-600 dark:text-void-200 mb-4">
//               Hostels consistently draw the highest base load due to 24/7 occupancy and dense appliance usage. Academic blocks (AB1, CB) show massive volatility based on class schedules.
//             </p>
//             <div className="p-3 bg-solar-50 dark:bg-solar-500/10 border border-solar-200 dark:border-solar-500/20 rounded-lg text-sm text-solar-600 dark:text-solar-400 font-medium">
//               Target Optimization: Shift heavy CB server backups to Hostel low-draw periods (02:00 - 05:00).
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 🧬 NEW: Load Signatures (Time vs Load) */}
//       <div className="space-y-6 pt-6">
//         <div className="flex items-center gap-3 border-b border-slate-200 dark:border-void-700 pb-4">
//           <Activity className="w-6 h-6 text-slate-400 dark:text-void-300" />
//           <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Building DNA Profiles (24h Load vs kW)</h3>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <DNAChartCard title="Hostels" dataKey="Hostels" color="#FF4C6A" desc="Bimodal peak (Morning prep & Evening return). High baseload." />
//           <DNAChartCard title="Central Block (CB)" dataKey="CB" color="#00E5FF" desc="Massive midday peak. Heavy HVAC & lab equipment draw." />
//           <DNAChartCard title="Academic Block 1" dataKey="AB1" color="#f59e0b" desc="Standard academic bell curve. Correlates with sunlight." />
//           <DNAChartCard title="Academic Block 2" dataKey="AB2" color="#fcd34d" desc="Similar to AB1, secondary peak for evening labs." />
//           <DNAChartCard title="Library" dataKey="Library" color="#00E5A0" desc="Steady, progressive climb. Peaks during late evening study hours." />
          
//           <div className="card p-6 flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent hover:bg-slate-50 dark:hover:bg-void-800 cursor-pointer">
//             <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-void-700 flex items-center justify-center mb-3">
//               <span className="text-2xl text-slate-400 dark:text-void-400">+</span>
//             </div>
//             <h4 className="font-display font-bold text-slate-900 dark:text-white">Map New Building</h4>
//             <p className="text-xs text-slate-500 dark:text-void-300 mt-1">Connect IoT Gateway to track</p>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// }

// // Custom Reusable Chart Component for the DNA grids
// function DNAChartCard({ title, dataKey, color, desc }) {
//   return (
//     <div className="card p-5 group hover:border-slate-300 dark:hover:border-void-400 transition-colors">
//       <div className="flex justify-between items-start mb-2">
//         <h4 className="font-display font-bold text-slate-900 dark:text-white">{title}</h4>
//         <span className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: color }}></span>
//       </div>
//       <p className="text-xs text-slate-500 dark:text-void-300 h-8 mb-4">{desc}</p>
      
//       <div className="h-32 w-full">
//         <ResponsiveContainer>
//           <AreaChart data={timeSeriesDNA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
//             <defs>
//               <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
//                 <stop offset="95%" stopColor={color} stopOpacity={0}/>
//               </linearGradient>
//             </defs>
//             <XAxis dataKey="time" stroke="#8892b0" fontSize={10} fontFamily="Space Mono" tickLine={false} axisLine={false} minTickGap={20} />
//             <YAxis stroke="#8892b0" fontSize={10} fontFamily="Space Mono" tickLine={false} axisLine={false} />
//             <Tooltip 
//               contentStyle={{ backgroundColor: 'rgba(10, 13, 20, 0.9)', borderColor: '#222D42', borderRadius: '8px', fontSize: '12px' }}
//               itemStyle={{ color: '#fff' }}
//             />
//             <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${dataKey})`} />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// // Temporary fallback if lucide-react doesn't export 'Activity' in your specific version setup
// function Activity(props) {
//   return (
//     <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//       <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
//     </svg>
//   );
// }


// Real data using 


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dna, Building2, Zap, Users, ThermometerSun, Cpu, TrendingDown, LineChart as ChartIcon, Globe, Map } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function EnergyDNA() {
  const [blueprintData, setBlueprintData] = useState([]);
  const [timeSeriesDNA, setTimeSeriesDNA] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDNA = async () => {
      try {
        // Fetch data from your new Node.js backend
        const res = await axios.get('http://localhost:5000/api/dna/profiles');
        setBlueprintData(res.data.data.blueprint);
        setTimeSeriesDNA(res.data.data.timeSeries);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Energy DNA:', error);
        setLoading(false);
      }
    };

    fetchDNA();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-energy-cyan"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-12">
      
      {/* Hero / Pitch Section */}
      <div className="relative bg-white dark:bg-void-800 border border-slate-200 dark:border-void-700 rounded-3xl p-8 md:p-12 overflow-hidden shadow-lg transition-colors duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-energy-cyan rounded-full blur-[120px] opacity-10 dark:opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-solar-500 rounded-full blur-[100px] opacity-10 dark:opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-energy-cyan/10 border border-energy-cyan/20 rounded-xl text-energy-cyan animate-pulse-slow">
              <Dna className="w-8 h-8" />
            </div>
            <h1 className="font-display text-sm font-bold tracking-widest text-slate-500 dark:text-void-300 uppercase">
              Core Innovation
            </h1>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
            Energy DNA Campus
          </h2>
          <p className="text-xl md:text-2xl font-body text-slate-600 dark:text-void-200 italic border-l-4 border-solar-500 pl-6">
             “We decode the Energy DNA of every building to make campuses truly alive with sustainable intelligence.”
          </p>
        </div>
      </div>

      {/* 📊 Campus Blueprint (Average Daily Load) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-void-700 pb-4">
          <Map className="w-6 h-6 text-slate-400 dark:text-void-300" />
          <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Campus Blueprint: Average Daily Load</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blueprintData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(150,150,150,0.1)" />
                <XAxis type="number" unit=" kWh" stroke="#8892b0" fontSize={12} fontFamily="Space Mono" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#8892b0" fontSize={12} fontFamily="Space Mono" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(150,150,150,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(10, 13, 20, 0.9)', borderColor: '#222D42', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {blueprintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card-glow p-6 flex flex-col justify-center">
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Macro Analysis</h4>
            <p className="text-sm text-slate-600 dark:text-void-200 mb-4">
              Hostels consistently draw the highest base load due to 24/7 occupancy and dense appliance usage. Academic blocks (AB1, CB) show massive volatility based on class schedules.
            </p>
            <div className="p-3 bg-solar-50 dark:bg-solar-500/10 border border-solar-200 dark:border-solar-500/20 rounded-lg text-sm text-solar-600 dark:text-solar-400 font-medium">
              Target Optimization: Shift heavy CB server backups to Hostel low-draw periods (02:00 - 05:00).
            </div>
          </div>
        </div>
      </div>

      {/* 🧬 Load Signatures (Time vs Load) */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-void-700 pb-4">
          <Activity className="w-6 h-6 text-slate-400 dark:text-void-300" />
          <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Building DNA Profiles (24h Load vs kW)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Hostels" dataKey="Hostels" color="#FF4C6A" desc="Bimodal peak (Morning prep & Evening return). High baseload." />
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Central Block (CB)" dataKey="CB" color="#00E5FF" desc="Massive midday peak. Heavy HVAC & lab equipment draw." />
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Academic Block 1" dataKey="AB1" color="#f59e0b" desc="Standard academic bell curve. Correlates with sunlight." />
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Academic Block 2" dataKey="AB2" color="#fcd34d" desc="Similar to AB1, secondary peak for evening labs." />
          <DNAChartCard timeSeriesDNA={timeSeriesDNA} title="Library" dataKey="Library" color="#00E5A0" desc="Steady, progressive climb. Peaks during late evening study hours." />
          
          <div className="card p-6 flex flex-col items-center justify-center text-center border-dashed border-2 bg-transparent hover:bg-slate-50 dark:hover:bg-void-800 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-void-700 flex items-center justify-center mb-3">
              <span className="text-2xl text-slate-400 dark:text-void-400">+</span>
            </div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white">Map New Building</h4>
            <p className="text-xs text-slate-500 dark:text-void-300 mt-1">Connect IoT Gateway to track</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated Chart Component to accept the dynamic timeSeriesDNA prop
function DNAChartCard({ title, dataKey, color, desc, timeSeriesDNA }) {
  return (
    <div className="card p-5 group hover:border-slate-300 dark:hover:border-void-400 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-display font-bold text-slate-900 dark:text-white">{title}</h4>
        <span className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: color }}></span>
      </div>
      <p className="text-xs text-slate-500 dark:text-void-300 h-8 mb-4">{desc}</p>
      
      <div className="h-32 w-full">
        <ResponsiveContainer>
          <AreaChart data={timeSeriesDNA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#8892b0" fontSize={10} fontFamily="Space Mono" tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis stroke="#8892b0" fontSize={10} fontFamily="Space Mono" tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(10, 13, 20, 0.9)', borderColor: '#222D42', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Activity(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}