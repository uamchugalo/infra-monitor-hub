import { useState } from "react";
import { PC, PCStatus, HistoryEntry } from "@/types/pc";
import { formatTimestamp, generateId } from "@/utils/pcData";
import {
  X,
  Save,
  Plus,
  Clock,
  Trash2,
  Monitor,
  Power,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SWITCHES } from "@/utils/switchData";

interface EditPanelProps {
  pc: PC;
  onSave: (pc: PC) => void;
  onClose: () => void;
  onWake?: (mac: string, ip?: string) => void;
  onPing?: (ip: string) => Promise<boolean>;
  onShutdown?: (ip: string) => Promise<void>;
  onDelete?: (id: string | number) => void;
}

export function EditPanel({
  pc,
  onSave,
  onClose,
  onWake,
  onPing,
  onShutdown,
  onDelete,
}: EditPanelProps) {
  const [name, setName] = useState(pc.name);
  const [ip, setIp] = useState(pc.ip || "");
  const [mac, setMac] = useState(pc.mac);
  const [switchPort, setSwitchPort] = useState(pc.switchPort || "");
  const [switchId, setSwitchId] = useState(pc.switchId || "");
  const [status, setStatus] = useState<PCStatus>(pc.status);
  const [enabled, setEnabled] = useState(pc.enabled ?? true);
  const [newLog, setNewLog] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(pc.history);
  const [isPinging, setIsPinging] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  const handleSave = () => {
    onSave({
      ...pc,
      name,
      ip,
      mac,
      switchPort,
      switchId,
      status,
      enabled,
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

    const newHistory = [entry, ...history];
    setHistory(newHistory);
    // Persist immediately
    onSave({
      ...pc,
      name,
      ip,
      mac,
      switchPort,
      switchId,
      status,
      enabled,
      history: newHistory,
    });
    setNewLog("");
  };

  const handleDeleteLog = (id: string) => {
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    // Persist immediately
    onSave({
      ...pc,
      name,
      ip,
      mac,
      switchPort,
      switchId,
      status,
      enabled,
      history: newHistory,
    });
  };

  const handlePing = async () => {
    if (!onPing || !ip) return;
    setIsPinging(true);
    try {
      await onPing(ip);
    } finally {
      setIsPinging(false);
    }
  };

  const handleShutdown = async () => {
    if (!onShutdown || !ip) return;
    if (!confirm(`Tem certeza que deseja DESLIGAR o ${name}?`)) return;

    setIsShuttingDown(true);
    try {
      await onShutdown(ip);
    } finally {
      setIsShuttingDown(false);
    }
  };

  const statusOptions: { value: PCStatus; label: string; color: string }[] = [
    { value: "online", label: "Ativo", color: "bg-status-online" },
    { value: "warning", label: "Atenção", color: "bg-status-warning" },
    { value: "offline", label: "Offline", color: "bg-status-offline" },
  ];

  return (
    <div className="h-full flex flex-col bg-card animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              PC #{String(pc.id).padStart(2, "0")}
            </h2>
            <p className="text-xs text-muted-foreground">
              Editar configurações
            </p>
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
          {/* Monitoring Toggle */}
          <div
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
              enabled
                ? "bg-green-50/50 border-green-200"
                : "bg-orange-50/50 border-orange-200",
            )}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {enabled ? (
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                )}
                <Label className="text-sm font-semibold text-foreground">
                  Conectado / Ativo
                </Label>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {enabled
                  ? "Dispositivo visível no dashboard geral."
                  : "Dispositivo marcado como Desconectado."}
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

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

          {/* IP */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Endereço IP
            </Label>
            <Input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="font-mono"
              placeholder="192.168.1.100"
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

          {/* Switch Connection Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs font-medium text-foreground">
                Switch Conectado
              </Label>
              <select
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={switchId}
                onChange={(e) => setSwitchId(e.target.value)}
              >
                <option value="">Selecione um Switch...</option>
                {SWITCHES.map((sw) => (
                  <option key={sw.id} value={sw.id}>
                    {sw.name} ({sw.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs font-medium text-foreground">
                Porta
              </Label>
              <Input
                value={switchPort}
                onChange={(e) => setSwitchPort(e.target.value)}
                placeholder="Porta (Ex: 24)"
              />
            </div>
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
                  onClick={() => {
                    setStatus(opt.value);
                    onSave({
                      ...pc,
                      name,
                      ip,
                      mac,
                      switchPort,
                      switchId,
                      status: opt.value,
                      history,
                    });
                  }}
                  className={cn(
                    "py-2 px-3 rounded-md text-xs font-medium transition-all border",
                    status === opt.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", opt.color)} />
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
                <div className="divide-y divide-border">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="group p-3 hover:bg-muted transition-colors"
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
      <div className="p-4 border-t border-border space-y-2">
        {onDelete && (
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Tem certeza que deseja excluir este PC?")) {
                onDelete(pc.id);
              }
            }}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir PC
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          {onWake && (
            <Button
              variant="outline"
              onClick={() => onWake(mac, ip)}
              disabled={!mac}
              className="w-full"
            >
              <Monitor className="w-4 h-4 mr-2" />
              WoL
            </Button>
          )}
          {onPing && (
            <Button
              variant="outline"
              onClick={handlePing}
              disabled={!ip || isPinging}
              className="w-full"
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  isPinging ? "bg-yellow-500 animate-pulse" : "bg-green-500",
                )}
              />
              {isPinging ? "Ping..." : "Ping"}
            </Button>
          )}
        </div>

        {onShutdown && (
          <Button
            variant="destructive"
            onClick={handleShutdown}
            disabled={!ip || isShuttingDown}
            className="w-full"
          >
            <Power className="w-4 h-4 mr-2" />
            {isShuttingDown ? "Enviando..." : "Desligar Remotamente"}
          </Button>
        )}

        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
