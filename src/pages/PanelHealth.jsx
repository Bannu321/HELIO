import React from 'react';
import PanelGrid from '../components/dashboard/PanelGrid';
import { useSolar } from '../context/SolarContext';
import { Wrench, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PanelHealth() {
  const { panels, loading } = useSolar();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white tracking-wide">Hardware & Panel Health</h1>
          <p className="text-sm text-void-300 mt-1 font-mono">Individual module diagnostics and soiling alerts</p>
        </div>
        <button className="bg-void-800 hover:bg-void-700 border border-void-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Wrench className="w-4 h-4" /> Schedule Maintenance
        </button>
      </header>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-void-800 border border-void-700 rounded-2xl p-6 shadow-card flex items-start gap-4">
          <div className="p-3 bg-energy-green/10 text-energy-green rounded-xl border border-energy-green/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-void-300 text-sm font-medium">System Status</h3>
            <p className="text-xl font-display font-bold text-white mt-1">Optimal</p>
            <p className="text-xs text-void-400 mt-1">23/24 Panels Online</p>
          </div>
        </div>

        <div className="bg-void-800 border border-void-700 rounded-2xl p-6 shadow-card flex items-start gap-4">
          <div className="p-3 bg-energy-amber/10 text-energy-amber rounded-xl border border-energy-amber/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-void-300 text-sm font-medium">Action Required</h3>
            <p className="text-xl font-display font-bold text-white mt-1">Soiling Loss</p>
            <p className="text-xs text-void-400 mt-1">Array B showing 2.1% dust drop</p>
          </div>
        </div>

        <div className="bg-void-800 border border-void-700 rounded-2xl p-6 shadow-card flex flex-col justify-center">
          <h3 className="text-void-300 text-sm font-medium mb-2">Average Efficiency</h3>
          <div className="w-full bg-void-900 rounded-full h-2 mb-1">
            <div className="bg-energy-cyan h-2 rounded-full" style={{ width: '92%' }}></div>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-white font-bold">92.4%</span>
            <span className="text-void-400">Target: 95%</span>
          </div>
        </div>
      </div>

      {/* Your Existing Panel Grid Component */}
      <div className="bg-void-800 border border-void-700 rounded-2xl p-6 shadow-card">
        <h2 className="font-display font-bold text-white mb-6">Live Array Map</h2>
        {/* Render the PanelGrid you already have in your components folder */}
        <PanelGrid />
      </div>

    </div>
  );
}