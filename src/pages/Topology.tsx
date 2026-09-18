import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { useNavigate } from "react-router-dom";
import {
  Server,
  Laptop,
  Camera as CameraIcon,
  Wifi,
  ArrowLeft,
  Activity,
  ShieldAlert,
  Maximize2,
  RefreshCw,
  Search,
  ChevronRight,
  Map as MapIcon,
  Box,
  Video,
  Router,
  Network,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import dagre from "dagre";
import { cn } from "@/lib/utils";

// --- CUSTOM NODE COMPONENTS ---

const DeviceNode = React.memo(({ data, selected }: any) => {
  const isOnline = data.status === "online";
  const isEnabled = data.enabled !== false;

  return (
    <div
      className={cn(
        "group px-4 py-3 shadow-sm rounded-xl border-2 transition-all duration-500 min-w-[180px]",
        selected
          ? "scale-105 border-primary ring-4 ring-primary/10 shadow-lg"
          : "border-zinc-200 shadow-sm",
        !isEnabled ? "opacity-40 grayscale" : "bg-white",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-primary border-2 border-white"
      />

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2.5 rounded-lg shadow-sm flex items-center justify-center transition-colors",
            !isEnabled
              ? "bg-zinc-100 text-zinc-400"
              : isOnline
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-red-50 text-red-600 border border-red-100",
          )}
        >
          {data.type === "Switch" && <Server className="w-5 h-5" />}
          {data.type === "PC" && <Laptop className="w-5 h-5" />}
          {data.type === "Camera" && <CameraIcon className="w-5 h-5" />}
          {data.type === "AP" && <Wifi className="w-5 h-5" />}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">
              {data.type}
            </span>
            {isOnline && isEnabled && (
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            )}
          </div>
          <span className="text-xs font-bold truncate text-zinc-900">
            {data.name}
          </span>
          <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
            {data.ip}
          </span>
        </div>
      </div>

      <div className="absolute top-0 right-0 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEnabled && (
          <div className="bg-orange-600 text-white p-1 rounded-full border-2 border-white shadow-md">
            <ShieldAlert className="w-3 h-3" />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-primary border-2 border-white"
      />
    </div>
  );
});

const nodeTypes = {
  device: DeviceNode,
};

const TopologyContent = () => {
  const navigate = useNavigate();
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [activeLocation, setActiveLocation] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [swRes, pcRes, camRes, apRes, statusRes] = await Promise.all([
        fetch("/api/switches"),
        fetch("/api/pcs"),
        fetch("/api/cameras"),
        fetch("/api/aps"),
        fetch("/api/last-status"),
      ]);

      const [switches, pcs, cameras, aps, statusMap] = await Promise.all([
        swRes.json(),
        pcRes.json(),
        camRes.json(),
        apRes.json(),
        statusRes.json(),
      ]);

      const allDevs = [
        ...switches.map((s: any) => ({ ...s, type: "Switch" })),
        ...pcs.map((p: any) => ({ ...p, type: "PC" })),
        ...cameras.map((c: any) => ({ ...c, type: "Camera" })),
        ...aps.map((a: any) => ({ ...a, type: "AP" })),
      ];

      const allLocs = Array.from(new Set(allDevs.map((d) => d.location)))
        .filter(Boolean)
        .sort();
      setLocations(allLocs);

      const initialNodes: any[] = [];
      const initialEdges: any[] = [];

      // Filtering
      const filteredDevs = allDevs.filter((d) => {
        const matchesLoc =
          activeLocation === "all" || d.location === activeLocation;
        const matchesSearch =
          searchTerm === "" ||
          d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.ip?.includes(searchTerm);
        return matchesLoc && matchesSearch;
      });

      if (activeLocation !== "all") {
        const parentSwitchIds = new Set(
          filteredDevs.map((d) => d.switchId).filter(Boolean),
        );
        switches.forEach((sw: any) => {
          if (
            parentSwitchIds.has(sw.id) &&
            !filteredDevs.find((d) => d.id === sw.id)
          ) {
            filteredDevs.push({ ...sw, type: "Switch", isSourceOnly: true });
          }
        });
      }

      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 120 });
      g.setDefaultEdgeLabel(() => ({}));

      filteredDevs.forEach((d) => {
        g.setNode(d.id, { width: 200, height: 100 });
      });

      filteredDevs.forEach((d) => {
        if (
          d.switchId &&
          filteredDevs.some((parent) => parent.id === d.switchId)
        ) {
          g.setEdge(d.switchId, d.id);

          const isOnline = statusMap[d.ip] === "online";
          initialEdges.push({
            id: `e-${d.switchId}-${d.id}`,
            source: d.switchId,
            target: d.id,
            animated: isOnline && d.enabled !== false,
            label: `P:${d.switchPort}`,
            labelStyle: { fontSize: 8, fill: "#999", fontWeight: "bold" },
            style: {
              stroke: isOnline
                ? "#10b981"
                : d.enabled === false
                  ? "#eee"
                  : "#ef4444",
              strokeWidth: 2,
            },
            type: ConnectionLineType.Bezier,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isOnline ? "#10b981" : "#ef4444",
            },
          });
        }
      });

      switches.forEach((sw: any) => {
        sw.ports?.forEach((p: any) => {
          if (
            p.type === "Uplink" &&
            p.deviceId &&
            filteredDevs.some((n) => n.id === p.deviceId) &&
            filteredDevs.some((n) => n.id === sw.id)
          ) {
            g.setEdge(sw.id, p.deviceId);
            initialEdges.push({
              id: `e-sw-${sw.id}-${p.deviceId}`,
              source: sw.id,
              target: p.deviceId,
              animated: true,
              label: "BACKBONE",
              labelStyle: { fontSize: 9, fontWeight: "900", fill: "#8b5cf6" },
              style: {
                stroke: "#8b5cf6",
                strokeWidth: 4,
                strokeDasharray: "5 5",
              },
              type: ConnectionLineType.Bezier,
            });
          }
        });
      });

      dagre.layout(g);

      filteredDevs.forEach((d) => {
        const nodeWithPosition = g.node(d.id);
        initialNodes.push({
          id: d.id,
          type: "device",
          data: { ...d, status: statusMap[d.ip] || d.status || "offline" },
          position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
          className: d.isSourceOnly ? "opacity-40" : "",
        });
      });

      setNodes(initialNodes);
      setEdges(initialEdges);

      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
    } catch (error) {
      toast.error("Erro ao sincronizar topologia");
    }
  }, [activeLocation, searchTerm, setNodes, setEdges, fitView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* SHARED HEADER */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-30 shrink-0">
        <div className="px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">
                  Topologia de Rede
                </h1>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Mapeamento Lógico Dinâmico
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex bg-muted/50 p-1 rounded-lg">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <Activity className="w-4 h-4 mr-2" />
                Início
              </Button>
              {/*<Button variant="ghost" size="sm" onClick={() => navigate('/labs')}><Server className="w-4 h-4 mr-2" />Labs</Button>*/}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/cameras")}
              >
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
                <Network className="w-4 h-4 mr-2" />
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
              <Button
                variant="secondary"
                size="sm"
                className="bg-primary/10 text-primary border-primary/20"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Topologia
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase">
              Mapa em Tempo Real
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: NAVIGATION */}
        <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col z-20 shadow-xl">
          <div className="p-6 border-b border-zinc-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-zinc-900 rounded-xl shadow-lg">
                <MapIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight">INFRA HUB</h2>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest text-emerald-600">
                  NOC Monitor
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Buscar ativo ou IP..."
                className="pl-9 bg-zinc-50 border-zinc-200 h-10 text-xs focus-visible:ring-primary/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <p className="px-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
              Zonas da Unidade
            </p>

            <button
              onClick={() => setActiveLocation("all")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group",
                activeLocation === "all"
                  ? "bg-zinc-900 text-white shadow-lg"
                  : "text-zinc-600 hover:bg-zinc-50",
              )}
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4" />
                <span className="text-xs font-bold uppercase transition-transform group-hover:translate-x-1">
                  Visão Completa
                </span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </button>

            <div className="h-px bg-zinc-100 my-4 mx-3" />

            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group",
                  activeLocation === loc
                    ? "bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200"
                    : "text-zinc-500 hover:bg-zinc-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <Activity
                    className={cn(
                      "w-4 h-4",
                      activeLocation === loc
                        ? "text-emerald-500"
                        : "text-zinc-300",
                    )}
                  />
                  <span className="text-xs font-bold uppercase transition-transform group-hover:translate-x-1">
                    {loc}
                  </span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </button>
            ))}
          </div>

          <div className="p-6">
            <Button
              variant="ghost"
              className="w-full bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-xs font-bold text-zinc-900 h-11"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> VOLTAR AO PAINEL
            </Button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <Button
              onClick={loadData}
              className="bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 h-11 rounded-xl px-4 text-xs font-bold shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" /> ATUALIZAR MAPA
            </Button>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.Bezier}
            fitView
            minZoom={0.05}
            maxZoom={1.5}
          >
            <Background color="#ffffff" gap={20} size={1} opacity={0.03} />
            <Controls className="!bg-white !border-zinc-200 !fill-zinc-900 shadow-xl" />

            <Panel position="bottom-left" className="m-6">
              <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-xl flex items-center gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    Infraestrutura
                  </span>
                  <span className="text-lg font-black text-zinc-900">
                    {nodes.length} Ativos
                  </span>
                </div>
                <div className="h-10 w-px bg-zinc-100" />
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-tight">
                      Status Online
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-tight">
                      Status Offline
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-tight">
                      Main Backbone
                    </span>
                  </div>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </main>
      </div>
    </div>
  );
};

export default function Topology() {
  return (
    <ReactFlowProvider>
      <TopologyContent />
    </ReactFlowProvider>
  );
}
