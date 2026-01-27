import { PC } from '@/types/pc';
import { Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PCCardProps {
  pc: PC;
  isSelected: boolean;
  onClick: () => void;
}

export function PCCard({ pc, isSelected, onClick }: PCCardProps) {
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
        'bg-card border shadow-sm',
        'hover:shadow-md hover:border-primary/40',
        'focus:outline-none focus:ring-2 focus:ring-primary/30',
        isSelected 
          ? 'border-primary shadow-md ring-2 ring-primary/20' 
          : 'border-border'
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        'absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full',
        statusConfig.dot
      )} />

      {/* PC Number */}
      <div className="flex items-center gap-2 mb-2">
        <Monitor className={cn(
          'w-4 h-4 transition-colors',
          isSelected ? 'text-primary' : 'text-muted-foreground'
        )} />
        <span className="text-xs font-semibold text-muted-foreground">
          #{String(pc.id).padStart(2, '0')}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground truncate" title={pc.name}>
          {pc.name}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground truncate" title={pc.mac}>
          {pc.mac}
        </p>
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
