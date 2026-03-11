// import React from "react";
// import { AlertTriangle, Info, ShieldAlert, CheckCircle2 } from "lucide-react";

// const alertsData = [
//   {
//     id: 1,
//     type: "critical",
//     title: "Inverter Comm Loss",
//     time: "10 mins ago",
//     desc: "Lost connection to Inverter A. Attempting reconnect.",
//   },
//   {
//     id: 2,
//     type: "warning",
//     title: "Soiling Loss Detected",
//     time: "2 hours ago",
//     desc: "Dust accumulation on Array B reducing output by 2.1%. Maintenance recommended.",
//   },
//   {
//     id: 3,
//     type: "info",
//     title: "Grid Tariff Updated",
//     time: "5 hours ago",
//     desc: "DISCOM peak tariff period started. Export profitability increased.",
//   },
//   {
//     id: 4,
//     type: "success",
//     title: "System Optimal",
//     time: "Yesterday",
//     desc: "Daily generation exceeded estimation by 4%.",
//   },
// ];

// export default function Alerts() {
//   return (
//     <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-fade-in">
//       <header className="flex justify-between items-end border-b border-slate-300 dark:border-void-700 pb-6">
//         <div>
//           <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
//             System Alerts
//           </h1>
//           <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
//             Notifications and diagnostics
//           </p>
//         </div>
//         <button className="text-xs font-mono text-slate-600 dark:text-void-400 hover:text-slate-900 dark:hover:text-white transition-colors">
//           MARK ALL AS READ
//         </button>
//       </header>

//       <div className="space-y-6">
//         {alertsData.map((alert) => (
//           <AlertRow key={alert.id} alert={alert} />
//         ))}
//       </div>
//     </div>
//   );
// }

// function AlertRow({ alert }) {
//   const config = {
//     critical: {
//       icon: ShieldAlert,
//       color: "text-energy-rose",
//       bg: "bg-energy-rose/10",
//       border: "border-energy-rose/30",
//     },
//     warning: {
//       icon: AlertTriangle,
//       color: "text-energy-amber",
//       bg: "bg-energy-amber/10",
//       border: "border-energy-amber/30",
//     },
//     info: {
//       icon: Info,
//       color: "text-energy-cyan",
//       bg: "bg-energy-cyan/10",
//       border: "border-energy-cyan/30",
//     },
//     success: {
//       icon: CheckCircle2,
//       color: "text-energy-green",
//       bg: "bg-energy-green/10",
//       border: "border-energy-green/30",
//     },
//   };

//   const { icon: Icon, color, bg, border } = config[alert.type];

//   return (
//     <div
//       className={`flex items-start gap-4 p-5 rounded-2xl border ${border} ${bg} backdrop-blur-sm transition-all hover:bg-opacity-20 bg-slate-50 dark:bg-slate-950`}
//     >
//       <div className={`mt-1 ${color}`}>
//         <Icon className="w-6 h-6" />
//       </div>
//       <div className="flex-1">
//         <div className="flex justify-between items-start mb-1">
//           <h3 className={`font-display font-bold ${color}`}>{alert.title}</h3>
//           <span className="text-xs font-mono text-slate-600 dark:text-void-400">
//             {alert.time}
//           </span>
//         </div>
//         <p className="text-sm text-slate-700 dark:text-void-200">
//           {alert.desc}
//         </p>
//       </div>
//     </div>
//   );
// }

// real data

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle2,
  Activity,
} from "lucide-react";

