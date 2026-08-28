import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSolar } from "../../context/SolarContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon, Bell, RefreshCw, LogOut, Settings, ChevronRight, User } from "lucide-react";

export default function Topbar() {
  const { refresh, lastRefresh } = useSolar();
  const { user, logout } = useAuth();
  const [time, setTime] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  // Dynamic breadcrumb label mapping
  const path = location.pathname.split("/")[1];
  const routeNames = {
    "": "Overview",
    dashboard: "System Overview",
    grid: "Grid Monitor",
    panels: "Panel Health",
    "grid-community": "Grid Community P2P",
    "energy-dna": "Energy DNA Profile",
    revenue: "Revenue & ROI Reports",
    energy: "Energy Log & Telemetry",
    weather: "Weather AI Intelligence",
    estimation: "Generation AI Forecast",
    flow: "Power Flow Mapping",
    battery: "BESS Management",
    alerts: "Alerts & Fault Log",
    settings: "System Configuration",
  };
  const pageName = routeNames[path] || (path ? path.charAt(0).toUpperCase() + path.slice(1) : "Overview");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (refresh) await refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-void-700/80 bg-white/95 dark:bg-void-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      {/* Left: Dynamic Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="font-bold text-slate-800 dark:text-white tracking-wider">
          HELIO
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-void-400" />
        <span className="font-medium text-slate-600 dark:text-void-200">
          {pageName}
        </span>
      </div>

      {/* Center: Real-time Telemetry Status Indicator */}
      <div className="hidden md:flex items-center gap-5">
        <div className="live-badge">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-grid-500 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-grid-500"></span>
          </span>
          LIVE TELEMETRY
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-void-300">
          Last Synced:{" "}
          <span className="text-slate-800 dark:text-void-100 font-semibold">
            {lastRefresh
              ? lastRefresh.toLocaleTimeString("en-IN", { hour12: false })
              : "Active"}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Digital Clock */}
        <span className="hidden sm:block font-mono text-xs text-slate-600 dark:text-void-200 bg-slate-100 dark:bg-void-800 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-void-700 font-medium min-w-[70px] text-center">
          {time}
        </span>

        {/* Manual Telemetry Sync */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Sync Telemetry"
          className={`p-2 rounded-lg text-slate-500 dark:text-void-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-void-800 transition-colors ${
            refreshing ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin text-solar-500" : ""}`}
          />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-void-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-void-800 transition-colors rounded-lg"
          aria-label="Toggle Theme"
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? <Sun className="w-4 h-4 text-solar-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Alerts Bell Button */}
        <button
          className="relative p-2 text-slate-500 dark:text-void-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-void-800 transition-colors rounded-lg"
          onClick={() => navigate("/alerts")}
          title="System Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-energy-rose" />
        </button>

        {/* User Profile Menu */}
        <div className="relative ml-1">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-void-700 hover:bg-solar-500/20 text-slate-700 dark:text-void-100 border border-slate-300 dark:border-void-600 flex items-center justify-center text-xs font-mono font-bold transition-all cursor-pointer"
            title={user?.email || "Account"}
          >
            {userInitials}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-11 w-56 bg-white dark:bg-void-800 border border-slate-200 dark:border-void-700 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-void-700/80 bg-slate-50/50 dark:bg-void-850/50">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || "Operator"}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-void-300 font-mono truncate mt-0.5">
                  {user?.email || "operator@helio.grid"}
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setUserMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-void-200 hover:bg-slate-100 dark:hover:bg-void-700 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-void-300" />
                  Settings & APIs
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-xs text-energy-rose hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg flex items-center gap-2.5 transition-colors font-medium border-t border-slate-100 dark:border-void-700/50"
                >
                  <LogOut className="w-3.5 h-3.5 opacity-80" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
