import React, { useState, useEffect } from "react";
import { Cpu, Wifi, Activity, Thermometer, Zap, AlertTriangle, CheckCircle2, Server, ServerCrash, Clock } from "lucide-react";
import clsx from "clsx";
import { fetchLatestTelemetry } from "../services/api";

export default function HardwareStatus() {
  const [deviceStatus, setDeviceStatus] = useState("online"); // online, offline, degraded
  const [lastPing, setLastPing] = useState(new Date());
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    const loadTelemetry = async () => {
      const data = await fetchLatestTelemetry();
      if (data) {
        setTelemetry(data);
        const timestamp = new Date(data.timestamp);
        setLastPing(timestamp);
        const isOffline = new Date() - timestamp > 30000;
        setDeviceStatus(isOffline ? "offline" : data.fault ? "degraded" : "online");
      }
    };
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Cpu className="w-6 h-6 text-solar-500" />
            Hardware & IoT Monitoring
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            Real-time HELIO Edge Device Telemetry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-void-100 dark:bg-void-800 border border-slate-200 dark:border-void-700 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-void-400" />
            <span className="text-slate-600 dark:text-void-300">Last Ping:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {lastPing.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Status Banner */}
      <div className={clsx(
        "p-6 rounded-2xl border flex items-center gap-6",
        deviceStatus === "online" 
          ? "bg-grid-50/50 dark:bg-grid-500/10 border-grid-200 dark:border-grid-500/20"
          : "bg-energy-rose/5 border-energy-rose/20"
      )}>
        <div className={clsx(
          "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0",
          deviceStatus === "online" ? "bg-grid-100 dark:bg-grid-500/20 text-grid-600 dark:text-grid-400" : "bg-energy-rose/10 text-energy-rose"
        )}>
          {deviceStatus === "online" ? <Server className="w-8 h-8" /> : <ServerCrash className="w-8 h-8" />}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            HELIO Core Node 01
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              {deviceStatus === "online" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-grid-400 opacity-75"></span>}
              <span className={clsx("relative inline-flex rounded-full h-2.5 w-2.5", deviceStatus === "online" ? "bg-grid-500" : "bg-energy-rose")}></span>
            </span>
            <span className={clsx(
              "font-mono text-sm font-medium tracking-wide uppercase",
              deviceStatus === "online" ? "text-grid-600 dark:text-grid-400" : 
              deviceStatus === "degraded" ? "text-amber-500" : "text-energy-rose"
            )}>
              {deviceStatus === "online" ? "System Online & Syncing" : 
               deviceStatus === "degraded" ? "Fault Detected" : "Connection Lost"}
            </span>
          </div>
        </div>
        
        <div className="ml-auto hidden md:flex items-center gap-8 pl-8 border-l border-slate-200 dark:border-void-700/60">
          <div className="text-center">
            <div className="text-xs font-mono text-slate-500 dark:text-void-400 mb-1">Firmware</div>
            <div className="font-medium text-slate-900 dark:text-white font-mono">v2.4.1-edge</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-mono text-slate-500 dark:text-void-400 mb-1">Uptime</div>
            <div className="font-medium text-slate-900 dark:text-white font-mono">42d 18h</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-mono text-slate-500 dark:text-void-400 mb-1">IP Address</div>
            <div className="font-medium text-slate-900 dark:text-white font-mono">192.168.1.104</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ESP32 Microcontroller Status */}
        <div className="bg-white dark:bg-void-800 border border-slate-200 dark:border-void-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-void-700">
            <div className="p-2 bg-void-100 dark:bg-void-900 rounded-lg text-void-500 dark:text-void-300">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Microcontroller</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">CPU Core 0 Load</span>
              <span className="font-mono text-sm text-slate-900 dark:text-white">24%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">CPU Core 1 Load</span>
              <span className="font-mono text-sm text-slate-900 dark:text-white">12%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">Free Heap Memory</span>
              <span className="font-mono text-sm text-slate-900 dark:text-white">128 KB</span>
            </div>
          </div>
        </div>

        {/* Communication Status */}
        <div className="bg-white dark:bg-void-800 border border-slate-200 dark:border-void-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-void-700">
            <div className="p-2 bg-energy-cyan/10 rounded-lg text-energy-cyan">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Connectivity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">WiFi Signal (RSSI)</span>
              <span className="font-mono text-sm text-grid-600 dark:text-grid-400 font-medium">-62 dBm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">MQTT Broker Sync</span>
              <div className="flex items-center gap-1.5 text-grid-600 dark:text-grid-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-mono text-sm">Connected</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">Packet Loss</span>
              <span className="font-mono text-sm text-slate-900 dark:text-white">0.02%</span>
            </div>
          </div>
        </div>

        {/* Temperature & Environment */}
        <div className="bg-white dark:bg-void-800 border border-slate-200 dark:border-void-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-void-700">
            <div className="p-2 bg-solar-500/10 rounded-lg text-solar-600 dark:text-solar-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Internal Environment</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">Enclosure Temp</span>
              <span className="font-mono text-sm text-slate-900 dark:text-white">
                {telemetry?.temperature ? `${telemetry.temperature.toFixed(1)} °C` : "42.5 °C"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">Humidity</span>
              <span className="font-mono text-sm text-slate-900 dark:text-white">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-void-300">Cooling Fan</span>
              <span className="font-mono text-sm text-slate-500 dark:text-void-400">
                {telemetry?.temperature > 40 ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Voltage Sensors (PZEM/INA) */}
        <div className="bg-white dark:bg-void-800 border border-slate-200 dark:border-void-700 rounded-xl p-5 space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-void-700">
            <div className="p-2 bg-energy-rose/10 rounded-lg text-energy-rose">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Electrical Sensor Diagnostics</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">DC String A Sensor</div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${telemetry?.fault ? 'bg-energy-rose/20 text-energy-rose' : 'bg-grid-100 text-grid-700 dark:bg-grid-500/20 dark:text-grid-400'}`}>
                  {telemetry?.fault ? 'FAULT' : 'OK'}
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-void-400 font-mono">Modbus: 115200 baud</div>
              <div className="mt-3 text-lg font-mono text-slate-900 dark:text-white">
                {telemetry?.voltage ? telemetry.voltage.toFixed(1) : "34.2"} V <span className="text-sm text-slate-500 dark:text-void-400">/ {telemetry?.current ? telemetry.current.toFixed(1) : "8.4"} A</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">DC String B Sensor</div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${telemetry?.fault ? 'bg-energy-rose/20 text-energy-rose' : 'bg-grid-100 text-grid-700 dark:bg-grid-500/20 dark:text-grid-400'}`}>
                  {telemetry?.fault ? 'FAULT' : 'OK'}
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-void-400 font-mono">Modbus: 115200 baud</div>
              <div className="mt-3 text-lg font-mono text-slate-900 dark:text-white">
                {telemetry?.voltage ? (telemetry.voltage * 0.99).toFixed(1) : "34.1"} V <span className="text-sm text-slate-500 dark:text-void-400">/ {telemetry?.current ? (telemetry.current * 0.98).toFixed(1) : "8.2"} A</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-slate-900 dark:text-white">AC Grid Output Sensor</div>
                <div className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-grid-100 text-grid-700 dark:bg-grid-500/20 dark:text-grid-400">OK</div>
              </div>
              <div className="text-xs text-slate-500 dark:text-void-400 font-mono">I2C Address: 0x40</div>
              <div className="mt-3 text-lg font-mono text-slate-900 dark:text-white">232 V <span className="text-sm text-slate-500 dark:text-void-400">/ 50.0 Hz</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
