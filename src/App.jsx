import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SolarProvider } from "./context/SolarContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
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
import EnergyDNA from "./pages/EnergyDNA";
import EnergyFlow from "./pages/EnergyFlow";
import BatteryManagementModule from "./pages/BatteryManagementModule";

// Page 404 fallback
const NotFound = () => (
  <div className="p-8 text-center mt-20">
    <div className="font-display text-2xl font-bold text-energy-rose mb-2">
      404 — Page Not Found
    </div>
    <div className="text-slate-600 dark:text-void-200 text-sm font-mono">
      The page you're looking for doesn't exist.
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-void-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-300 dark:border-void-700 border-t-solar-500 animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 dark:text-void-300 font-mono text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Dashboard Layout Component
const DashboardLayout = ({ children }) => (
  <div className="ambient-top min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-void-900 dark:text-void-100 transition-colors duration-300">
    <Topbar />
    <div className="flex flex-1 relative z-10">
      <Sidebar className="overflow-y-auto" />
      <main className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-void-800">
        <div className="absolute inset-0 bg-solar-glow pointer-events-none opacity-30 z-0" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  </div>
);

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-void-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-300 dark:border-void-700 border-t-solar-500 animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 dark:text-void-300 font-mono text-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/landing" element={<LandingPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Root Route - Redirect based on auth status */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/landing" replace />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/grid"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <GridMonitor />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/panels"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PanelHealth />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/energy-dna"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EnergyDNA />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/revenue"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RevenueReports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/energy"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EnergyLog />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/weather"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WeatherAI />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimation"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Estimation />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/flow"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EnergyFlow />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/battery"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BatteryManagementModule />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Alerts />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all for undefined routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <SolarProvider>
              <AppContent />
            </SolarProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
