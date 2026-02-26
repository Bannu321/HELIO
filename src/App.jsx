import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SolarProvider } from './context/SolarContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Dashboard from './pages/Dashboard';

// Placeholder pages for routes
const PlaceholderPage = ({ title }) => (
  <div className="p-8 text-center">
    <div className="font-display text-xl font-bold text-solar-400 mb-2">{title}</div>
    <div className="text-void-200 text-sm font-mono">Page under construction · connect your Express API</div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <SolarProvider>
        <div className="ambient-top min-h-screen flex flex-col">
          <Topbar />
          <div className="flex flex-1 relative z-10">
            <Sidebar />
            <main className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-68px)]">
              <Routes>
                <Route path="/"           element={<Dashboard />} />
                <Route path="/grid"       element={<PlaceholderPage title="Grid Monitor" />} />
                <Route path="/panels"     element={<PlaceholderPage title="Panel Health" />} />
                <Route path="/revenue"    element={<PlaceholderPage title="Revenue Reports" />} />
                <Route path="/energy"     element={<PlaceholderPage title="Energy Log" />} />
                <Route path="/weather"    element={<PlaceholderPage title="Weather AI" />} />
                <Route path="/estimation" element={<PlaceholderPage title="Power Estimation" />} />
                <Route path="/alerts"     element={<PlaceholderPage title="Alerts" />} />
                <Route path="/settings"   element={<PlaceholderPage title="Settings" />} />
              </Routes>
            </main>
          </div>
        </div>
      </SolarProvider>
    </BrowserRouter>
  );
}
