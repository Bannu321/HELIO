import React from "react";
import { Save, Radio, Cpu, ShieldCheck, Check } from "lucide-react";

export default function Settings() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-void-700/60">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System & SCADA Configuration
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-void-300 mt-1">
            Configure DISCOM net-metering tariffs, IoT telemetry brokers, and inference parameters
          </p>
        </div>

        <button className="btn-solar">
          <Save className="w-3.5 h-3.5" /> Save Configuration
        </button>
      </div>

      {/* Grid & Tariff Settings */}
      <section className="card p-6 space-y-5">
        <div className="border-b border-slate-100 dark:border-void-700/60 pb-3">
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Grid & Net-Metering Tariffs
          </h2>
          <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
            Base export feed-in credits and regional DISCOM regulatory mapping
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="stat-label">
              Base Feed-in Tariff (INR / kWh)
            </label>
            <input
              type="text"
              defaultValue="15.20"
              className="field font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="stat-label">
              Grid Provider (DISCOM)
            </label>
            <select className="field font-mono">
              <option>APSPDCL — Southern Power Distribution</option>
              <option>TSSPDCL — Telangana State Power</option>
              <option>BESCOM — Bangalore Electricity</option>
              <option>MSEDCL — Maharashtra State</option>
            </select>
          </div>
        </div>
      </section>

      {/* IoT Gateway Configuration */}
      <section className="card p-6 space-y-5">
        <div className="border-b border-slate-100 dark:border-void-700/60 pb-3">
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
            IoT Edge Gateway & Modbus Ingestion
          </h2>
          <p className="text-xs text-slate-500 dark:text-void-300 font-mono mt-0.5">
            Telemetry ingestion endpoints for ESP32 / Raspberry Pi edge devices
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="stat-label">
              MQTT Telemetry Broker Endpoint
            </label>
            <input
              type="text"
              defaultValue="mqtt://broker.hivemq.com:1883/helio/scada/telemetry"
              className="field font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="stat-label">
                Sensor Polling Frequency
              </label>
              <select className="field font-mono text-xs">
                <option>Every 500 ms (High Precision)</option>
                <option selected>Every 1 second (Standard Telemetry)</option>
                <option>Every 5 seconds (Low Bandwidth)</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="stat-label mb-1">
                Gateway Health Status
              </label>
              <div className="live-badge w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-grid-500 animate-pulse" />
                EDGE GATEWAY CONNECTED (PING: 14ms)
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
