import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSolar } from '../../context/SolarContext';
import { Bell, RefreshCw } from 'lucide-react';

export default function Topbar() {
  const { refresh, lastRefresh } = useSolar();
  const [time, setTime] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const navigator = useNavigate();

  // Dynamic breadcrumb generation based on current route
  const path = location.pathname.split('/')[1];
  const pageName = path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Home';

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (refresh) await refresh(); // Safety check
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <header className="h-[68px] flex items-center justify-between px-6 lg:px-8 border-b border-void-800 bg-void-900/80 backdrop-blur-md sticky top-0 z-50">
      
      {/* Left: Dynamic Breadcrumb */}
      <div className="flex items-center gap-3 text-sm font-mono tracking-wide">
        <span className="text-solar-400 font-bold">HELIO</span>
        <span className="text-void-600">/</span>
        <span className="text-white">{pageName}</span>
      </div>

      {/* Center: Live status bar */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 bg-energy-green/10 border border-energy-green/20 px-3 py-1.5 rounded-full text-energy-green text-xs font-mono font-bold tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energy-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-energy-green"></span>
          </span>
          GRID LIVE
        </div>
        <div className="text-xs font-mono text-void-300">
          Last sync:{' '}
          <span className="text-void-100">
            {lastRefresh ? lastRefresh.toLocaleTimeString('en-IN', { hour12: false }) : 'Just now'}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Digital Clock */}
        <span className="hidden sm:block font-mono text-sm text-void-300 bg-void-800/50 px-3 py-1.5 rounded-lg border border-void-700">
          {time}
        </span>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center gap-2 text-void-300 hover:text-white transition-colors px-2 py-1.5 ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-solar-400' : ''}`} />
          <span className="hidden sm:inline text-sm font-medium">Refresh</span>
        </button>

        {/* Notification dot */}
        <button className="relative p-2 text-void-300 hover:text-white transition-colors" onClick={() =>{navigator('/alerts')}}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-energy-rose border border-void-900" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center text-xs font-bold text-void-900 shadow-lg cursor-pointer hover:shadow-solar-500/20 transition-all">
          A
        </div>
      </div>

    </header>
  );
}