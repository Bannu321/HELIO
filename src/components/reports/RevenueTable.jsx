import React, { useState, useEffect } from 'react';
import { fetchRevenueReport } from '../../services/api';

export default function RevenueTable() {
  const [data,    setData]    = useState(null);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchRevenueReport(page).then(d => { setData(d); setLoading(false); });
  }, [page]);

  const StatusBadge = ({ status }) => {
    const map = {
      settled: 'badge-settled',
      pending: 'badge-pending',
      failed:  'badge-failed',
    };
    return <span className={map[status] ?? 'badge-active'}>{status.toUpperCase()}</span>;
  };

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-sm font-bold text-white">Revenue Report</div>
          <div className="text-xs text-void-200 mt-0.5">Per-session energy export · net meter log</div>
        </div>
        <button className="btn-ghost text-xs flex items-center gap-1.5">
          ↓ Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-void-500">
        <table className="data-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Time</th>
              <th>Block</th>
              <th>Energy</th>
              <th>Rate</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length: 6}).map((_,i) => (
                  <tr key={i}>
                    {Array.from({length:7}).map((_,j) => (
                      <td key={j}><div className="h-4 bg-void-600 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : data?.sessions.map((row) => (
                  <tr key={row._id}>
                    <td className="font-mono text-xs text-void-200">{row._id.slice(-8)}</td>
                    <td className="font-mono text-xs">{row.time}</td>
                    <td><span className="badge-active">{row.panel}</span></td>
                    <td className="font-mono text-xs text-solar-400">{row.energy}</td>
                    <td className="font-mono text-xs text-void-100">{row.rate}/kWh</td>
                    <td className="font-mono text-xs text-energy-green font-bold">{row.revenue}</td>
                    <td><StatusBadge status={row.status} /></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between text-xs font-mono text-void-200">
          <span>{data.total} total records · page {data.page} of {data.pages}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost px-3 py-1.5 disabled:opacity-30"
            >← Prev</button>
            <button
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="btn-ghost px-3 py-1.5 disabled:opacity-30"
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
