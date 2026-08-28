import React from "react";
import RevenueTable from "../components/reports/RevenueTable";
import { useSolar } from "../context/SolarContext";
import { IndianRupee, TrendingUp, Download, Zap, FileSpreadsheet } from "lucide-react";
import clsx from "clsx";

export default function RevenueReports() {
  const { overview } = useSolar();

  const fmtINR = (v) =>
    v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Revenue & Net Metering Settlements
            </h1>
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-grid-500 animate-pulse" />
              TARIFF ₹15.20 / UNIT
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            Feed-in tariff credits, peer-to-peer transaction settlements, and monthly yield ROI
          </p>
        </div>

        <button className="btn-ghost text-xs">
          <Download className="w-3.5 h-3.5" /> Export Audit CSV
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinancialCard
          title="Today's Feed-in Earnings"
          value={fmtINR(overview?.todayRevenue || 6240)}
          icon={IndianRupee}
          accent="green"
          trend="+12.5% vs yesterday baseline"
          trendUp={true}
        />
        <FinancialCard
          title="Month-to-Date Net Yield"
          value={fmtINR(overview?.monthlyRevenue || 45200)}
          icon={TrendingUp}
          accent="solar"
          trend="On track for target ₹52,000"
          trendUp={true}
        />
        <FinancialCard
          title="Green Energy Exported"
          value="845.2 kWh"
          icon={Zap}
          accent="cyan"
          trend="Net positive microgrid contributor"
          trendUp={true}
        />
      </div>

      {/* Ledger Table Container */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Discom Settlement Ledger
            </h2>
            <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
              Verified bidirectional smart-meter transaction records
            </p>
          </div>
        </div>
        <RevenueTable />
      </div>
    </div>
  );
}

function FinancialCard({ title, value, icon: Icon, accent, trend, trendUp }) {
  const accentStyles = {
    green: "text-grid-600 dark:text-grid-400 bg-grid-50 dark:bg-grid-500/10 border-grid-200 dark:border-grid-500/20",
    solar: "text-solar-500 bg-solar-50 dark:bg-solar-500/10 border-solar-200 dark:border-solar-500/20",
    cyan: "text-energy-cyan bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
  };

  const badgeClass = accentStyles[accent] || accentStyles.green;

  return (
    <div className="card p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-3">
        <span className="stat-label truncate">{title}</span>
        <div className={clsx("w-7 h-7 rounded-md border flex items-center justify-center flex-shrink-0", badgeClass)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <div className="stat-value text-2xl lg:text-3xl text-slate-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-void-300 mt-2 flex items-center gap-1">
          <span className={trendUp ? "text-grid-600 dark:text-grid-400" : "text-energy-rose"}>
            {trendUp ? "↑" : "↓"}
          </span>
          <span>{trend}</span>
        </div>
      </div>
    </div>
  );
}
