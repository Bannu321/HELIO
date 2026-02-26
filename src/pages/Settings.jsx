import React from "react";
import { Save } from "lucide-react";

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-10 animate-fade-in pb-16">
      <header className="flex justify-between items-end border-b border-slate-300 dark:border-void-700 pb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
            Platform Settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-void-300 mt-1 font-mono">
            Configure grid integrations and preferences
          </p>
        </div>
        <button className="bg-solar-500 hover:bg-solar-400 text-white dark:text-void-900 px-5 py-2 rounded-lg font-bold transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </header>

      {/* Grid Configuration */}
      <section className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-8 shadow-card space-y-6">
        <h2 className="font-display font-bold text-slate-900 dark:text-white border-b border-slate-300 dark:border-void-700 pb-3">
          Grid & Tariff Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-void-300 uppercase tracking-widest">
              Base Export Tariff (INR/kWh)
            </label>
            <input
              type="text"
              defaultValue="3.50"
              className="w-full bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-600 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:border-solar-500 transition-colors font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-void-300 uppercase tracking-widest">
              Grid Provider (DISCOM)
            </label>
            <select className="w-full bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-600 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:border-solar-500 transition-colors">
              <option>APSPDCL</option>
              <option>TSSPDCL</option>
              <option>BESCOM</option>
            </select>
          </div>
        </div>
      </section>

      {/* IoT Gateway Configuration */}
      <section className="bg-white dark:bg-void-800 border border-slate-300 dark:border-void-700 rounded-2xl p-6 shadow-card space-y-4">
        <h2 className="font-display font-bold text-slate-900 dark:text-white border-b border-slate-300 dark:border-void-700 pb-2">
          IoT Gateway (ESP32 / Pi)
        </h2>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-void-300 uppercase tracking-widest">
              MQTT Broker URL
            </label>
            <input
              type="text"
              defaultValue="mqtt://broker.hivemq.com"
              className="w-full bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-600 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:border-solar-500 transition-colors font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-void-300 uppercase tracking-widest">
                Polling Rate
              </label>
              <select className="w-full bg-slate-100 dark:bg-void-900 border border-slate-300 dark:border-void-600 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 outline-none focus:border-solar-500 transition-colors">
                <option>Every 1 minute</option>
                <option selected>Every 5 minutes</option>
                <option>Every 15 minutes</option>
              </select>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-600 dark:text-void-300 uppercase tracking-widest mb-3">
                Gateway Status
              </label>
              <div className="flex items-center gap-2 text-energy-green text-sm font-mono bg-energy-green/10 border border-energy-green/20 px-4 py-2 rounded-lg w-fit">
                <span className="w-2 h-2 rounded-full bg-energy-green animate-pulse"></span>{" "}
                Connected
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
