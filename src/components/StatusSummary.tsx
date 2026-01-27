import { PC } from '@/types/pc';
import { Monitor, AlertTriangle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSummaryProps {
  pcs: PC[];
}

export function StatusSummary({ pcs }: StatusSummaryProps) {
  const online = pcs.filter(p => p.status === 'online').length;
  const warning = pcs.filter(p => p.status === 'warning').length;
  const offline = pcs.filter(p => p.status === 'offline').length;

  const stats = [
    { label: 'Ativos', count: online, icon: Monitor, bgClass: 'bg-green-50', textClass: 'text-green-700' },
    { label: 'Atenção', count: warning, icon: AlertTriangle, bgClass: 'bg-amber-50', textClass: 'text-amber-600' },
    { label: 'Offline', count: offline, icon: WifiOff, bgClass: 'bg-red-50', textClass: 'text-red-600' },
  ];

  return (
    <div className="flex gap-2">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md', stat.bgClass)}
        >
          <stat.icon className={cn('w-3.5 h-3.5', stat.textClass)} />
          <span className={cn('font-semibold text-sm', stat.textClass)}>
            {stat.count}
          </span>
        </div>
      ))}
    </div>
  );
}
