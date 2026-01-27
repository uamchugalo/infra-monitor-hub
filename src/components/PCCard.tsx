import { PC } from '@/types/pc';
import { Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PCCardProps {
  pc: PC;
  isSelected: boolean;
  onClick: () => void;
}

export function PCCard({ pc, isSelected, onClick }: PCCardProps) {
  const statusClass = {
    online: 'status-online',
    warning: 'status-warning',
    offline: 'status-offline',
  }[pc.status];

  return (
    <div
      onClick={onClick}
      className={cn('pc-card group', isSelected && 'selected')}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="font-mono text-sm font-semibold text-foreground">
            #{String(pc.id).padStart(2, '0')}
          </span>
        </div>
        <div className={cn('status-indicator', statusClass)} />
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground truncate" title={pc.name}>
          {pc.name}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground truncate" title={pc.mac}>
          {pc.mac}
        </p>
      </div>

      {pc.history.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">
            {pc.history.length} registro{pc.history.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
