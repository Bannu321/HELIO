import React, { useState, useEffect } from 'react';
import { fetchPanelStatus } from '../../services/api';
import clsx from 'clsx';

export default function PanelGrid() {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPanelStatus().then(d => { setPanels(d); setLoading(false); });
  }, []);

  const blocks = ['BLOCK-A', 'BLOCK-B', 'BLOCK-C', 'BLOCK-D'];

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-bold text-white">Panel Array Status</div>
          <div className="text-xs text-void-200 mt-0.5">24 panels · 4 blocks · real-time health</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-energy-green inline-block" /> Active</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-energy-rose inline-block" /> Fault</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-6 gap-2">
          {Array.from({length:24}).map((_,i) => (
            <div key={i} className="h-14 bg-void-600 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map(block => (
            <div key={block}>
              <div className="text-[9px] font-mono text-void-300 tracking-widest mb-1.5">{block}</div>
              <div className="grid grid-cols-6 gap-1.5">
                {panels.filter(p => p.block === block).map(panel => (
                  <button
                    key={panel.id}
                    onClick={() => setSelected(selected?.id === panel.id ? null : panel)}
                    className={clsx(
                      'rounded-lg p-2 flex flex-col items-center gap-0.5 transition-all border text-center',
                      panel.status === 'active'
                        ? 'bg-energy-green/8 border-energy-green/20 hover:bg-energy-green/15 hover:border-energy-green/40'
                        : 'bg-energy-rose/8 border-energy-rose/20 hover:bg-energy-rose/15',
                      selected?.id === panel.id && 'ring-1 ring-solar-500 border-solar-500/60'
                    )}
                  >
                    <div className="text-[8px] font-mono text-void-200">{panel.id}</div>
                    <div className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      panel.status === 'active' ? 'bg-energy-green animate-pulse-slow' : 'bg-energy-rose'
                    )} />
                    <div className="text-[8px] font-mono text-void-100">{panel.efficiency.toFixed(0)}%</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected panel detail */}
      {selected && (
        <div className="bg-void-600/70 border border-solar-500/20 rounded-xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display font-bold text-solar-400">{selected.id} — {selected.block}</div>
            <button onClick={() => setSelected(null)} className="text-void-200 hover:text-white text-lg leading-none">×</button>
          </div>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Power', val: `${selected.power} W`, color: 'text-solar-400' },
              { label: 'Efficiency', val: `${selected.efficiency}%`, color: 'text-energy-green' },
              { label: 'Temperature', val: `${selected.temp}°C`, color: selected.temp > 60 ? 'text-energy-rose' : 'text-energy-blue' },
              { label: 'Status', val: selected.status.toUpperCase(), color: selected.status === 'active' ? 'text-energy-green' : 'text-energy-rose' },
            ].map(item => (
              <div key={item.label} className="bg-void-700 rounded-lg p-2 text-center">
                <div className="text-[9px] font-mono text-void-200 mb-1">{item.label}</div>
                <div className={`font-mono font-bold ${item.color}`}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
