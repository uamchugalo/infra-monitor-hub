import React, { useState, useEffect } from "react";
import { CAMERAS, Camera } from "@/utils/cameraData";
import {
  Server,
  Video,
  Activity,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Trash2,
  Plus,
  Router,
  ShieldAlert,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ReportsModal } from "@/components/ReportsModal";
import { DeviceEditPanel } from "@/components/DeviceEditPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// DnD Imports
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

// Componente Draggable Camera Card
const DraggableCameraCard = React.memo(({
  camera,
  status,
  pinging,
  isSelected,
  onClick,
  onPing,
  switches,
}: {
  camera: Camera & { enabled?: boolean };
  status: any;
  pinging: any;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onPing: (e: any) => void;
  switches: any[];
}) => {
  const swName = switches.find((s) => s.id === camera.switchId)?.name;
  const isEnabled = camera.enabled !== false;

  // Null Check Safetynet
  const safeId = camera?.id || "unknown";

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: safeId,
      data: { camera },
    });

  if (!camera) return null;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 999 : "auto",
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-md border hover:shadow-md transition-all duration-200 p-3 cursor-grab active:cursor-grabbing ${
        isSelected
          ? "border-primary ring-2 ring-primary bg-primary/5"
          : !isEnabled
            ? "border-zinc-200 bg-zinc-50 opacity-70"
            : status === "online"
              ? "border-green-500/30 bg-card"
              : status === "offline"
                ? "border-red-500/30 bg-card"
                : "border-border bg-card"
      }`}
    >
      {/* Status Indicator */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            !isEnabled
              ? "bg-zinc-400"
              : status === "online"
                ? "bg-green-500 animate-pulse"
                : status === "offline"
                  ? "bg-red-500"
                  : "bg-gray-300"
          }`}
        />
      </div>

      {/* Icon & ID */}
      <div className="flex items-center gap-2 mb-2">
        <Video
          className={`w-4 h-4 ${!isEnabled ? "text-zinc-400" : status === "online" ? "text-green-600" : status === "offline" ? "text-red-500" : "text-muted-foreground"}`}
        />
        <span className="text-xs font-semibold text-muted-foreground">
          {camera.id}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-0.5 mb-3">
        <h3
          className="text-sm font-medium text-foreground truncate"
          title={camera.name}
        >
          {camera.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-mono text-muted-foreground truncate">
            {camera.ip}
          </p>
          {camera.switchPort && (
            <span className="text-[9px] text-primary bg-primary/10 px-1 rounded flex items-center gap-1">
              {swName && (
                <span className="opacity-70 font-bold border-r border-primary/20 pr-1">
                  {swName}
                </span>
              )}
              P:{camera.switchPort}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <Button
        className="w-full h-7 text-xs"
        variant={status === "online" ? "outline" : "secondary"}
        size="sm"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onPing}
        disabled={pinging || !isEnabled}
      >
        {pinging ? (
          <Activity className="w-3 h-3 mr-1 animate-spin" />
        ) : !isEnabled ? (
          <ShieldAlert className="w-3 h-3 mr-1" />
        ) : status === "online" ? (
          <CheckCircle2 className="w-3 h-3 mr-1" />
        ) : (
          <AlertCircle className="w-3 h-3 mr-1" />
        )}
        {pinging ? "..." : !isEnabled ? "Ignorada" : "Ping"}
      </Button>
    </div>
  );
});

