import { PC } from '@/types/pc';
import { Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PCCardProps {
  pc: PC;
  isSelected: boolean;
  onClick: () => void;
}

export function PCCard({ pc, isSelected, onClick }: PCCardProps) {
  const isEnabled = pc.enabled !== false;
  const statusConfig = {
    online: { dot: 'bg-status-online', border: 'border-status-online/30' },
    warning: { dot: 'bg-status-warning', border: 'border-status-warning/30' },
    offline: { dot: 'bg-status-offline', border: 'border-status-offline/30' },
  }[pc.status];

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-md p-3 transition-all duration-200',
        isEnabled ? 'bg-card border shadow-sm' : 'bg-zinc-50 border-zinc-200 opacity-70 grayscale-[0.3]',
        'hover:shadow-md hover:border-primary/40',
        'focus:outline-none focus:ring-2 focus:ring-primary/30',
        isSelected
          ? 'border-primary shadow-md ring-2 ring-primary/20'
          : isEnabled ? 'border-border' : 'border-zinc-200'
      )}
    >
      {/* Status indicator */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          !isEnabled ? "text-zinc-500" : (pc.status === 'online' ? "text-green-600" :
            pc.status === 'offline' ? "text-muted-foreground/50" : "text-yellow-600")
        )}>
          {!isEnabled ? 'DESC.' : (pc.status === 'online' ? 'ATIVO' : pc.status === 'offline' ? 'OFFLINE' : 'ATENÇÃO')}
        </span>
        <div className={cn(
          'w-2.5 h-2.5 rounded-full shadow-sm',
          !isEnabled ? 'bg-zinc-300' : statusConfig.dot,
          isEnabled && pc.status === 'online' && "animate-pulse"
        )} />
      </div>

      {/* PC Number */}
      <div className="flex items-center gap-2 mb-2 pt-1">
        <Monitor className={cn(
          'w-4 h-4 transition-colors',
          !isEnabled ? 'text-zinc-400' : (isSelected ? 'text-primary' :
            pc.status === 'online' ? 'text-green-600' : 'text-muted-foreground/40')
        )} />
        <span className={cn(
          "text-xs font-semibold",
          !isEnabled || pc.status === 'offline' ? "text-muted-foreground/60" : "text-foreground"
        )}>
          #{String(pc.id).padStart(2, '0')}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground truncate" title={pc.name}>
          {pc.name}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-mono text-muted-foreground truncate" title={pc.mac}>
            {pc.mac}
          </p>
          {pc.switchPort && (
            <span className="text-[9px] font-mono text-primary bg-primary/5 px-1 rounded flex items-center gap-0.5" title="Switch Port">
              P:{pc.switchPort}
            </span>
          )}
        </div>
      </div>

      {/* History badge */}
      {pc.history.length > 0 && (
        <div className="absolute bottom-2.5 right-2.5">
          <span className="text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            {pc.history.length}
          </span>
        </div>
      )}
    </button>
  );
}
