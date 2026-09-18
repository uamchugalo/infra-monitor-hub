import { LABS, LabId } from "@/utils/pcData";
import { cn } from "@/lib/utils";

interface LabSelectorProps {
  selectedLab: LabId;
  onSelectLab: (labId: LabId) => void;
}

export function LabSelector({ selectedLab, onSelectLab }: LabSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-md border border-border">
      {LABS.map((lab) => (
        <button
          key={lab.id}
          onClick={() => onSelectLab(lab.id)}
          className={cn(
            "px-4 py-2 rounded text-sm font-medium transition-all duration-200",
            selectedLab === lab.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background",
          )}
        >
          {lab.name}
        </button>
      ))}
    </div>
  );
}
