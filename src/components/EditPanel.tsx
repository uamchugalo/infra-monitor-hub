import { useState } from 'react';
import { PC, PCStatus, HistoryEntry } from '@/types/pc';
import { formatTimestamp, generateId } from '@/utils/pcData';
import { X, Save, Plus, Clock, Trash2, Monitor } from 'lucide-react';
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

  const statusOptions: { value: PCStatus; label: string; color: string }[] = [
    { value: 'online', label: 'Ativo', color: 'bg-status-online' },
    { value: 'warning', label: 'Atenção', color: 'bg-status-warning' },
    { value: 'offline', label: 'Offline', color: 'bg-status-offline' },
  ];

  return (
    <div className="h-full flex flex-col bg-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              PC #{String(pc.id).padStart(2, '0')}
            </h2>
            <p className="text-xs text-muted-foreground">Editar configurações</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Nome / Patrimônio
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono"
              placeholder="PC-001"
            />
          </div>

          {/* MAC */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Endereço MAC
            </Label>
            <Input
              value={mac}
              onChange={(e) => setMac(e.target.value.toUpperCase())}
              className="font-mono"
              placeholder="AA:BB:CC:DD:EE:FF"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              Status
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    'py-2 px-3 rounded-md text-xs font-medium transition-all border',
                    status === opt.value
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', opt.color)} />
                    {opt.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Log */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              Novo Registro
            </Label>
            <Textarea
              value={newLog}
              onChange={(e) => setNewLog(e.target.value)}
              className="resize-none text-sm"
              placeholder="Ex: Troca de mouse..."
              rows={2}
            />
            <Button 
              onClick={handleAddLog} 
              disabled={!newLog.trim()}
              size="sm"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {/* History */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium text-foreground">
                Histórico ({history.length})
              </Label>
            </div>
            <div className="bg-muted/50 rounded-md border border-border overflow-hidden">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 text-center">
                  Nenhum registro
                </p>
              ) : (
                <div className="divide-y divide-border max-h-48 overflow-y-auto">
                  {history.map((entry) => (
                    <div key={entry.id} className="group p-3 hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-mono text-primary">
                            {entry.timestamp}
                          </span>
                          <p className="text-xs text-foreground mt-0.5">{entry.message}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteLog(entry.id)}
                          className="opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive transition-all p-1"
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
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
