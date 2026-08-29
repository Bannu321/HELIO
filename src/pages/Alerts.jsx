import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle2,
  Activity,
  CheckCheck,
  Filter,
  ArrowRight
} from "lucide-react";
import clsx from "clsx";

export default function Alerts() {
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMLAlerts = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/ml/anomalies/latest");

        if (res.data && res.data.data) {
          const mlAnomalies = res.data.data;

          if (mlAnomalies && mlAnomalies.length > 0) {
            const mappedAlerts = mlAnomalies.map((anomaly, index) => {
              let uiType = "info";
              if (anomaly.severity === "high") uiType = "critical";
              if (anomaly.severity === "medium") uiType = "warning";

              const title =
                anomaly.anomaly_type === "hardware_fault"
                  ? `Hardware Fault: ${anomaly.building_id}`
                  : `Output Dip Detected: ${anomaly.building_id}`;

              const timeFormatted = new Date(anomaly.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              
              const deviation = anomaly.expected_kwh ? ((Math.abs(anomaly.expected_kwh - anomaly.actual_kwh) / anomaly.expected_kwh) * 100).toFixed(1) : 0;

              return {
                id: `ml-${anomaly.timestamp}`,
                type: uiType,
                title: title,
                time: `Today at ${timeFormatted}`,
                expected: `${anomaly.expected_kwh} kWh`,
                actual: `${anomaly.actual_kwh} kWh`,
                deviation: `${deviation}%`,
                causes: anomaly.causes || ["Unknown issue"],
                action: anomaly.action || "Inspect system logs."
              };
            });

            setAlertsData(mappedAlerts);
          } else {
            setAlertsData([{
              id: "normal",
              type: "success",
              title: "System Normalized",
              time: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              expected: null,
              actual: null,
              deviation: null,
              desc: "Grid synchronization established successfully. No active anomalies detected by HELIO AI.",
              causes: [],
              action: null
            }]);
          }
        }
        setLoading(false);
      } catch (error) {
        setAlertsData([
          {
            id: 1,
            type: "critical",
            title: "Low Generation Detected (Array C)",
            time: "10 mins ago",
            expected: 4.8,
            actual: 2.9,
            deviation: "39.6%",
            causes: ["Shading", "Panel soiling", "Faulty panel", "Inverter issue"],
            action: "Inspect panel section C for soiling or shading."
          },
          {
            id: 2,
            type: "warning",
            title: "Inverter Temperature Abnormality",
            time: "2 hours ago",
            expected: 45,
            actual: 58,
            deviation: "28.9%",
            causes: ["Cooling fan failure", "Ambient temperature spike"],
            action: "Verify cooling system on Inverter #02."
          },
          {
            id: 3,
            type: "info",
            title: "Generation Trending Below Forecast",
            time: "5 hours ago",
            expected: 31.4,
            actual: 25.8,
            deviation: "17.8%",
            causes: ["Cloud cover exceeding forecast", "High humidity"],
            action: "Shift flexible loads to evening hours."
          },
          {
            id: 4,
            type: "success",
            title: "System Normalized",
            time: "Yesterday",
            expected: null,
            actual: null,
            deviation: null,
            desc: "Grid synchronization established successfully.",
            causes: [],
            action: null
          },
        ]);
        setLoading(false);
      }
    };

    fetchMLAlerts();
    const interval = setInterval(fetchMLAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Alerts & Diagnostics
            </h1>
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-energy-cyan animate-pulse" />
              ANOMALY SENSORS ACTIVE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            Real-time anomaly detection and actionable intelligence
          </p>
        </div>

        <button className="btn-ghost text-xs">
          <CheckCheck className="w-3.5 h-3.5" /> Mark All Acknowledged
        </button>
      </div>

      {/* Alert Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 dark:border-void-700 border-t-energy-cyan"></div>
          </div>
        ) : (
          alertsData.map((alert) => <AlertRow key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
}

function AlertRow({ alert }) {
  const config = {
    critical: {
      icon: ShieldAlert,
      tag: "CRITICAL FAULT",
      badgeClass: "bg-energy-rose/10 text-energy-rose border-energy-rose/20",
      iconColor: "text-energy-rose bg-energy-rose/10",
      borderClass: "border-energy-rose/30 dark:border-energy-rose/20 bg-white dark:bg-void-800",
      titleColor: "text-energy-rose",
    },
    warning: {
      icon: AlertTriangle,
      tag: "WARNING",
      badgeClass: "bg-energy-amber/10 text-energy-amber border-energy-amber/20",
      iconColor: "text-energy-amber bg-energy-amber/10",
      borderClass: "border-energy-amber/30 dark:border-energy-amber/20 bg-white dark:bg-void-800",
      titleColor: "text-energy-amber",
    },
    info: {
      icon: Info,
      tag: "INTELLIGENCE",
      badgeClass: "bg-energy-cyan/10 text-energy-cyan border-energy-cyan/20",
      iconColor: "text-energy-cyan bg-energy-cyan/10",
      borderClass: "border-slate-200 dark:border-void-700 bg-white dark:bg-void-800",
      titleColor: "text-slate-900 dark:text-white",
    },
    success: {
      icon: CheckCircle2,
      tag: "NORMAL",
      badgeClass: "bg-grid-500/10 text-grid-600 dark:text-grid-400 border-grid-500/20",
      iconColor: "text-grid-600 dark:text-grid-400 bg-grid-500/10",
      borderClass: "border-slate-200 dark:border-void-700 bg-white dark:bg-void-800",
      titleColor: "text-slate-900 dark:text-white",
    },
  };

  const { icon: Icon, tag, badgeClass, iconColor, borderClass, titleColor } = config[alert.type] || config.info;

  return (
    <div className={clsx("rounded-xl p-5 border shadow-sm transition-all", borderClass)}>
      <div className="flex items-start gap-4">
        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h3 className={clsx("font-display font-bold text-lg", titleColor)}>
                {alert.title}
              </h3>
              <span className={clsx("text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase", badgeClass)}>
                {tag}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-void-400 flex-shrink-0">
              {alert.time}
            </span>
          </div>

          {alert.desc && (
            <p className="text-sm text-slate-600 dark:text-void-300">
              {alert.desc}
            </p>
          )}

          {alert.expected !== null && alert.expected !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-void-900/50 p-4 rounded-lg border border-slate-100 dark:border-void-800">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-void-400 mb-1 uppercase tracking-wider">Expected</div>
                    <div className="font-mono font-medium text-slate-900 dark:text-white">{alert.expected}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-void-400 mb-1 uppercase tracking-wider">Actual</div>
                    <div className="font-mono font-medium text-slate-900 dark:text-white">{alert.actual}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-void-400 mb-1 uppercase tracking-wider">Deviation</div>
                    <div className="font-mono font-bold text-energy-rose">{alert.deviation}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-void-400 mb-1.5 uppercase tracking-wider">Possible Causes</div>
                  <ul className="list-disc list-inside text-xs text-slate-600 dark:text-void-300 space-y-1">
                    {alert.causes.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-solar-50 dark:bg-solar-500/10 p-4 rounded-lg border border-solar-200 dark:border-solar-500/20 flex flex-col justify-center">
                <div className="text-[10px] font-mono text-solar-700 dark:text-solar-400 mb-2 uppercase tracking-wider font-bold">Recommended Action</div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-solar-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-900 dark:text-solar-50">
                    {alert.action}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
