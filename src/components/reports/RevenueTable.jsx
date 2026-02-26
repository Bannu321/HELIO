import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

// Replace this with actual data from your context/API later
const mockSettlements = [
  { id: 'TRX-1092', date: 'Today, 14:30', type: 'Export', amount: '+₹450', units: '12.5 kWh', status: 'Settled' },
  { id: 'TRX-1091', date: 'Today, 10:15', type: 'Export', amount: '+₹820', units: '22.8 kWh', status: 'Settled' },
  { id: 'TRX-1090', date: 'Yesterday, 18:00', type: 'Import', amount: '-₹120', units: '3.1 kWh', status: 'Pending' },
  { id: 'TRX-1089', date: 'Yesterday, 14:00', type: 'Export', amount: '+₹640', units: '18.2 kWh', status: 'Settled' },
  { id: 'TRX-1088', date: '24 Feb, 16:45', type: 'Export', amount: '+₹510', units: '14.6 kWh', status: 'Failed' },
];

export default function RevenueTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-void-700 text-void-400 text-xs font-mono uppercase tracking-wider">
            <th className="pb-4 pl-2 font-medium">Transaction ID</th>
            <th className="pb-4 font-medium">Date & Time</th>
            <th className="pb-4 font-medium">Type</th>
            <th className="pb-4 font-medium">Energy</th>
            <th className="pb-4 font-medium">Amount</th>
            <th className="pb-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {mockSettlements.map((row, idx) => (
            <tr key={idx} className="border-b border-void-700/50 hover:bg-void-700/20 transition-colors group">
              <td className="py-4 pl-2 font-mono text-void-300 group-hover:text-white transition-colors">{row.id}</td>
              <td className="py-4 text-void-100">{row.date}</td>
              <td className="py-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                  row.type === 'Export' ? 'bg-energy-cyan/10 text-energy-cyan' : 'bg-void-700 text-void-300'
                }`}>
                  {row.type}
                </span>
              </td>
              <td className="py-4 text-void-200">{row.units}</td>
              <td className={`py-4 font-mono font-bold ${row.amount.startsWith('+') ? 'text-energy-green' : 'text-energy-rose'}`}>
                {row.amount}
              </td>
              <td className="py-4">
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    'Settled': { icon: CheckCircle2, color: 'text-energy-green bg-energy-green/10 border-energy-green/20' },
    'Pending': { icon: Clock, color: 'text-energy-amber bg-energy-amber/10 border-energy-amber/20' },
    'Failed': { icon: AlertCircle, color: 'text-energy-rose bg-energy-rose/10 border-energy-rose/20' },
  };
  
  const { icon: Icon, color } = config[status] || config['Pending'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}