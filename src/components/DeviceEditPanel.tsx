import { useState, useEffect } from 'react';
import { X, Save, Activity, Trash2, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DeviceEditPanelProps {
    device: { id: string; name: string; ip: string; status?: 'online' | 'offline'; switchPort?: string; switchId?: string; enabled?: boolean };
    type: 'Camera' | 'AP';
    switches: any[]; // List of available switches
    onSave: (id: string, name: string, ip: string, switchPort?: string, switchId?: string, enabled?: boolean) => void;
    onClose: () => void;
    onPing: (ip: string) => Promise<boolean>;
    onDelete?: (id: string) => void;
}

export function DeviceEditPanel({ device, type, switches, onSave, onClose, onPing, onDelete }: DeviceEditPanelProps) {
    const [name, setName] = useState(device.name);
    const [ip, setIp] = useState(device.ip);
    const [switchPort, setSwitchPort] = useState(device.switchPort || '');
    const [switchId, setSwitchId] = useState(device.switchId || '');
    const [enabled, setEnabled] = useState(device.enabled ?? true);
    const [isPinging, setIsPinging] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    // Load History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/history/${type}/${device.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                }
            } catch (e) {
                console.error("Error fetching history:", e);
            }
        };
        fetchHistory();
    }, [device.id, type]);

    // Update local state when device prop changes
    useEffect(() => {
        setName(device.name);
        setIp(device.ip);
        setSwitchPort(device.switchPort || '');
        setSwitchId(device.switchId || '');
        setEnabled(device.enabled ?? true);
    }, [device]);

    const handleSave = () => {
        onSave(device.id, name, ip, switchPort, switchId, enabled);
        toast.success(`${type} salva com sucesso!`);
    };

    const handlePing = async () => {
        if (!ip) return;
        setIsPinging(true);
        try {
            const alive = await onPing(ip);
            if (alive) toast.success('Dispositivo Online!');
            else toast.error('Dispositivo Inacessível');
        } finally {
            setIsPinging(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-card animate-fade-in border-l border-border w-[360px]">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">
                            Editar {type}
                        </h2>
                        <p className="text-xs text-muted-foreground">{device.id}</p>
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
                    <div className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
                        enabled ? "bg-green-50/50 border-green-200" : "bg-orange-50/50 border-orange-200"
                    )}>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                {enabled ? <ShieldCheck className="w-4 h-4 text-green-600" /> : <ShieldAlert className="w-4 h-4 text-orange-600" />}
                                <Label className="text-sm font-semibold">Monitoramento Ativo</Label>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                {enabled ? 'Dispositivo será pingado regularmente.' : 'Dispositivo ignorado nas verificações.'}
                            </p>
                        </div>
                        <Switch
                            checked={enabled}
                            onCheckedChange={setEnabled}
                        />
                    </div>

                    {/* Nome */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-foreground">
                            Nome de Identificação
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`Ex: ${type} 01`}
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
                            placeholder="192.168.x.x"
                        />
                    </div>

                    {/* Switch Connection Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 col-span-2">
                            <Label className="text-xs font-medium text-foreground">Switch Conectado</Label>
                            <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={switchId}
                                onChange={(e) => setSwitchId(e.target.value)}
                            >
                                <option value="">Selecione um Switch...</option>
                                {switches.map(sw => (
                                    <option key={sw.id} value={sw.id}>{sw.name} ({sw.location})</option>
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

                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <h3 className="text-xs font-medium mb-2">Status Atual</h3>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-3 h-3 rounded-full",
                                !enabled ? "bg-zinc-400" : (device.status === 'online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500")
                            )} />
                            <span className="text-sm font-medium">
                                {!enabled ? 'Ignorado (Manutenção)' : (device.status === 'online' ? 'Online' : 'Offline')}
                            </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                            {enabled ? 'O status é verificado automaticamente a cada 3 minutos.' : 'O monitoramento para este dispositivo está pausado.'}
                        </p>
                    </div>

                    {/* Automated History Buffer */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-foreground flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                Histórico Automático (Buffer 10 Dias)
                            </Label>
                        </div>

                        <div className="rounded-md border border-border bg-background overflow-hidden">
                            <ScrollArea className="h-[200px]">
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground">
                                        <Clock className="w-8 h-8 opacity-20 mb-2" />
                                        <p className="text-[10px]">Aguardando primeiros registros...</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {history.map((h: any) => (
                                            <div key={h.id} className="p-2.5 hover:bg-muted/50 transition-colors flex items-start gap-3">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                                                    h.status === 'online' ? "bg-green-500" : "bg-red-500"
                                                )} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase",
                                                            h.status === 'online' ? "text-green-600" : "text-red-600"
                                                        )}>
                                                            {h.status === 'online' ? 'Online' : 'Inacessível'}
                                                        </span>
                                                        <span className="text-[9px] text-muted-foreground font-mono">
                                                            {new Date(h.timestamp).toLocaleString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border space-y-2">

                <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                </Button>

                <Button
                    variant="outline"
                    onClick={handlePing}
                    disabled={!ip || isPinging || !enabled}
                    className="w-full"
                >
                    <Activity className={cn("w-4 h-4 mr-2", isPinging && "animate-spin")} />
                    {isPinging ? 'Pingando...' : 'Testar Conexão (Ping)'}
                </Button>

                {onDelete && (
                    <Button
                        variant="destructive"
                        onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este dispositivo?')) {
                                onDelete(device.id);
                            }
                        }}
                        className="w-full"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir {type}
                    </Button>
                )}
            </div>
        </div>
    );
}
