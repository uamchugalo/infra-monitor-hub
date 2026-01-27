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
    online: { dot: 'bg-status-online', glow: 'shadow-[0_0_12px_hsl(var(--status-online)/0.5)]' },
    warning: { dot: 'bg-status-warning', glow: 'shadow-[0_0_12px_hsl(var(--status-warning)/0.5)]' },
    offline: { dot: 'bg-status-offline', glow: 'shadow-[0_0_12px_hsl(var(--status-offline)/0.5)]' },
  }[pc.status];

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-xl p-4 transition-all duration-300',
        'bg-card/60 backdrop-blur-sm border border-border/50',
        'hover:bg-card hover:border-primary/30 hover:scale-[1.02]',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        isSelected && 'bg-card border-primary ring-2 ring-primary/30 scale-[1.02]'
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        'absolute top-3 right-3 w-2.5 h-2.5 rounded-full transition-all duration-300',
        statusConfig.dot,
        statusConfig.glow
      )} />

      {/* PC Number */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          'p-1.5 rounded-lg transition-colors duration-300',
          isSelected ? 'bg-primary/20' : 'bg-muted/50 group-hover:bg-primary/10'
        )}>
          <Monitor className={cn(
            'w-3.5 h-3.5 transition-colors duration-300',
            isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          )} />
        </div>
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          #{String(pc.id).padStart(2, '0')}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground truncate" title={pc.name}>
          {pc.name}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/70 truncate" title={pc.mac}>
          {pc.mac}
        </p>
      </div>

      {/* History badge */}
      {pc.history.length > 0 && (
        <div className="absolute bottom-3 right-3">
          <span className="text-[9px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
            {pc.history.length}
          </span>
        </div>
      )}
    </button>
  );
}
