import { useState } from 'react';
import { PC, PCStatus, HistoryEntry } from '@/types/pc';
import { formatTimestamp, generateId } from '@/utils/pcData';
import { X, Save, Plus, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface EditPanelProps {
  pc: PC;
  onSave: (pc: PC) => void;
  onClose: () => void;
}

export function EditPanel({ pc, onSave, onClose }: EditPanelProps) {
  const [name, setName] = useState(pc.name);
  const [mac, setMac] = useState(pc.mac);
  const [status, setStatus] = useState<PCStatus>(pc.status);
  const [newLog, setNewLog] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>(pc.history);

  const handleSave = () => {
    onSave({
      ...pc,
      name,
      mac,
      status,
      history,
    });
  };

  const handleAddLog = () => {
    if (!newLog.trim()) return;
    
    const entry: HistoryEntry = {
      id: generateId(),
      timestamp: formatTimestamp(),
      message: newLog.trim(),
    };
    
    setHistory([entry, ...history]);
    setNewLog('');
  };

  const handleDeleteLog = (id: string) => {
    setHistory(history.filter(h => h.id !== id));
  };

  const statusOptions: { value: PCStatus; label: string; class: string }[] = [
    { value: 'online', label: 'Ativo', class: 'bg-status-online' },
    { value: 'warning', label: 'Atenção', class: 'bg-status-warning' },
    { value: 'offline', label: 'Offline', class: 'bg-status-offline' },
  ];

  return (
    <div className="panel-section h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <span className="text-primary font-mono">#{String(pc.id).padStart(2, '0')}</span>
          Editar PC
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider">
              Nome / Patrimônio
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono bg-input border-border"
              placeholder="PC-001"
            />
          </div>

          {/* MAC */}
          <div className="space-y-2">
            <Label htmlFor="mac" className="text-muted-foreground text-xs uppercase tracking-wider">
              Endereço MAC
            </Label>
            <Input
              id="mac"
              value={mac}
              onChange={(e) => setMac(e.target.value.toUpperCase())}
              className="font-mono bg-input border-border"
              placeholder="AA:BB:CC:DD:EE:FF"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Status
            </Label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all border',
                    status === opt.value
                      ? 'border-primary bg-accent text-foreground'
                      : 'border-border bg-input text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', opt.class)} />
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Log */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Adicionar ao Histórico
            </Label>
            <Textarea
              value={newLog}
              onChange={(e) => setNewLog(e.target.value)}
              className="bg-input border-border resize-none text-sm"
              placeholder="Ex: Troca de mouse, atualização de driver..."
              rows={2}
            />
            <Button 
              onClick={handleAddLog} 
              disabled={!newLog.trim()}
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Registro
            </Button>
          </div>

          {/* History */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Histórico Individual ({history.length})
            </Label>
            <div className="bg-background/50 rounded-md border border-border max-h-48 overflow-y-auto scrollbar-thin">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center">
                  Nenhum registro
                </p>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="log-entry group flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="log-timestamp">[{entry.timestamp}]</span>
                      <p className="text-foreground mt-0.5 break-words">{entry.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(entry.id)}
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
