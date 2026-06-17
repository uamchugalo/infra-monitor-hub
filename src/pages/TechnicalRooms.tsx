import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Server, ArrowLeft, Settings, Activity, Plus, Trash2, Edit2, GripVertical, Laptop, Printer, Wifi, Network, Camera as CameraIcon, ShieldCheck, ShieldAlert, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { SWITCHES, NetworkSwitch } from '@/utils/switchData';

// Types and Components
import { PC } from '@/types/pc';
import { Camera, CAMERAS } from '@/utils/cameraData';
import { AccessPoint, ACCESS_POINTS } from '@/utils/apData';

import { DeviceEditPanel } from '@/components/DeviceEditPanel';
import { EditPanel } from '@/components/EditPanel';

// Patch Panel Type Definition
type PatchPanelPort = {
    port: number;
    description: string; // "What is connected here"
};

type PatchPanel = {
    id: string;
    name: string;
    totalPorts: number;
    location: string;
    ports: PatchPanelPort[];
    order?: number;
};

// Switch Port Data Logic
type SwitchPortData = {
    port: number;
    name: string;
    type: 'PC' | 'Printer' | 'AP' | 'Camera' | 'Server' | 'Uplink' | 'Other';
    deviceId?: string;
    deviceIp?: string;
};

type ExtendedSwitch = NetworkSwitch & {
    order?: number;
    ports?: SwitchPortData[];
};

