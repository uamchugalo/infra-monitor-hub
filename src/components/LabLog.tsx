import { useState } from "react";
import { LabLog as LabLogType } from "@/types/pc";
import { formatTimestamp, generateId } from "@/utils/pcData";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LabLogProps {
  logs: LabLogType[];
  labName: string;
  onAddLog: (log: LabLogType) => void;
  onDeleteLog: (id: string) => void;
}

export function LabLog({ logs, labName, onAddLog, onDeleteLog }: LabLogProps) {
  const [newLog, setNewLog] = useState("");

  const handleAddLog = () => {
    if (!newLog.trim()) return;

    const entry: LabLogType = {
      id: generateId(),
      timestamp: formatTimestamp(),
      message: newLog.trim(),
    };

    onAddLog(entry);
    setNewLog("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddLog();
    }
  };

  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border bg-muted/30">
        <div className="p-1.5 bg-primary/10 rounded">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">
            Log do {labName}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {logs.length} registros
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-b border-border">
        <div className="flex gap-2">
          <Input
            value={newLog}
            onChange={(e) => setNewLog(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
            placeholder="Evento do laboratório..."
          />
          <Button
            onClick={handleAddLog}
            disabled={!newLog.trim()}
            size="icon"
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Logs */}
      <div className="max-h-[600px] overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground p-4 text-center">
            Nenhum evento
          </p>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((entry) => (
              <div
                key={entry.id}
                className="group p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-primary">
                      {entry.timestamp}
                    </span>
                    <p className="text-xs text-foreground mt-0.5">
                      {entry.message}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteLog(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