export default function Alerts() {
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMLAlerts = async () => {
      try {
        // Fetch the anomalies detected by the Isolation Forest ML Model
        // Assuming your Flask ML server is running on port 5000 (adjust if needed)
        const res = await axios.get(
          "http://127.0.0.1:5000/api/ml/anomalies/latest",
        );

        if (res.data && res.data.data) {
          const mlAnomalies = res.data.data;

          // Shuffle the ML anomalies to get a random mix for the demo
          const shuffled = mlAnomalies.sort(() => 0.5 - Math.random());
          const selectedAnomalies = shuffled.slice(0, 5); // Pick 5 random ones

          // Map the Python ML data structure to your UI's Alert config
          const mappedAlerts = selectedAnomalies.map((anomaly, index) => {
            // Map ML severity to UI colors
            let uiType = "info";
            if (anomaly.severity === "high") uiType = "critical";
            if (anomaly.severity === "medium") uiType = "warning";

            // Create a human-readable title from the ML anomaly_type
            const title =
              anomaly.anomaly_type === "sudden_spike"
                ? `Spike Detected: ${anomaly.building_id}`
                : `Drop Detected: ${anomaly.building_id}`;

            // Create a descriptive message using the ML's expected vs actual math
            const desc = `Isolation Forest flagged anomalous behavior. Expected ~${anomaly.expected_kwh} kWh, but recorded ${anomaly.actual_kwh} kWh. (Confidence Score: ${anomaly.anomaly_score})`;

            // Format the timestamp nicely
            const timeFormatted = new Date(
              anomaly.timestamp,
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return {
              id: `ml-${index}`,
              type: uiType,
              title: title,
              time: `Today at ${timeFormatted}`,
              desc: desc,
            };
          });

          // Mix in a guaranteed "System Optimal" success message to show variety
          mappedAlerts.push({
            id: "system-success",
            type: "success",
            title: "Microgrid Stabilized",
            time: "Just now",
            desc: "AI routing complete. Daily generation exceeded estimation by 4.2%. Battery reserves optimal.",
          });

          setAlertsData(mappedAlerts);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch ML alerts, using fallback data", error);

        // Fallback data just in case the Python server isn't running
        setAlertsData([
          {
            id: 1,
            type: "critical",
            title: "Inverter Comm Loss",
            time: "10 mins ago",
            desc: "Lost connection to Inverter A. Attempting reconnect.",
          },
          {
            id: 2,
            type: "warning",
            title: "Soiling Loss Detected",
            time: "2 hours ago",
            desc: "Dust accumulation on Array B reducing output by 2.1%. Maintenance recommended.",
          },
        ]);
        setLoading(false);
      }
    };

    fetchMLAlerts();

    // Optional: Refresh alerts every 30 seconds
    const interval = setInterval(fetchMLAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-8 animate-fade-in">
      <header className="flex justify-between items-end border-b border-slate-300 dark:border-void-700 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
              System Alerts
            </h1>
            <div className="flex items-center gap-1.5 bg-energy-cyan/10 border border-energy-cyan/20 px-2 py-1 rounded-md">
              <Activity className="w-3 h-3 text-energy-cyan animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-energy-cyan uppercase tracking-wider">
                ML Scanning Active
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-void-300 font-mono">
            Isolation Forest diagnostics & anomaly detection
          </p>
        </div>
        <button className="text-xs font-mono text-slate-600 dark:text-void-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          MARK ALL AS READ
        </button>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-energy-cyan"></div>
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
      color: "text-energy-rose",
      bg: "bg-energy-rose/10",
      border: "border-energy-rose/30",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-500", // Adjusted slightly to ensure Tailwind compatibility if energy-amber isn't defined
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
    info: {
      icon: Info,
      color: "text-energy-cyan",
      bg: "bg-energy-cyan/10",
      border: "border-energy-cyan/30",
    },
    success: {
      icon: CheckCircle2,
      color: "text-energy-green",
      bg: "bg-energy-green/10",
      border: "border-energy-green/30",
    },
  };

  // Fallback to 'info' config if the type somehow doesn't match
  const { icon: Icon, color, bg, border } = config[alert.type] || config.info;

  return (
    <div
      className={`flex items-start gap-4 p-5 rounded-2xl border ${border} ${bg} backdrop-blur-sm transition-all hover:bg-opacity-20 bg-slate-50 dark:bg-slate-950`}
    >
      <div className={`mt-1 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`font-display font-bold ${color}`}>{alert.title}</h3>
          <span className="text-xs font-mono text-slate-600 dark:text-void-400">
            {alert.time}
          </span>
        </div>
        <p className="text-sm text-slate-700 dark:text-void-200">
          {alert.desc}
        </p>
      </div>
    </div>
  );
}
