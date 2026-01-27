import { LABS, LabId } from '@/utils/pcData';
import { cn } from '@/lib/utils';

interface LabSelectorProps {
  selectedLab: LabId;
  onSelectLab: (labId: LabId) => void;
}

export function LabSelector({ selectedLab, onSelectLab }: LabSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
      {LABS.map((lab) => (
        <button
          key={lab.id}
          onClick={() => onSelectLab(lab.id)}
          className={cn(
            'relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300',
            selectedLab === lab.id
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {selectedLab === lab.id && (
            <span className="absolute inset-0 bg-primary rounded-md animate-scale-in" />
          )}
          <span className="relative z-10">{lab.name}</span>
        </button>
      ))}
    </div>
  );
}