// COMPONENTE DE PORTA DE SWITCH (ATIVO) - Agora com status real!
const SwitchPort = ({ portNum, sw, onPortClick, statuses }: { portNum: number, sw: ExtendedSwitch, onPortClick: (port: number) => void, statuses: Record<string, string> }) => {
    const portData = sw.ports?.find(p => p.port === portNum);
    const isConnected = !!portData;

    // Visualização baseada no tipo de conexão e STATUS REAL
    let statusColor = "bg-[#1a1b1e] border-[#2c2e33]"; // Default/Empty Look
    let statusDotColor = "bg-gray-500"; // Default dot

    if (isConnected) {
        // Default color for PC/Other
        statusColor = "bg-emerald-900/40 border-emerald-500/50";
        statusDotColor = "bg-emerald-500"; // Generic green dot

        // Override colors by type based on Legend
        if (portData.type === 'Uplink') {
            statusColor = "bg-violet-900/40 border-violet-500";
            statusDotColor = "bg-violet-400";
        }
        else if (portData.type === 'AP') {
            statusColor = "bg-blue-900/40 border-blue-500";
            statusDotColor = "bg-blue-400";
        }
        else if (portData.type === 'Camera') {
            statusColor = "bg-amber-900/40 border-amber-500";
            statusDotColor = "bg-amber-500";
        }
        else if (portData.type === 'Printer' || portData.type === 'PC' || portData.type === 'Other') {
            statusColor = "bg-emerald-900/40 border-emerald-500";
            statusDotColor = "bg-emerald-500";
        }

        // REAL-TIME STATUS CHECK (Online/Offline dots)
        if (portData.deviceIp && statuses[portData.deviceIp]) {
            const status = statuses[portData.deviceIp];
            if (status === 'offline') {
                statusDotColor = "bg-red-500 animate-pulse";
            } else if (status === 'online') {
                statusDotColor = "bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.6)]";
            }
        }
    }

    return (
        <div onClick={() => onPortClick(portNum)} className="group relative flex flex-col items-center cursor-pointer">
            {/* Tooltip on hover */}
            {isConnected && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none transition-opacity shadow-lg border border-zinc-800">
                    <div className="font-bold mb-0.5">{portData.name}</div>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[9px] uppercase">
                        {portData.type}
                        {portData.deviceIp && statuses[portData.deviceIp] === 'online' && <span className="text-green-400 font-bold">• ONLINE</span>}
                        {portData.deviceIp && statuses[portData.deviceIp] === 'offline' && <span className="text-red-500 font-bold">• OFFLINE</span>}
                        {portData.deviceIp && !statuses[portData.deviceIp] && <span className="text-yellow-500">• {portData.deviceIp}</span>}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45 border-r border-b border-zinc-800" />
                </div>
            )}

            <div
                className={`w-9 h-9 ${statusColor} border rounded-[3px] flex items-center justify-center relative transition-colors hover:bg-zinc-800`}
            >
                <span className={`text-[10px] font-mono font-bold ${isConnected ? 'text-white' : 'text-gray-600'}`}>{portNum}</span>
                {isConnected && <div className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${statusDotColor}`} />}
            </div>
        </div>
    );
};

// COMPONENTE DE PORTA DE PATCH PANEL (PASSIVO)
const PatchPanelPort = ({ portNum, pp, onClick }: { portNum: number, pp: PatchPanel, onClick: (port: number) => void }) => {
    const portData = pp.ports.find(p => p.port === portNum);
    const hasConnection = !!portData?.description;

    return (
        <div
            onClick={() => onClick(portNum)}
            className="group relative flex flex-col items-center cursor-pointer"
        >
            {/* Tooltip on hover */}
            {hasConnection && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                    {portData.description}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45" />
                </div>
            )}

            <div
                className={`w-9 h-9 border rounded-[2px] flex items-center justify-center relative transition-colors ${hasConnection ? 'bg-blue-900/20 border-blue-500/50' : 'bg-[#e4e4e7] border-[#d4d4d8]'}`}
            >
                <span className={`text-[10px] font-mono font-bold ${hasConnection ? 'text-blue-400' : 'text-gray-400'}`}>{portNum}</span>
            </div>
        </div>
    );
};

// COMPONENTE SORTABLE (WRAPPER)
function SortableRackItem({ id, children }: { id: string, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group/item">
            {/* Drag Handle - Apenas aparece no hover ou se estiver arrastando */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-0 top-0 bottom-0 w-8 z-10 cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-l-lg"
                title="Arrastar para reordenar"
            >
                <GripVertical className="w-5 h-5 text-gray-500" />
            </div>
            {children}
        </div>
    );
}

// Sortable Item for Location Management
const SortableLocationRow = ({ loc, onDelete, onRename }: { loc: string, onDelete: () => void, onRename: (newVal: string) => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: loc });

    const [isEditing, setIsEditing] = useState(false);
    const [editVal, setEditVal] = useState(loc);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSave = () => {
        if (editVal.trim() && editVal !== loc) {
            onRename(editVal.trim());
        }
        setIsEditing(false);
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-2 border rounded-md bg-card mb-2 gap-2">
            <div className="flex items-center gap-2 flex-1">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-foreground text-muted-foreground flex items-center">
                    <GripVertical className="h-4 w-4" />
                </div>

                {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                        <Input
                            value={editVal}
                            onChange={(e) => setEditVal(e.target.value)}
                            className="h-8 text-sm py-1"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                            autoFocus
                        />
                    </div>
                ) : (
                    <span className="font-medium truncate">{loc}</span>
                )}
            </div>

            <div className='flex items-center gap-1 shrink-0'>
                {isEditing ? (
                    <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-100/10">
                        <Edit2 className="w-4 h-4" /> {/* Actually Check icon fits better, but let's reuse or import later. Using Edit2 as 'Save' contextually or just close edit */}
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => { setIsEditing(true); setEditVal(loc); }}
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={onDelete}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default function TechnicalRooms() {
    const navigate = useNavigate();

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // State
    const [switches, setSwitches] = useState<ExtendedSwitch[]>(SWITCHES);
    const [patchPanels, setPatchPanels] = useState<PatchPanel[]>([]);
    const [statuses, setStatuses] = useState<Record<string, string>>({});

    // Loaded Devices Data
    const [pcs, setPcs] = useState<PC[]>([]);
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [aps, setAps] = useState<AccessPoint[]>([]);

    // Editing State
    const [editingDevice, setEditingDevice] = useState<{ type: 'PC' | 'Camera' | 'AP' | 'Switch' | 'PatchPanel', data: any } | null>(null);
    const [editingPort, setEditingPort] = useState<{ ppId: string, port: number, description: string } | null>(null);
    const [editingSwitchPort, setEditingSwitchPort] = useState<{ swId: string, port: number, name: string, type: string, deviceId?: string, deviceIp?: string } | null>(null);

    const [isCreatingPP, setIsCreatingPP] = useState<string | null>(null); // Location string if creating
    const [isCreatingSwitch, setIsCreatingSwitch] = useState<string | null>(null); // Location string if creating Switch

    // New Patch Panel / Switch Form State
    const [newPP, setNewPP] = useState({ name: 'Patch Panel A', ports: 24 });
    const [newSwitch, setNewSwitch] = useState({ name: 'Switch Novo', ip: '10.70.0.X', ports: 24 });

    // Handle Drag End
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const allItems = [...switches.map(s => ({ ...s, type: 'switch' })), ...patchPanels.map(p => ({ ...p, type: 'patch_panel' }))];
        const activeItem = allItems.find(i => i.id === active.id);
        const overItem = allItems.find(i => i.id === over.id);

        if (!activeItem || !overItem) return;

        const oldLocation = activeItem.location;
        const newLocation = overItem.location;

        if (oldLocation === newLocation) {
            // Same Location Reorder
            if (active.id !== over.id) {
                const locationItems = allItems.filter(i => i.location === oldLocation).sort((a, b) => (a.order || 0) - (b.order || 0));
                const oldIndex = locationItems.findIndex(i => i.id === active.id);
                const newIndex = locationItems.findIndex(i => i.id === over.id);

                const newOrderLocationItems = arrayMove(locationItems, oldIndex, newIndex);

                updateOrders(newOrderLocationItems, switches, patchPanels);
            }
        } else {
            // Cross Location Move
            toast.success(`Movendo para ${newLocation}`);

            // 1. Get items in target location
            const targetItems = allItems.filter(i => i.location === newLocation).sort((a, b) => (a.order || 0) - (b.order || 0));

            // 2. Find insertion index (where use dropped it)
            const overIndex = targetItems.findIndex(i => i.id === over.id);

            // 3. Create new list for target location with inserted item
            // We insert 'activeItem' (mutated location) into targetItems at overIndex
            const movedItem = { ...activeItem, location: newLocation };

            // Remove from old list? No, we just reconstruct state.
            // Actually, simply splicing into target array:
            const newTargetList = [...targetItems];
            newTargetList.splice(overIndex, 0, movedItem);

            // 4. Update Orders for Target List
            // We need to trigger a global update. 
            // Better strategy: Update the objects' location and order in the main arrays.

            // Let's modify the 'switches' and 'patchPanels' arrays directly using logic
            let finalSwitches = [...switches];
            let finalPPs = [...patchPanels];

            // A. Remove activeItem from its old place (symbolically, by filtering or just updating props)
            // B. Add to new place.

            // Simplest way: 
            // 1. Update activeItem's location to newLocation.
            // 2. Assign it a temp 'order' matching the drop target?
            // Actually, we must re-calculate order for the entire target group.

            // Let's use the 'newTargetList' we built to assign orders.
            const updatesMap = new Map(); // id -> { location, order }
            newTargetList.forEach((item, idx) => {
                updatesMap.set(item.id, { location: newLocation, order: idx });
            });

            // Apply updates
            finalSwitches = finalSwitches.map(s => {
                if (s.id === active.id) return { ...s, location: newLocation }; // Update location primarily
                if (updatesMap.has(s.id)) return { ...s, location: newLocation, order: updatesMap.get(s.id).order };
                return s;
            });

            finalPPs = finalPPs.map(p => {
                if (p.id === active.id) return { ...p, location: newLocation };
                if (updatesMap.has(p.id)) return { ...p, location: newLocation, order: updatesMap.get(p.id).order };
                return p;
            });

            // Also need to re-index the OLD location to close gaps? Not strictly necessary for display, but good practice.
            // Skipping old location re-index for now for simplicity, focus on target.

            setSwitches(finalSwitches);
            setPatchPanels(finalPPs);
            persistChanges(finalSwitches, finalPPs);
        }
    };

    const updateOrders = (sortedItems: any[], currentSwitches: any[], currentPPs: any[]) => {
        const updatedSwitches = [...currentSwitches];
        const updatedPPs = [...currentPPs];

        sortedItems.forEach((item, index) => {
            if (item.type === 'switch') {
                const swIndex = updatedSwitches.findIndex(s => s.id === item.id);
                if (swIndex >= 0) updatedSwitches[swIndex].order = index;
            } else {
                const ppIndex = updatedPPs.findIndex(p => p.id === item.id);
                if (ppIndex >= 0) updatedPPs[ppIndex].order = index;
            }
        });

        setSwitches(updatedSwitches);
        setPatchPanels(updatedPPs);
        persistChanges(updatedSwitches, updatedPPs);
    };

    const persistChanges = (sws: any[], pps: any[]) => {
        fetch('/api/sync-switches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ switches: sws })
        });
        fetch('/api/sync-patch-panels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patchPanels: pps })
        });
    };


    const handlePing = async (ip: string) => {
        const toastId = toast.loading(`Pingando ${ip}...`);
        try {
            const res = await fetch('/api/ping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip })
            });
            const data = await res.json();
            if (data.alive) {
                toast.success(`Ping ${ip}: OK (${data.time}ms)`, { id: toastId });
                setStatuses(prev => ({ ...prev, [ip]: 'online' }));
                if (editingDevice && editingDevice.data.ip === ip) {
                    setEditingDevice(prev => prev ? { ...prev, data: { ...prev.data, status: 'online' } } : null);
                }
                return true;
            } else {
                toast.error(`Ping ${ip}: FALHA`, { id: toastId });
                setStatuses(prev => ({ ...prev, [ip]: 'offline' }));
                return false;
            }
        } catch (error) {
            toast.error(`Erro ao pingar ${ip}`, { id: toastId });
            return false;
        }
    };

    const handleSaveSwitch = async (updatedSw: ExtendedSwitch) => {
        const newSwitches = switches.map(s => s.id === updatedSw.id ? updatedSw : s);
        setSwitches(newSwitches);
        try {
            await fetch('/api/sync-switches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ switches: newSwitches }) });
            toast.success('Switch atualizado!');
        } catch (error) {
            toast.error('Erro ao salvar');
        }
        setEditingDevice(null);
    };

    const handleSaveSwitchPort = async () => {
        if (!editingSwitchPort) return;
        const targetSw = switches.find(s => s.id === editingSwitchPort.swId);
        if (!targetSw) return;

        const currentPorts = targetSw.ports || [];
        const newPorts = currentPorts.filter(p => p.port !== editingSwitchPort.port);

        if (editingSwitchPort.name.trim()) {
            newPorts.push({
                port: editingSwitchPort.port,
                name: editingSwitchPort.name,
                type: editingSwitchPort.type as any,
                deviceId: editingSwitchPort.deviceId,
                deviceIp: editingSwitchPort.deviceIp
            });
        }

        // 0. Identify old device on this port to clear its reference
        const oldPortData = targetSw.ports?.find(p => p.port === editingSwitchPort.port);
        if (oldPortData && oldPortData.deviceId && String(oldPortData.deviceId) !== String(editingSwitchPort.deviceId)) {
            const oldId = String(oldPortData.deviceId);
            if (oldPortData.type === 'Camera') {
                const updated = cameras.map(c => String(c.id) === oldId ? { ...c, switchId: null, switchPort: null } : c);
                setCameras(updated);
                fetch('/api/sync-cameras', { method: 'POST', body: JSON.stringify({ cameras: updated }), headers: { 'Content-Type': 'application/json' } }).catch(console.error);
            } else if (oldPortData.type === 'AP') {
                const updated = aps.map(a => String(a.id) === oldId ? { ...a, switchId: null, switchPort: null } : a);
                setAps(updated);
                fetch('/api/sync-aps', { method: 'POST', body: JSON.stringify({ aps: updated }), headers: { 'Content-Type': 'application/json' } }).catch(console.error);
            } else if (oldPortData.type === 'PC') {
                const updated = pcs.map(p => String(p.id) === oldId ? { ...p, switchId: null, switchPort: null } : p);
                setPcs(updated);
                fetch('/api/sync-pcs', { method: 'POST', body: JSON.stringify({ pcs: updated }), headers: { 'Content-Type': 'application/json' } }).catch(console.error);
            }
        }

        const updatedSw = { ...targetSw, ports: newPorts };

        // 1. Save Switch
        await handleSaveSwitch(updatedSw);

        // 2. Sync with Connected Device (Reverse Update)
        if (editingSwitchPort.deviceId) {
            const devId = String(editingSwitchPort.deviceId);
            const type = editingSwitchPort.type;

            if (type === 'AP') {
                const updatedAps = aps.map(a => String(a.id) === devId ? { ...a, switchId: targetSw.id, switchPort: String(editingSwitchPort.port) } : a);
                setAps(updatedAps); // Update UI
                await fetch('/api/sync-aps', { method: 'POST', body: JSON.stringify({ aps: updatedAps }), headers: { 'Content-Type': 'application/json' } });
            } else if (type === 'Camera') {
                const updatedCams = cameras.map(c => String(c.id) === devId ? { ...c, switchId: targetSw.id, switchPort: String(editingSwitchPort.port) } : c);
                setCameras(updatedCams); // Update UI
                await fetch('/api/sync-cameras', { method: 'POST', body: JSON.stringify({ cameras: updatedCams }), headers: { 'Content-Type': 'application/json' } });
            } else if (type === 'PC') {
                const updatedPCs = pcs.map(p => String(p.id) === devId ? { ...p, switchId: targetSw.id, switchPort: String(editingSwitchPort.port) } : p);
                setPcs(updatedPCs); // Update UI
                await fetch('/api/sync-pcs', { method: 'POST', body: JSON.stringify({ pcs: updatedPCs }), headers: { 'Content-Type': 'application/json' } });
            }
        }

        setTimeout(() => setEditingSwitchPort(null), 500);
    };

    const handleDeleteSwitch = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este Switch? Isso removerá os vínculos dos dispositivos conectados.")) return;

        // 1. Clean connected devices
        const updatedAps = aps.map(a => a.switchId === id ? { ...a, switchId: null, switchPort: null } : a);
        const updatedCams = cameras.map(c => c.switchId === id ? { ...c, switchId: null, switchPort: null } : c);
        const updatedPcs = pcs.map(p => p.switchId === id ? { ...p, switchId: null, switchPort: null } : p);

        // Sync Cleanups
        if (JSON.stringify(updatedAps) !== JSON.stringify(aps)) {
            setAps(updatedAps);
            await fetch('/api/sync-aps', { method: 'POST', body: JSON.stringify({ aps: updatedAps }), headers: { 'Content-Type': 'application/json' } });
        }
        if (JSON.stringify(updatedCams) !== JSON.stringify(cameras)) {
            setCameras(updatedCams);
            await fetch('/api/sync-cameras', { method: 'POST', body: JSON.stringify({ cameras: updatedCams }), headers: { 'Content-Type': 'application/json' } });
        }
        if (JSON.stringify(updatedPcs) !== JSON.stringify(pcs)) {
            setPcs(updatedPcs);
            await fetch('/api/sync-pcs', { method: 'POST', body: JSON.stringify({ pcs: updatedPcs }), headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Delete Switch
        const newSwitches = switches.filter(s => s.id !== id);
        setSwitches(newSwitches);
        await fetch('/api/sync-switches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ switches: newSwitches }) })

        toast.success('Switch excluído e processado!');
        setEditingDevice(null);
    };

    const handleSavePatchPanel = (updatedPP: PatchPanel) => {
        const newPPs = patchPanels.map(p => p.id === updatedPP.id ? updatedPP : p);
        setPatchPanels(newPPs);
        syncPatchPanels(newPPs);
        setEditingDevice(null);
    };

    const handleDeletePatchPanel = (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este Patch Panel?")) return;
        const newPPs = patchPanels.filter(p => p.id !== id);
        setPatchPanels(newPPs);
        syncPatchPanels(newPPs);
        setEditingDevice(null);
    };

    const handleCreatePatchPanel = () => {
        if (!isCreatingPP) return;
        const id = `PP-${Date.now().toString().slice(-4)}`;
        const newPanel: PatchPanel = {
            id,
            name: newPP.name,
            totalPorts: newPP.ports,
            location: isCreatingPP,
            ports: [],
            order: 9999
        };
        const newPPs = [...patchPanels, newPanel];
        setPatchPanels(newPPs);
        syncPatchPanels(newPPs);
        setIsCreatingPP(null);
        setNewPP({ name: 'Patch Panel A', ports: 24 });
        toast.success("Patch Panel criado!");
    };

    const handleCreateSwitch = () => {
        if (!isCreatingSwitch) return;
        const id = `SW-${Date.now().toString().slice(-4)}`;
        const newSw: ExtendedSwitch = {
            id,
            name: newSwitch.name,
            ip: newSwitch.ip,
            location: isCreatingSwitch,
            totalPorts: newSwitch.ports,
            ports: [], // Empty initially
            order: 9999
        };
        const newSwitchesList = [...switches, newSw];
        setSwitches(newSwitchesList);

        // Sync
        fetch('/api/sync-switches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ switches: newSwitchesList }) })
            .then(() => toast.success('Switch criado!'))
            .catch(() => toast.error('Erro ao salvar'));

        setIsCreatingSwitch(null);
        setNewSwitch({ name: 'Switch Novo', ip: '10.70.0.X', ports: 24 });
    };

    const handleSavePortDescription = () => {
        if (!editingPort) return;
        const targetPP = patchPanels.find(p => p.id === editingPort.ppId);
        if (!targetPP) return;

        const newPorts = targetPP.ports.filter(p => p.port !== editingPort.port);
        if (editingPort.description.trim()) {
            newPorts.push({ port: editingPort.port, description: editingPort.description });
        }

        const updatedPP = { ...targetPP, ports: newPorts };
        handleSavePatchPanel(updatedPP);
        setEditingPort(null);
    };

    const syncPatchPanels = (pps: PatchPanel[]) => {
        fetch('/api/sync-patch-panels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patchPanels: pps })
        }).catch(e => console.error("Sync error:", e));
    };

    // Load data
    useEffect(() => {
        const loadAll = async () => {
            const swRes = await fetch('/api/switches').catch(() => ({ ok: false, json: () => [] }));
            const ppRes = await fetch('/api/patch-panels').catch(() => ({ ok: false, json: () => [] }));

            // Load Devices
            const pcRes = await fetch('/api/pcs').catch(() => ({ ok: false, json: () => [] }));
            const camRes = await fetch('/api/cameras').catch(() => ({ ok: false, json: () => [] }));
            const apRes = await fetch('/api/aps').catch(() => ({ ok: false, json: () => [] }));

            const statusRes = await fetch('/api/last-status').catch(() => ({ ok: false, json: () => ({}) }));

            if (statusRes.ok) setStatuses(await statusRes.json());
            if (pcRes.ok) setPcs(await pcRes.json());
            if (camRes.ok) setCameras(await camRes.json());
            if (apRes.ok) setAps(await apRes.json());

            if (swRes.ok) {
                const loaded = await swRes.json();
                if (Array.isArray(loaded)) setSwitches(loaded);
                // No more auto-seed from static data if empty.
            }

            if (ppRes.ok) {
                const loadedPP = await ppRes.json();
                if (Array.isArray(loadedPP)) setPatchPanels(loadedPP);
            }
        };
        loadAll();
    }, []);

    const groupedItems = [...switches.map(s => ({ ...s, type: 'switch' })), ...patchPanels.map(p => ({ ...p, type: 'patch_panel' }))]
        .reduce((acc, item) => {
            if (!acc[item.location]) acc[item.location] = [];
            acc[item.location].push(item);
            return acc;
        }, {} as Record<string, any[]>);

    // Locations Management (User Defined + Dynamic from equipment)
    const [customLocations, setCustomLocations] = useLocalStorage<string[]>('technical-rooms-list', ["Térreo", "1° Andar", "Gabinetes", "2° Andar", "3° Andar", "4° Andar"]);
    const [isManagingLocations, setIsManagingLocations] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');

    const dynamicLocations = Array.from(new Set([...switches.map(s => s.location), ...patchPanels.map(p => p.location)]));

    // Merge custom and dynamic, ensuring unique values
    const uniqueLocations = Array.from(new Set([...customLocations, ...dynamicLocations]));

    // Sort logic: Custom items respected order first, then others alphabetically
    const locations = uniqueLocations.sort((a, b) => {
        const indexA = customLocations.indexOf(a);
        const indexB = customLocations.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return a.localeCompare(b, undefined, { numeric: true });
    });

    const handleAddLocation = () => {
        if (!newLocationName.trim()) return;
        if (customLocations.includes(newLocationName.trim())) {
            toast.error("Essa sala técnica já existe!");
            return;
        }
        setCustomLocations([...customLocations, newLocationName.trim()]);
        setNewLocationName('');
        toast.success("Sala Técnica adicionada!");
    };

    const handleRemoveLocation = (loc: string) => {
        if (dynamicLocations.includes(loc)) {
            toast.warning("Esta sala possui equipamentos e não pode ser removida até estar vazia."); // Or just allow removing from custom list but it stays visible? Let's warn.
            // Actually, allow removing from "Saved List", but it stays visible if used.
            // toast.info("Removido da lista personalizada (mas visível pois contém itens).");
        }
        setCustomLocations(customLocations.filter(l => l !== loc));
    };

    const handleRenameLocation = async (oldName: string, newName: string) => {
        if (!newName.trim() || customLocations.includes(newName)) {
            toast.error("Nome inválido ou já existente!");
            return;
        }

        // 1. Update List
        setCustomLocations(customLocations.map(l => l === oldName ? newName : l));

        // 2. Update Devices
        const switchesToUpdate = switches.filter(s => s.location === oldName).map(s => ({ ...s, location: newName }));
        const ppsToUpdate = patchPanels.filter(p => p.location === oldName).map(p => ({ ...p, location: newName }));

        if (switchesToUpdate.length > 0) {
            const updatedSwitches = switches.map(s => s.location === oldName ? { ...s, location: newName } : s);
            setSwitches(updatedSwitches);
            await fetch('/api/sync-switches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ switches: updatedSwitches }) });
        }

        if (ppsToUpdate.length > 0) {
            const updatedPPs = patchPanels.map(p => p.location === oldName ? { ...p, location: newName } : p);
            setPatchPanels(updatedPPs);
            syncPatchPanels(updatedPPs);
        }

        toast.success("Sala renomeada com sucesso!");
    };

    const handleDragEndLocations = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setCustomLocations((items) => {
                const oldIndex = items.indexOf(String(active.id));
                const newIndex = items.indexOf(String(over?.id));
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* ... Header ... */}
            <header className="border-b border-border bg-card shadow-sm sticky top-0 z-20 shrink-0">
                <div className="px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-md"><Server className="w-5 h-5 text-primary-foreground" /></div>
                            <div>
                                <h1 className="text-base font-bold text-foreground">Gestão de Infraestrutura</h1>
                                <p className="text-xs text-muted-foreground">{switches.length} Switches • {patchPanels.length} Patch Panels</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex bg-muted/50 p-1 rounded-lg">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/')}><Laptop className="w-4 h-4 mr-2" />Início</Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/labs')}><Laptop className="w-4 h-4 mr-2" />Labs</Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/cameras')}><CameraIcon className="w-4 h-4 mr-2" />Câmeras</Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/aps')}><Wifi className="w-4 h-4 mr-2" />APs</Button>
                            <Button variant="secondary" size="sm" className="bg-primary/10 text-primary border-primary/20"><Server className="w-4 h-4 mr-2" />Switches</Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/topology')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"><MapIcon className="w-4 h-4 mr-2" />Topologia</Button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/topology')} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                            <MapIcon className="w-4 h-4 mr-2" />
                            Ver Topologia
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsManagingLocations(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Gerenciar Salas
                        </Button>
                    </div>
                </div>
            </header>





            {/* MANAGE LOCATIONS DIALOG */}
            <Dialog open={isManagingLocations} onOpenChange={setIsManagingLocations}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gerenciar Salas Técnicas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nome da nova sala..."
                                value={newLocationName}
                                onChange={(e) => setNewLocationName(e.target.value)}
                            />
                            <Button onClick={handleAddLocation}><Plus className="w-4 h-4" /></Button>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEndLocations}
                        >
                            <SortableContext
                                items={customLocations}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {customLocations.map(loc => (
                                        <SortableLocationRow
                                            key={loc}
                                            loc={loc}
                                            onDelete={() => handleRemoveLocation(loc)}
                                            onRename={(newName) => handleRenameLocation(loc, newName)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {/* Dynamic (Not Sortable here, just appendable) */}
                        <div className="border-t pt-2 space-y-2">
                            <p className="text-xs text-muted-foreground mb-1">Outras salas detectadas:</p>
                            {dynamicLocations.filter(L => !customLocations.includes(L)).map(loc => (
                                <div key={loc} className="flex items-center justify-between p-2 border border-dashed rounded-md bg-muted/50 opacity-70">
                                    <span className="font-medium flex items-center gap-2">
                                        {loc}
                                        <span className="text-[10px] bg-secondary px-1 rounded">Via Equipamentos</span>
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 text-muted-foreground"
                                        title="Adicionar à lista fixa"
                                        onClick={() => {
                                            setCustomLocations([...customLocations, loc]);
                                        }}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* LEGENDA */}
            <div className="px-8 py-4 border-b bg-muted/20">
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Legenda:</span>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#1a1b1e] border border-[#2c2e33] rounded-[1px]"></div> Livre</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-600 border border-amber-400 rounded-[1px]"></div> Câmera</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 border border-blue-400 rounded-[1px]"></div> Access Point</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-violet-700 border border-violet-500 rounded-[1px]"></div> Uplink</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-600 border border-emerald-400 rounded-[1px]"></div> PC / Outros</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div> Online</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-600 rounded-full"></div> Offline</div>
                </div>
            </div>


            <main className="flex-1 overflow-auto p-6 space-y-8 pb-32">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    {locations.map(location => {
                        const items = groupedItems[location] || [];
                        items.sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order

                        return (
                            <section key={location} className="space-y-6">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                        <h2 className="text-lg font-bold text-foreground">{location}</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setIsCreatingSwitch(location)}>
                                            <Plus className="w-4 h-4 mr-2" /> Switch
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setIsCreatingPP(location)}>
                                            <Plus className="w-4 h-4 mr-2" /> Patch Panel
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6 max-w-[1200px]">
                                    <SortableContext
                                        items={items.map(i => i.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {items.map((item: any) => (
                                            <SortableRackItem key={item.id} id={item.id}>
                                                <div className={`border rounded-lg shadow-sm overflow-hidden flex flex-col ${item.type === 'switch' ? 'bg-card border-border' : 'bg-zinc-100 border-zinc-200 opacity-90'}`}>

                                                    {/* HEADER */}
                                                    <div className={`px-4 py-3 border-b flex justify-between items-center ${item.type === 'switch' ? (item.enabled !== false ? 'bg-muted/30 border-border' : 'bg-orange-50/50 border-orange-200') : 'bg-gray-200 border-gray-300'}`}>
                                                        <div className="flex items-center gap-4 pl-6"> {/* Padding for Drag Handle */}
                                                            <div>
                                                                <h3 className={`font-bold text-sm flex items-center gap-2 ${item.enabled === false ? 'text-orange-950' : 'text-foreground'}`}>
                                                                    {item.name}
                                                                    {item.type === 'switch' && <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.enabled === false ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>Switch</span>}
                                                                    {item.enabled === false && <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1"><ShieldAlert className="w-2.5 h-2.5" /> DESCONECTADO</span>}
                                                                    {item.type === 'patch_panel' && <span className="text-[10px] bg-gray-600 text-white px-1.5 py-0.5 rounded">Passivo</span>}
                                                                </h3>
                                                                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                                                    {item.type === 'switch' ? item.ip : 'Cabeamento Estruturado'} • {item.totalPorts} Portas
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] font-mono bg-background/50 border px-2 py-1 rounded shadow-sm opacity-50 hidden sm:block">
                                                                {item.id}
                                                            </div>

                                                            {item.type === 'switch' && (
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handlePing(item.ip)} disabled={item.enabled === false}>
                                                                    <Activity className="w-4 h-4" />
                                                                </Button>
                                                            )}

                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingDevice({ type: item.type === 'switch' ? 'Switch' : 'PatchPanel', data: item })}>
                                                                <Settings className="w-4 h-4 text-muted-foreground" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* PORTS VISUALIZATION */}
                                                    <div className={`p-4 ${item.type === 'switch' ? (item.enabled !== false ? 'bg-[#15171b]' : 'opacity-60 bg-[#1a1b1e]') : 'bg-[#f4f4f5]'}`}>
                                                        <div className={`border rounded-md p-1 inline-block shadow-inner min-w-[300px] ${item.type === 'switch' ? (item.enabled !== false ? 'bg-[#0b0c0e] border-[#25282e]' : 'bg-[#15171b] border-orange-200/20') : 'bg-white border-zinc-300'}`}>
                                                            <div className="flex flex-col gap-3">
                                                                <div className="flex gap-2 px-2 pt-2">
                                                                    {Array.from({ length: Math.ceil(item.totalPorts / 2) }).map((_, i) => {
                                                                        const portNum = (i * 2) + 1;
                                                                        return item.type === 'switch' ?
                                                                            <SwitchPort
                                                                                key={portNum}
                                                                                portNum={portNum}
                                                                                sw={item}
                                                                                statuses={statuses}
                                                                                onPortClick={(p) => {
                                                                                    const portD = item.ports?.find((x: any) => x.port === p);
                                                                                    setEditingSwitchPort({
                                                                                        swId: item.id,
                                                                                        port: p,
                                                                                        name: portD?.name || '',
                                                                                        type: portD?.type || 'PC',
                                                                                        deviceId: portD?.deviceId,
                                                                                        deviceIp: portD?.deviceIp
                                                                                    });
                                                                                }}
                                                                            /> :
                                                                            <PatchPanelPort key={portNum} portNum={portNum} pp={item} onClick={(p) => setEditingPort({ ppId: item.id, port: p, description: item.ports.find((x: any) => x.port === p)?.description || '' })} />;
                                                                    })}
                                                                </div>
                                                                <div className="flex gap-2 px-2 pb-2">
                                                                    {Array.from({ length: Math.floor(item.totalPorts / 2) }).map((_, i) => {
                                                                        const portNum = (i * 2) + 2;
                                                                        return item.type === 'switch' ?
                                                                            <SwitchPort
                                                                                key={portNum}
                                                                                portNum={portNum}
                                                                                sw={item}
                                                                                statuses={statuses}
                                                                                onPortClick={(p) => {
                                                                                    const portD = item.ports?.find((x: any) => x.port === p);
                                                                                    setEditingSwitchPort({
                                                                                        swId: item.id,
                                                                                        port: p,
                                                                                        name: portD?.name || '',
                                                                                        type: portD?.type || 'PC',
                                                                                        deviceId: portD?.deviceId,
                                                                                        deviceIp: portD?.deviceIp
                                                                                    });
                                                                                }}
                                                                            /> :
                                                                            <PatchPanelPort key={portNum} portNum={portNum} pp={item} onClick={(p) => setEditingPort({ ppId: item.id, port: p, description: item.ports.find((x: any) => x.port === p)?.description || '' })} />;
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </SortableRackItem>
                                        ))}
                                    </SortableContext>
                                    {items.length === 0 && <p className="text-sm text-muted-foreground italic pl-4">Nenhum equipamento cadastrado neste local.</p>}
                                </div>
                            </section>
                        );
                    })}
                </DndContext>
            </main>

            {/* DIALOG: CREATE PATCH PANEL */}
            < Dialog open={!!isCreatingPP} onOpenChange={() => setIsCreatingPP(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Patch Panel em {isCreatingPP}</DialogTitle>
                    </DialogHeader>
                    {/* ... (Create PP Form) ... */}
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome (Ex: Patch Panel Voz)</Label>
                            <Input value={newPP.name} onChange={e => setNewPP({ ...newPP, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Quantidade de Portas</Label>
                            <select className="w-full h-10 px-3 rounded-md border text-sm" value={newPP.ports} onChange={e => setNewPP({ ...newPP, ports: Number(e.target.value) })}>
                                <option value={24}>24 Portas</option>
                                <option value={48}>48 Portas</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreatePatchPanel}>Criar Painel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG: CREATE SWITCH */}
            < Dialog open={!!isCreatingSwitch} onOpenChange={() => setIsCreatingSwitch(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Switch em {isCreatingSwitch}</DialogTitle>
                    </DialogHeader>
                    {/* ... (Create Switch Form) ... */}
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome (Ex: Switch Principal)</Label>
                            <Input value={newSwitch.name} onChange={e => setNewSwitch({ ...newSwitch, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>IP de Gerenciamento</Label>
                            <Input value={newSwitch.ip} onChange={e => setNewSwitch({ ...newSwitch, ip: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Quantidade de Portas</Label>
                            <select className="w-full h-10 px-3 rounded-md border text-sm" value={newSwitch.ports} onChange={e => setNewSwitch({ ...newSwitch, ports: Number(e.target.value) })}>
                                <option value={24}>24 Portas</option>
                                <option value={48}>48 Portas</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateSwitch}>Criar Switch</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG: EDIT PORT DESCRIPTION (PATCH PANEL) */}
            < Dialog open={!!editingPort} onOpenChange={() => setEditingPort(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Porta {editingPort?.port}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>O que está conectado aqui?</Label>
                            <Input
                                placeholder="Ex: Sala 102 - Ponto Rede"
                                value={editingPort?.description || ''}
                                onChange={e => setEditingPort(prev => prev ? { ...prev, description: e.target.value } : null)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSavePortDescription}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG: EDIT SWITCH PORT */}
            < Dialog open={!!editingSwitchPort} onOpenChange={() => setEditingSwitchPort(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurar Porta {editingSwitchPort?.port}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">

                        <div className="space-y-2">
                            <Label>Dispositivo Conectado</Label>
                            <p className="text-[11px] text-muted-foreground">Selecione o dispositivo para vincular e monitorar o status.</p>
                            <select
                                className="w-full h-10 px-3 rounded-md border text-sm bg-background"
                                value={editingSwitchPort?.deviceId || (['Uplink', 'Printer', 'Other'].includes(editingSwitchPort?.type || '') ? `manual_${editingSwitchPort?.type?.toLowerCase() === 'other' ? 'other' : editingSwitchPort?.type?.toLowerCase()}` : '')}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (value === 'manual_pc') {
                                        setEditingSwitchPort(prev => prev ? { ...prev, name: 'Computador', type: 'PC', deviceId: undefined, deviceIp: undefined } : null);
                                        return;
                                    }
                                    if (value === 'manual_uplink') {
                                        setEditingSwitchPort(prev => prev ? { ...prev, name: 'Uplink', type: 'Uplink', deviceId: undefined, deviceIp: undefined } : null);
                                        return;
                                    }
                                    if (value === 'manual_printer') {
                                        setEditingSwitchPort(prev => prev ? { ...prev, name: 'Impressora', type: 'Printer', deviceId: undefined, deviceIp: undefined } : null);
                                        return;
                                    }
                                    if (value === 'manual_other') {
                                        setEditingSwitchPort(prev => prev ? { ...prev, name: 'Outro Dispositivo', type: 'Other', deviceId: undefined, deviceIp: undefined } : null);
                                        return;
                                    }

                                    // Find Device
                                    const pc = pcs.find(p => String(p.id) === value);
                                    if (pc) {
                                        setEditingSwitchPort(prev => prev ? { swId: prev.swId, port: prev.port, name: pc.name || '', type: 'PC', deviceId: String(pc.id), deviceIp: pc.ip } : null);
                                        return;
                                    }

                                    const cam = cameras.find(c => String(c.id) === value);
                                    if (cam) {
                                        setEditingSwitchPort(prev => prev ? { swId: prev.swId, port: prev.port, name: cam.name, type: 'Camera', deviceId: String(cam.id), deviceIp: cam.ip } : null);
                                        return;
                                    }

                                    const ap = aps.find(a => String(a.id) === value);
                                    if (ap) {
                                        setEditingSwitchPort(prev => prev ? { swId: prev.swId, port: prev.port, name: ap.name, type: 'AP', deviceId: String(ap.id), deviceIp: ap.ip } : null);
                                        return;
                                    }
                                }}
                            >
                                <option value="">-- Porta Livre --</option>

                                <optgroup label="Infraestrutura Geral">
                                    <option value="manual_pc">💻 Computador (Sem cadastro)</option>
                                    <option value="manual_uplink">🔗 Uplink (Link entre Switches)</option>
                                    <option value="manual_printer">🖨️ Impressora (Genérica)</option>
                                    <option value="manual_other">🔌 Outro Dispositivo</option>
                                </optgroup>

                                <optgroup label={`Computadores (${pcs.length})`}>
                                    {pcs
                                        .filter(pc => !pc.switchId || (editingSwitchPort?.deviceId && String(pc.id) === String(editingSwitchPort.deviceId)))
                                        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                        .map(pc => (
                                            <option key={pc.id} value={pc.id}>💻 {pc.name || ''} ({pc.ip})</option>
                                        ))}
                                </optgroup>

                                <optgroup label={`Câmeras (${cameras.length})`}>
                                    {cameras
                                        .filter(c => !c.switchId || (editingSwitchPort?.deviceId && String(c.id) === String(editingSwitchPort.deviceId)))
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(c => (
                                            <option key={c.id} value={c.id}>📷 {c.name} ({c.ip})</option>
                                        ))}
                                </optgroup>

                                <optgroup label={`Access Points (${aps.length})`}>
                                    {aps
                                        .filter(a => !a.switchId || (editingSwitchPort?.deviceId && String(a.id) === String(editingSwitchPort.deviceId)))
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(a => (
                                            <option key={a.id} value={a.id}>📡 {a.name} ({a.ip})</option>
                                        ))}
                                </optgroup>
                            </select>

                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome Personalizado</Label>
                                <Input
                                    value={editingSwitchPort?.name || ''}
                                    onChange={e => setEditingSwitchPort(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    placeholder="Nome do dispositivo"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>IP (Opcional)</Label>
                                <Input
                                    value={editingSwitchPort?.deviceIp || ''}
                                    onChange={e => setEditingSwitchPort(prev => prev ? { ...prev, deviceIp: e.target.value } : null)}
                                    placeholder="10.70.x.x"
                                />
                            </div>
                        </div>


                        {/* UPLINK SPECIFIC: Connect to another Switch */}
                        {editingSwitchPort?.type === 'Uplink' && (
                            <div className="space-y-2 border-t pt-2">
                                <Label className="text-violet-600 font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-600" /> Conectado ao Switch (Topologia)</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border text-sm bg-violet-50"
                                    value={editingSwitchPort.deviceId || ''}
                                    onChange={(e) => {
                                        const targetSwId = e.target.value;
                                        if (!targetSwId) {
                                            setEditingSwitchPort(prev => prev ? { ...prev, deviceId: undefined, deviceIp: undefined, name: 'Uplink' } : null);
                                            return;
                                        }
                                        const targetSw = switches.find(s => s.id === targetSwId);
                                        if (targetSw) {
                                            setEditingSwitchPort(prev => prev ? {
                                                ...prev,
                                                deviceId: targetSw.id,
                                                deviceIp: targetSw.ip,
                                                name: `Uplink -> ${targetSw.name}`
                                            } : null);
                                        }
                                    }}
                                >
                                    <option value="">-- Selecione o Switch de Destino --</option>
                                    {switches
                                        .map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.location}) - {s.ip}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        )}

                    </div>
                    <DialogFooter className="flex justify-between sm:justify-between">
                        <div className="flex gap-2">
                            <Button variant="destructive" onClick={() => {
                                if (!editingSwitchPort) return;

                                // 1. Sync Backend Unplug (Clear Device side)
                                const { deviceId, type } = editingSwitchPort;
                                if (deviceId && type) {
                                    const devType = type.toUpperCase();
                                    const sId = String(deviceId);
                                    if (devType === 'CAMERA') {
                                        const updatedCameras = cameras.map(c => String(c.id) === sId ? { ...c, switchId: null, switchPort: null } : c);
                                        setCameras(updatedCameras);
                                        fetch('/api/sync-cameras', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cameras: updatedCameras }) }).catch(console.error);
                                    } else if (devType === 'AP') {
                                        const updatedAps = aps.map(a => String(a.id) === sId ? { ...a, switchId: null, switchPort: null } : a);
                                        setAps(updatedAps);
                                        fetch('/api/sync-aps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aps: updatedAps }) }).catch(console.error);
                                    } else if (devType === 'PC') {
                                        const updatedPcs = pcs.map(p => String(p.id) === sId ? { ...p, switchId: null, switchPort: null } : p);
                                        setPcs(updatedPcs);
                                        fetch('/api/sync-pcs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pcs: updatedPcs }) }).catch(console.error);
                                    }
                                }

                                // 2. Remove Port from Switch (Visual Reset to Gray)
                                const sw = switches.find(s => s.id === editingSwitchPort.swId);
                                if (sw && sw.ports) {
                                    const updatedPorts = sw.ports.filter(p => p.port !== editingSwitchPort.port);
                                    handleSaveSwitch({ ...sw, ports: updatedPorts });
                                    setEditingSwitchPort(null);
                                    toast.success("Porta liberada!");
                                }
                            }}>Liberar Porta</Button>

                            {editingSwitchPort?.deviceIp && (
                                <Button variant="secondary" onClick={() => handlePing(editingSwitchPort.deviceIp!)}>
                                    <Activity className="w-4 h-4 mr-2" /> Ping
                                </Button>
                            )}
                        </div>
                        <Button onClick={handleSaveSwitchPort}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent >
            </Dialog>

            <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
                <DialogContent className="max-w-2xl bg-card">
                    {/* PC, Cam, AP legacy handlers if needed */}
                    {editingDevice?.type === 'PC' && (
                        <EditPanel pc={editingDevice.data} onSave={() => { }} onClose={() => setEditingDevice(null)} onWake={() => { }} onPing={handlePing} onShutdown={async () => { }} onDelete={() => { }} />
                    )}
                    {(editingDevice?.type === 'Camera' || editingDevice?.type === 'AP') && (
                        <DeviceEditPanel device={editingDevice.data} type={editingDevice.type} switches={switches} onSave={() => { }} onClose={() => { }} onPing={handlePing} onDelete={() => { }} />
                    )}

                    {editingDevice?.type === 'Switch' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold">Editar Switch</h2>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteSwitch(editingDevice.data.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                </Button>
                            </div>

                            {/* Switch Enable/Disable Toggle */}
                            <div className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all duration-300",
                                (editingDevice.data.enabled ?? true) ? "bg-green-50/50 border-green-200" : "bg-orange-50/50 border-orange-200"
                            )}>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        {(editingDevice.data.enabled ?? true) ? <ShieldCheck className="w-4 h-4 text-green-600" /> : <ShieldAlert className="w-4 h-4 text-orange-600" />}
                                        <Label className="text-sm font-semibold text-foreground">Monitoramento Ativo</Label>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {(editingDevice.data.enabled ?? true) ? 'O switch é monitorado e visível na topologia.' : 'O switch e seus dispositivos estão desconectados.'}
                                    </p>
                                </div>
                                <Switch
                                    checked={editingDevice.data.enabled ?? true}
                                    onCheckedChange={(val) => setEditingDevice({ ...editingDevice, data: { ...editingDevice.data, enabled: val } })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input value={editingDevice.data.name} onChange={e => setEditingDevice({ ...editingDevice, data: { ...editingDevice.data, name: e.target.value } })} />
                            </div>
                            <div className="space-y-2">
                                <Label>IP</Label>
                                <Input value={editingDevice.data.ip} onChange={e => setEditingDevice({ ...editingDevice, data: { ...editingDevice.data, ip: e.target.value } })} />
                            </div>
                            <Button onClick={() => handleSaveSwitch(editingDevice.data as NetworkSwitch)} className="w-full">Salvar</Button>
                        </div>
                    )}

                    {editingDevice?.type === 'PatchPanel' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold">Editar Patch Panel</h2>
                                <Button variant="destructive" size="sm" onClick={() => handleDeletePatchPanel(editingDevice.data.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input value={editingDevice.data.name} onChange={e => setEditingDevice({ ...editingDevice, data: { ...editingDevice.data, name: e.target.value } })} />
                            </div>
                            <Button onClick={() => handleSavePatchPanel(editingDevice.data as PatchPanel)}>Salvar</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
