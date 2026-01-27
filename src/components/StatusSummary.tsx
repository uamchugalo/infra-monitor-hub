import { PC } from '@/types/pc';
import { Monitor, AlertTriangle, WifiOff } from 'lucide-react';

interface StatusSummaryProps {
  pcs: PC[];
}

export function StatusSummary({ pcs }: StatusSummaryProps) {
  const online = pcs.filter(p => p.status === 'online').length;
  const warning = pcs.filter(p => p.status === 'warning').length;
  const offline = pcs.filter(p => p.status === 'offline').length;

  const stats = [
    { label: 'Ativos', count: online, icon: Monitor, colorClass: 'text-status-online bg-status-online/10' },
    { label: 'Atenção', count: warning, icon: AlertTriangle, colorClass: 'text-status-warning bg-status-warning/10' },
    { label: 'Offline', count: offline, icon: WifiOff, colorClass: 'text-status-offline bg-status-offline/10' },
  ];

  return (
    <div className="flex gap-2">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${stat.colorClass.split(' ')[1]}`}
        >
          <stat.icon className={`w-3.5 h-3.5 ${stat.colorClass.split(' ')[0]}`} />
          <span className={`font-mono text-sm font-semibold ${stat.colorClass.split(' ')[0]}`}>
            {stat.count}
          </span>
        </div>
      ))}
    </div>
  );
}
