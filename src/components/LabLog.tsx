import { useState } from 'react';
import { LabLog as LabLogType } from '@/types/pc';
import { formatTimestamp, generateId } from '@/utils/pcData';
import { Building2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LabLogProps {
  logs: LabLogType[];
  onAddLog: (log: LabLogType) => void;
  onDeleteLog: (id: string) => void;
}

export function LabLog({ logs, onAddLog, onDeleteLog }: LabLogProps) {
  const [newLog, setNewLog] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddLog = () => {
    if (!newLog.trim()) return;
    
    const entry: LabLogType = {
      id: generateId(),
      timestamp: formatTimestamp(),
      message: newLog.trim(),
    };
    
    onAddLog(entry);
    setNewLog('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddLog();
    }
  };

  return (
    <div className="panel-section flex flex-col h-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 border-b border-border hover:bg-accent/50 transition-colors"
      >
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Log Geral do Laboratório
          <span className="text-xs text-muted-foreground font-normal">
            ({logs.length})
          </span>
        </h2>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <>
          <div className="p-3 border-b border-border">
            <div className="flex gap-2">
              <Input
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-input border-border text-sm"
                placeholder="Ex: Manutenção no ar condicionado..."
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

          <ScrollArea className="flex-1 max-h-64">
            <div className="divide-y divide-border/50">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 text-center">
                  Nenhum evento registrado no laboratório
                </p>
              ) : (
                logs.map((entry) => (
                  <div key={entry.id} className="log-entry group flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="log-timestamp">[{entry.timestamp}]</span>
                      <p className="text-foreground mt-0.5 break-words">{entry.message}</p>
                    </div>
                    <button
                      onClick={() => onDeleteLog(entry.id)}
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
