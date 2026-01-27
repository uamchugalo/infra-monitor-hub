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
    { label: 'Ativos', count: online, icon: Monitor, colorClass: 'text-status-online' },
    { label: 'Atenção', count: warning, icon: AlertTriangle, colorClass: 'text-status-warning' },
    { label: 'Offline', count: offline, icon: WifiOff, colorClass: 'text-status-offline' },
  ];

  return (
    <div className="flex gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2">
          <stat.icon className={`w-4 h-4 ${stat.colorClass}`} />
          <span className="text-sm text-muted-foreground">{stat.label}:</span>
          <span className={`font-mono font-semibold ${stat.colorClass}`}>
            {stat.count}
          </span>
        </div>
      ))}
    </div>
  );
}