// Componente Droppable Location Group
const LocationGroup = ({
  id,
  title,
  cameras,
  status,
  pinging,
  selectedIds,
  onSelect,
  onPing,
  switches,
}: {
  id: string;
  title: string;
  cameras: (Camera & { enabled?: boolean })[];
  status: any;
  pinging: any;
  selectedIds: string[];
  onSelect: (c: Camera, e: React.MouseEvent) => void;
  onPing: (c: Camera) => void;
  switches: any[];
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-lg border transition-colors ${isOver ? "bg-primary/5 border-primary/50" : "bg-card/50 border-border/50"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground ml-auto bg-muted px-2 py-0.5 rounded-full">
          {cameras.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 min-h-[80px]">
        {cameras.map((cam) => (
          <DraggableCameraCard
            key={cam.id}
            camera={cam}
            status={status ? status[cam.id] : null}
            pinging={pinging ? pinging[cam.id] : false}
            isSelected={selectedIds.includes(cam.id)}
            onClick={(e) => onSelect(cam, e)}
            onPing={(e) => {
              e.stopPropagation();
              onPing(cam);
            }}
            switches={switches}
          />
        ))}
        {cameras.length === 0 && (
          <div className="col-span-full h-20 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <span className="text-xs text-muted-foreground">
              Arraste Câmeras para cá
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const LOCATIONS = [
  "Térreo",
  "1° Andar",
  "Gabinetes",
  "2° Andar",
  "3° Andar",
  "4° Andar",
];

const Cameras = () => {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState<(Camera & { enabled?: boolean })[]>(
    CAMERAS || [],
  ); // Safety
  const [pinging, setPinging] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<
    Record<string, "online" | "offline" | null>
  >({});
  const [selectedDevice, setSelectedDevice] = useState<
    (Camera & { enabled?: boolean }) | null
  >(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Create State
  const [isCreating, setIsCreating] = useState(false);
  const [newCam, setNewCam] = useState({
    name: "",
    ip: "",
    location: "Térreo",
  });
  const [switches, setSwitches] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  useEffect(() => {
    const loadCameras = async () => {
      try {
        const res = await fetch("/api/cameras");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCameras(data);
          }
        }
        const swRes = await fetch("/api/switches");
        if (swRes.ok) setSwitches(await swRes.json());
      } catch (error) {
        console.error("Failed to load persisted Cameras/Switches:", error);
      }
    };
    loadCameras();
  }, []);

  // Polling Status simplified
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/last-status");
        if (res.ok) {
          const statusMap = await res.json();
          const newStatus: Record<string, "online" | "offline"> = {};
          cameras.forEach((c) => {
            if (c && statusMap[c.ip]) newStatus[c.id] = statusMap[c.ip];
          });
          if (Object.keys(newStatus).length > 0)
            setStatus((prev) => ({ ...prev, ...newStatus }));
        }
      } catch (e) {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 180000); // 3 mins
    return () => clearInterval(interval);
  }, [cameras]);

  const handlePing = async (cam: Camera) => {
    if (!cam) return;
    setPinging((prev) => ({ ...prev, [cam.id]: true }));
    try {
      const response = await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: cam.ip }),
      });
      const data = await response.json();
      const isAlive = response.ok && data.alive;
      setStatus((prev) => ({
        ...prev,
        [cam.id]: isAlive ? "online" : "offline",
      }));
      if (isAlive) toast.success(`${cam.name}: Online`);
      else toast.error(`${cam.name}: Inacessível`);
      return isAlive;
    } catch (error) {
      setStatus((prev) => ({ ...prev, [cam.id]: "offline" }));
      return false;
    } finally {
      setPinging((prev) => ({ ...prev, [cam.id]: false }));
    }
  };

  const handlePingAll = async () => {
    toast.info("Verificando todas Câmeras...");
    cameras.filter((c) => c.enabled !== false).forEach((c) => handlePing(c));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const camId = active.id as string;
      const newLocation = over.id as string;

      if (LOCATIONS.includes(newLocation) || newLocation === "Outros") {
        const updatedCams = cameras.map((c) =>
          c.id === camId ? { ...c, location: newLocation } : c,
        );
        setCameras(updatedCams);

        fetch("/api/sync-cameras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cameras: updatedCams }),
        }).catch(console.error);

        toast.success(`Câmera movida para ${newLocation}`);
      }
    }
  };

  const handleSaveCamera = (
    id: string,
    name: string,
    ip: string,
    switchPort?: string,
    switchId?: string,
    enabled?: boolean,
  ) => {
    const updatedCams = cameras.map((c) =>
      c.id === id ? { ...c, name, ip, switchPort, switchId, enabled } : c,
    );
    setCameras(updatedCams);
    setSelectedDevice((prev) =>
      prev && prev.id === id
        ? { ...prev, name, ip, switchPort, switchId, enabled }
        : prev,
    );

    fetch("/api/sync-cameras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cameras: updatedCams }),
    })
      .then(() => toast.success("Alterações salvas"))
      .catch(console.error);
  };

  const handleDeleteCamera = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta câmera?")) return;
    const newCams = cameras.filter((c) => c.id !== id);
    setCameras(newCams);
    try {
      await fetch("/api/sync-cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cameras: newCams }),
      });
      toast.success("Câmera removida com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover câmera");
    }
    setSelectedDevice(null);
  };

  const handleDeviceSelect = (cam: Camera, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) => {
        if (prev.includes(cam.id)) {
          return prev.filter((id) => id !== cam.id);
        } else {
          return [...prev, cam.id];
        }
      });
      setSelectedDevice(null);
    } else {
      setSelectedIds([cam.id]);
      setSelectedDevice(cam);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Excluir ${selectedIds.length} itens selecionados?`)) return;

    const newCams = cameras.filter((cam) => !selectedIds.includes(cam.id));
    setCameras(newCams);
    setSelectedIds([]);
    setSelectedDevice(null);

    try {
      await fetch("/api/sync-cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cameras: newCams }),
      });
      toast.success("Itens excluídos com sucesso");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir itens");
    }
  };

  const handleCreateCam = async () => {
    if (!newCam.name || !newCam.ip) return toast.error("Preencha nome e IP");
    const id = `CAM-${Date.now().toString().slice(-6)}`;
    const created: Camera = { ...newCam, id, mac: "" };
    const updated = [...cameras, created];
    setCameras(updated);
    setIsCreating(false);
    setNewCam({ name: "", ip: "", location: "Térreo" });

    try {
      await fetch("/api/sync-cameras", {
        method: "POST",
        body: JSON.stringify({ cameras: updated }),
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Câmera Criada!");
    } catch (e) {
      toast.error("Erro ao salvar criação");
    }
  };

  const camsByLocation = LOCATIONS.reduce(
    (acc, loc) => {
      acc[loc] = [];
      return acc;
    },
    {} as Record<string, Camera[]>,
  );

  const unmapped: Camera[] = [];

  cameras.forEach((c) => {
    // If the camera is linked to a switch, try to use the switch's location
    const sw = switches.find((s) => s.id === c.switchId);
    let targetLocation = c.location;

    if (sw && sw.location) {
      // Normalize location strings (e.g., 1º vs 1°)
      const normalizedSwLoc = sw.location.replace("º", "°");
      if (LOCATIONS.includes(normalizedSwLoc)) {
        targetLocation = normalizedSwLoc;
      }
    }

    if (LOCATIONS.includes(targetLocation)) {
      camsByLocation[targetLocation].push(c);
    } else {
      unmapped.push(c);
    }
  });

  if (unmapped.length > 0) camsByLocation["Outros"] = unmapped;

  const displayLocations =
    unmapped.length > 0 ? [...LOCATIONS, "Outros"] : LOCATIONS;

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-20 shrink-0">
        <div className="px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-md">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">Câmeras</h1>
                <p className="text-xs text-muted-foreground">
                  {cameras.length} dispositivos
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex bg-muted/50 p-1 rounded-lg">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <Server className="w-4 h-4 mr-2" />
                Início
              </Button>
              {/*<Button variant="ghost" size="sm" onClick={() => navigate('/labs')}><Server className="w-4 h-4 mr-2" />Labs</Button>*/}
              <Button variant="secondary" size="sm">
                <Video className="w-4 h-4 mr-2" />
                Câmeras
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/aps")}
              >
                <Router className="w-4 h-4 mr-2" />
                APs
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/technical-rooms")}
              >
                <Server className="w-4 h-4 mr-2" />
                Switches
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/inventory")}
              >
                <Package className="w-4 h-4 mr-2" />
                Inventário
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setIsCreating(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Câmera
            </Button>
            <ReportsModal />
            {selectedIds.length > 0 && (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir (
                {selectedIds.length})
              </Button>
            )}
            <Button onClick={handlePingAll} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Verificar Todas
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <main className="flex-1 overflow-auto p-5 space-y-6">
            {displayLocations.map((loc) => (
              <LocationGroup
                key={loc}
                id={loc}
                title={loc}
                cameras={camsByLocation[loc] || []}
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
                <Button variant="secondary" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Movendo Câmera...
                </Button>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {selectedDevice && (
          <aside className="w-[360px] border-l border-border bg-card shadow-sm h-full overflow-hidden z-30">
            <DeviceEditPanel
              device={{
                ...selectedDevice,
                status:
                  status[selectedDevice.id] === "online" ? "online" : "offline",
              }}
              type="Camera"
              switches={switches}
              onSave={handleSaveCamera}
              onClose={() => setSelectedDevice(null)}
              onPing={(ip) => handlePing({ ...selectedDevice, ip } as Camera)}
              onDelete={() => handleDeleteCamera(selectedDevice.id)}
            />
          </aside>
        )}
      </div>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Câmera</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={newCam.name}
                onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                placeholder="Ex: CAM - Hall"
              />
            </div>
            <div className="space-y-2">
              <Label>IP</Label>
              <Input
                value={newCam.ip}
                onChange={(e) => setNewCam({ ...newCam, ip: e.target.value })}
                placeholder="10.70.x.x"
              />
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <select
                className="w-full h-10 px-3 rounded-md border bg-background"
                value={newCam.location}
                onChange={(e) =>
                  setNewCam({ ...newCam, location: e.target.value })
                }
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateCam}>Criar Câmera</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cameras;
