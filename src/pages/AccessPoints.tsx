import { useState, useEffect } from 'react';
import { ACCESS_POINTS, AccessPoint } from '@/utils/apData';
import { Server, Video, Activity, Wifi, WifiOff, Router, MapPin, Trash2, Plus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ReportsModal } from '@/components/ReportsModal';
import { DeviceEditPanel } from '@/components/DeviceEditPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// DnD Imports
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

// Componente Draggable AP Card
const DraggableAPCard = ({ ap, status, pinging, isSelected, onClick, onPing, switches }: { ap: AccessPoint & { enabled?: boolean }, status: any, pinging: any, isSelected: boolean, onClick: (e: React.MouseEvent) => void, onPing: (e: any) => void, switches: any[] }) => {
    const swName = switches.find(s => s.id === ap.switchId)?.name;
    const isEnabled = ap.enabled !== false;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: ap.id,
        data: { ap }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 999 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`group relative overflow-hidden rounded-md border hover:shadow-md transition-all duration-200 p-3 cursor-grab active:cursor-grabbing ${isSelected ? 'border-primary ring-2 ring-primary bg-primary/5' :
                !isEnabled ? 'border-zinc-200 bg-zinc-50 opacity-70' :
                    status === 'online' ? 'border-green-500/30 bg-card' :
                        status === 'offline' ? 'border-red-500/30 bg-card' : 'border-border bg-card'
                }`}
        >
            {/* Status */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${!isEnabled ? 'bg-zinc-400' :
                    status === 'online' ? 'bg-green-500 animate-pulse' :
                        status === 'offline' ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
            </div>

            {/* Icon */}
            <div className="flex items-center gap-2 mb-2">
                <Router className={`w-4 h-4 ${!isEnabled ? 'text-zinc-400' : (status === 'online' ? 'text-green-600' : (status === 'offline' ? 'text-red-500' : 'text-muted-foreground'))}`} />
                <span className="text-xs font-semibold text-muted-foreground">{ap.id}</span>
            </div>

            {/* Info */}
            <div className="space-y-0.5 mb-3">
                <h3 className="text-sm font-medium text-foreground truncate" title={ap.name}>{ap.name}</h3>
                <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{ap.ip}</p>
                    {ap.switchPort && (
                        <span className="text-[9px] text-primary bg-primary/10 px-1 rounded flex items-center gap-1">
                            {swName && <span className="opacity-70 font-bold border-r border-primary/20 pr-1">{swName}</span>}
                            P:{ap.switchPort}
                        </span>
                    )}
                </div>
            </div>

            {/* Action */}
            <Button
                className="w-full h-7 text-xs"
                variant={status === 'online' ? "outline" : "secondary"}
                size="sm"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
                onClick={onPing}
                disabled={pinging || !isEnabled}
            >
                {pinging ? <Activity className="w-3 h-3 mr-1 animate-spin" /> :
                    !isEnabled ? <ShieldAlert className="w-3 h-3 mr-1" /> :
                        status === 'online' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {pinging ? '...' : (!isEnabled ? 'Ignorado' : 'Ping')}
            </Button>
        </div>
    );
};

// Componente Droppable Location Group
const LocationGroup = ({ id, title, aps, status, pinging, selectedIds, onSelect, onPing, switches }: { id: string, title: string, aps: (AccessPoint & { enabled?: boolean })[], status: any, pinging: any, selectedIds: string[], onSelect: (c: AccessPoint, e: React.MouseEvent) => void, onPing: (c: AccessPoint) => void, switches: any[] }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`p-4 rounded-lg border transition-colors ${isOver ? 'bg-primary/5 border-primary/50' : 'bg-card/50 border-border/50'}`}>
            <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">{title}</h2>
                <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">{aps.length}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 min-h-[80px]">
                {aps.map(ap => (
                    <DraggableAPCard
                        key={ap.id}
                        ap={ap}
                        status={status ? status[ap.id] : null}
                        pinging={pinging ? pinging[ap.id] : false}
                        isSelected={selectedIds.includes(ap.id)}
                        onClick={(e) => onSelect(ap, e)}
                        onPing={(e) => { e.stopPropagation(); onPing(ap); }}
                        switches={switches}
                    />
                ))}
                {aps.length === 0 && (
                    <div className="col-span-full h-20 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                        <span className="text-xs text-muted-foreground">Arraste APs para cá</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const LOCATIONS = ["Térreo", "1° Andar", "Gabinetes", "2° Andar", "3° Andar", "4° Andar"];

const AccessPoints = () => {
    const navigate = useNavigate();
    const [aps, setAps] = useState<(AccessPoint & { enabled?: boolean })[]>([]);
    const [pinging, setPinging] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<Record<string, 'online' | 'offline' | null>>({});
    const [selectedDevice, setSelectedDevice] = useState<(AccessPoint & { enabled?: boolean }) | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newAP, setNewAP] = useState({ name: '', ip: '', location: 'Térreo' });
    const [switches, setSwitches] = useState<any[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        })
    );

    useEffect(() => {
        const load = async () => {
            try {
                const r = await fetch('/api/aps');
                if (r.ok) {
                    const d = await r.json();
                    if (Array.isArray(d)) setAps(d);
                }
                const swRes = await fetch('/api/switches');
                if (swRes.ok) setSwitches(await swRes.json());
            } catch (e) { console.error(e); }
        };
        load();
    }, []);

    // Polling Status Logic (Simplificada para evitar erros)
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/last-status');
                if (res.ok) {
                    const statusMap = await res.json();
                    const newStatus: Record<string, 'online' | 'offline'> = {};
                    aps.forEach(a => {
                        if (a && statusMap[a.ip]) newStatus[a.id] = statusMap[a.ip];
                    });
                    if (Object.keys(newStatus).length > 0) setStatus(prev => ({ ...prev, ...newStatus }));
                }
            } catch (e) { }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // 30s check for UI
        return () => clearInterval(interval);
    }, [aps]);

    const handlePing = async (ap: AccessPoint) => {
        setPinging(prev => ({ ...prev, [ap.id]: true }));
        try {
            const response = await fetch('/api/ping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip: ap.ip }),
            });
            const data = await response.json();
            const isAlive = response.ok && data.alive;
            setStatus(prev => ({ ...prev, [ap.id]: isAlive ? 'online' : 'offline' }));
            if (isAlive) toast.success(`${ap.name}: Online`);
            else toast.error(`${ap.name}: Inacessível`);
            return isAlive;
        } catch (error) {
            setStatus(prev => ({ ...prev, [ap.id]: 'offline' }));
            return false;
        } finally {
            setPinging(prev => ({ ...prev, [ap.id]: false }));
        }
    };

    const handlePingAll = () => {
        aps.filter(a => a.enabled !== false).forEach(handlePing);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const apId = active.id as string;
            const newLocation = over.id as string;

            if (LOCATIONS.includes(newLocation) || newLocation === "Outros") {
                const updatedAps = aps.map(a =>
                    a.id === apId ? { ...a, location: newLocation } : a
                );
                setAps(updatedAps);

                fetch('/api/sync-aps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ aps: updatedAps }),
                }).catch(console.error);

                toast.success(`AP movido para ${newLocation}`);
            }
        }
    };

    const handleSaveAP = (id: string, name: string, ip: string, switchPort?: string, switchId?: string, enabled?: boolean) => {
        const updatedAps = aps.map(a => a.id === id ? { ...a, name, ip, switchPort, switchId, enabled } : a);
        setAps(updatedAps);
        setSelectedDevice(prev => prev && prev.id === id ? { ...prev, name, ip, switchPort, switchId, enabled } : prev);

        fetch('/api/sync-aps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aps: updatedAps }),
        }).then(() => toast.success('Alterações salvas')).catch(console.error);
    };

    const handleDeleteAP = async (id: string) => {
        const newAps = aps.filter(a => a.id !== id);
        setAps(newAps);
        try {
            await fetch('/api/sync-aps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aps: newAps }),
            });
            toast.success('Access Point removido com sucesso');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao remover AP');
        }
        setSelectedDevice(null);
    };

    const handleDeviceSelect = (ap: AccessPoint, e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            setSelectedIds(prev => {
                if (prev.includes(ap.id)) {
                    return prev.filter(id => id !== ap.id);
                } else {
                    return [...prev, ap.id];
                }
            });
            setSelectedDevice(null);
        } else {
            setSelectedIds([ap.id]);
            setSelectedDevice(ap);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Excluir ${selectedIds.length} itens selecionados?`)) return;

        const newAps = aps.filter(ap => !selectedIds.includes(ap.id));
        setAps(newAps);
        setSelectedIds([]);
        setSelectedDevice(null);

        try {
            await fetch('/api/sync-aps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aps: newAps }),
            });
            toast.success('Itens excluídos com sucesso');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir itens');
        }
    };

    const handleCreateAP = async () => {
        if (!newAP.name || !newAP.ip) return toast.error("Preencha nome e IP");
        const id = `AP-${Date.now().toString().slice(-6)}`;
        const created: AccessPoint = { ...newAP, id };
        const updated = [...aps, created];
        setAps(updated);
        setIsCreating(false);
        setNewAP({ name: '', ip: '', location: 'Térreo' });

        try {
            await fetch('/api/sync-aps', { method: 'POST', body: JSON.stringify({ aps: updated }), headers: { 'Content-Type': 'application/json' } });
            toast.success("AP Criado!");
        } catch (e) { toast.error("Erro ao salvar criação"); }
    };

    const apsByLocation = LOCATIONS.reduce((acc, loc) => {
        acc[loc] = aps.filter(ap => ap.location === loc);
        return acc;
    }, {} as Record<string, AccessPoint[]>);

    const unmapped = aps.filter(ap => !LOCATIONS.includes(ap.location));
    if (unmapped.length > 0) apsByLocation["Outros"] = unmapped;

    const displayLocations = unmapped.length > 0 ? [...LOCATIONS, "Outros"] : LOCATIONS;

    return (
        <div className="h-screen overflow-hidden bg-background flex flex-col">
            <header className="border-b border-border bg-card shadow-sm sticky top-0 z-20 shrink-0">
                <div className="px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-md"><Router className="w-5 h-5 text-primary-foreground" /></div>
                            <div>
                                <h1 className="text-base font-bold text-foreground">Access Points</h1>
                                <p className="text-xs text-muted-foreground">{aps.length} dispositivos</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex bg-muted/50 p-1 rounded-lg">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/')}><Server className="w-4 h-4 mr-2" />Início</Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/labs')}><Server className="w-4 h-4 mr-2" />Labs</Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/cameras')}><Video className="w-4 h-4 mr-2" />Câmeras</Button>
                            <Button variant="secondary" size="sm"><Router className="w-4 h-4 mr-2" />APs</Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/technical-rooms')}><Server className="w-4 h-4 mr-2" />Switches</Button>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => setIsCreating(true)} size="sm" className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" /> Novo AP
                        </Button>
                        <ReportsModal />
                        {selectedIds.length > 0 && (
                            <Button onClick={handleDeleteSelected} variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir ({selectedIds.length})
                            </Button>
                        )}
                        <Button onClick={handlePingAll} variant="outline" size="sm"><Activity className="w-4 h-4 mr-2" />Verificar Todos</Button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <main className="flex-1 overflow-auto p-5 space-y-6">
                        {displayLocations.map(loc => (
                            <LocationGroup
                                key={loc}
                                id={loc}
                                title={loc}
                                aps={apsByLocation[loc] || []}
                                status={status}
                                pinging={pinging}
                                selectedIds={selectedIds}
                                onSelect={handleDeviceSelect}
                                onPing={handlePing}
                                switches={switches}
                            />
                        ))}
                    </main>
                    <DragOverlay>
                        {activeId ? (
                            <div className="opacity-80 rotate-3 cursor-grabbing w-[200px]">
                                <Button variant="secondary" className="w-full justify-start"><Router className="w-4 h-4 mr-2" />Movendo AP...</Button>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {selectedDevice && (
                    <aside className="w-[360px] border-l border-border bg-card shadow-sm h-full overflow-hidden z-30">
                        <DeviceEditPanel
                            device={{ ...selectedDevice, status: status[selectedDevice.id] === 'online' ? 'online' : 'offline' }}
                            type="AP"
                            switches={switches}
                            onSave={handleSaveAP}
                            onClose={() => setSelectedDevice(null)}
                            onPing={(ip) => handlePing({ ...selectedDevice, ip } as AccessPoint)}
                            onDelete={handleDeleteAP}
                        />
                    </aside>
                )}
            </div>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Access Point</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={newAP.name} onChange={e => setNewAP({ ...newAP, name: e.target.value })} placeholder="Ex: AP - T01" />
                        </div>
                        <div className="space-y-2">
                            <Label>IP</Label>
                            <Input value={newAP.ip} onChange={e => setNewAP({ ...newAP, ip: e.target.value })} placeholder="10.70.x.x" />
                        </div>
                        <div className="space-y-2">
                            <Label>Localização</Label>
                            <select
                                className="w-full h-10 px-3 rounded-md border bg-background"
                                value={newAP.location}
                                onChange={e => setNewAP({ ...newAP, location: e.target.value })}
                            >
                                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateAP}>Criar AP</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AccessPoints;
