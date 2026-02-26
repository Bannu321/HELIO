import React from "react";
import RevenueTable from "../components/reports/RevenueTable";
import { useSolar } from "../context/SolarContext";
import { IndianRupee, TrendingUp, Download, Zap } from "lucide-react";

export default function RevenueReports() {
  const { overview } = useSolar();

  const fmtINR = (v) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-10 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
            Revenue & Settlements
          </h1>
          <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
            Energy export logs and net metering financials
          </p>
        </div>
        <button className="bg-slate-300 dark:bg-void-800 hover:bg-slate-400 dark:hover:bg-void-700 border border-slate-400 dark:border-void-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </header>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard
          title="Today's Earnings"
          value={fmtINR(overview?.todayRevenue)}
          icon={IndianRupee}
          color="text-energy-green"
          trend="+12.5% vs yesterday"
        />
        <FinancialCard
          title="Monthly Projection"
          value={fmtINR(overview?.monthlyRevenue || 45200)}
          icon={TrendingUp}
          color="text-solar-400"
          trend="On track based on irradiance"
        />
        <FinancialCard
          title="Total Exported"
          value="845.2 kWh"
          icon={Zap}
          color="text-energy-cyan"
          trend="This month (Net positive)"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-6 shadow-card">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-6">
          Settlement Ledger
        </h2>
        <RevenueTable />
      </div>
    </div>
  );
}

// Minimal card for the top of the revenue page
function FinancialCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="bg-slate-100 dark:bg-void-800/50 border border-slate-300 dark:border-void-700 rounded-2xl p-6 shadow-card flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-700 dark:text-void-300 text-sm font-medium">
          {title}
        </h3>
        <div
          className={`p-2 rounded-lg bg-slate-200 dark:bg-void-900 border border-slate-300 dark:border-void-700 ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">
          {value}
        </div>
        <div className="text-xs font-mono text-slate-600 dark:text-void-400">
          {trend}
        </div>
      </div>
    </div>
  );
}
