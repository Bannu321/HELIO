import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SolarProvider } from "./context/SolarContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import { ThemeProvider } from './context/ThemeContext';
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PanelHealth from "./pages/PanelHealth";
import GridMonitor from "./pages/GridMonitor";
import RevenueReports from "./pages/RevenueReports";
import EnergyLog from "./pages/EnergyLog";
import WeatherAI from "./pages/WeatherAI";
import Estimation from "./pages/Estimation";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

// Page 404 fallback
const NotFound = () => (
  <div className="p-8 text-center mt-20">
    <div className="font-display text-2xl font-bold text-energy-rose mb-2">
      404 — Page Not Found
    </div>
    <div className="text-void-200 text-sm font-mono">
      The page you're looking for doesn't exist.
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SolarProvider>
          <div className="ambient-top min-h-screen flex flex-col bg-void-900 text-void-100">
            <Topbar />
            <div className="flex flex-1 relative z-10">
              <Sidebar />
              <main className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-68px)] relative">
                <div className="absolute inset-0 bg-solar-glow pointer-events-none opacity-30 z-0" />
                <div className="relative z-10">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/grid" element={<GridMonitor />} />
                    <Route path="/panels" element={<PanelHealth />} />
                    <Route path="/revenue" element={<RevenueReports />} />
                    <Route path="/energy" element={<EnergyLog />} />
                    <Route path="/weather" element={<WeatherAI />} />
                    <Route path="/estimation" element={<Estimation />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </SolarProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
