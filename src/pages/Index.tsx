import { useState, useEffect } from "react";
import { PC, LabLog as LabLogType, LabData } from "@/types/pc";
import { generateInitialPCs, LABS, LabId } from "@/utils/pcData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PCCard } from "@/components/PCCard";
import { EditPanel } from "@/components/EditPanel";
import { LabLog } from "@/components/LabLog";
import { StatusSummary } from "@/components/StatusSummary";
import { LabSelector } from "@/components/LabSelector";
import { ReportsModal } from "@/components/ReportsModal";
import {
  Server,
  RotateCcw,
  Video,
  Activity,
  Power,
  Router,
  Plus,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const initializeLabData = (): Record<LabId, LabData> => {
  const data: Record<string, LabData> = {};
  LABS.forEach((lab) => {
    data[lab.id] = {
      pcs: generateInitialPCs(lab.id),
      logs: [],
    };
  });
  return data as Record<LabId, LabData>;
};

const Index = () => {
  const navigate = useNavigate();
  const [labsData, setLabsData] = useLocalStorage<Record<LabId, LabData>>(
    "labs-data",
    initializeLabData(),
  );
  const [selectedLab, setSelectedLab] = useState<LabId>("109");
  const [selectedPcId, setSelectedPcId] = useState<string | number | null>(
    null,
  );

  const currentLabData = labsData[selectedLab];
  const currentLab = LABS.find((l) => l.id === selectedLab)!;
  const selectedPc =
    currentLabData.pcs.find((p) => p.id === selectedPcId) || null;

  const handleSelectLab = (labId: LabId) => {
    setSelectedLab(labId);
    setSelectedPcId(null);
  };

  const handleSelectPc = (id: string | number) => {
    setSelectedPcId(id === selectedPcId ? null : id);
  };

  const handleSavePc = (updatedPc: PC) => {
    setLabsData({
      ...labsData,
      [selectedLab]: {
        ...currentLabData,
        pcs: currentLabData.pcs.map((p) =>
          p.id === updatedPc.id ? updatedPc : p,
        ),
      },
    });
    toast.success(`PC #${String(updatedPc.id).padStart(2, "0")} salvo`);
  };

  const handleAddLabLog = (log: LabLogType) => {
    setLabsData({
      ...labsData,
      [selectedLab]: {
        ...currentLabData,
        logs: [log, ...currentLabData.logs],
      },
    });
    toast.success("Evento registrado");
  };

  const handleDeleteLabLog = (id: string) => {
    setLabsData({
      ...labsData,
      [selectedLab]: {
        ...currentLabData,
        logs: currentLabData.logs.filter((l) => l.id !== id),
      },
    });
  };

  const handleResetLab = () => {
    if (confirm(`Resetar todos os dados do ${currentLab.name}?`)) {
      setLabsData({
        ...labsData,
        [selectedLab]: {
          pcs: generateInitialPCs(selectedLab),
          logs: [],
        },
      });
      setSelectedPcId(null);
      toast.success(`${currentLab.name} resetado`);
    }
  };

  // Carregar dados persistidos do servidor ao iniciar
  useEffect(() => {
    const loadServerData = async () => {
      try {
        // Carrega PCs
        const pcResponse = await fetch("/api/pcs");
        if (pcResponse.ok) {
          const serverPcs: (PC & { location?: string })[] =
            await pcResponse.json();
          if (serverPcs.length > 0) {
            setLabsData((prevData) => {
              const newData = { ...prevData };
              (Object.keys(newData) as LabId[]).forEach((labId) => {
                // Filter PCs belonging to this lab from server data
                const labServerPcs = serverPcs.filter(
                  (sp) => sp.location === labId,
                );

                if (labServerPcs.length > 0) {
                  // USE SERVER DATA AS SOURCE OF TRUTH
                  // This adopts server IDs (e.g. "109-PC01") and status
                  newData[labId].pcs = labServerPcs.map((sp) => ({
                    id: sp.id,
                    name: sp.name,
                    ip: sp.ip,
                    mac: sp.mac,
                    status: (sp.status as any) || "online",
                    history: sp.history || [],
                    switchId: sp.switchId,
                    switchPort: sp.switchPort,
                  }));
                } else {
                  // Fallback to local mock data ONLY if server has nothing for this lab
                  // (But try to preserve existing local state if it exists?)
                  // For now, leave as is, or maybe do nothing.
                  // Existing logic kept local PCs. Let's keep existing logic if NO server data found for this lab.
                }
              });
              return newData;
            });
          }
        }

        // Carrega Lab Logs
        const logResponse = await fetch("/api/lab-logs");
        if (logResponse.ok) {
          const serverLogs: LabLogType[] = await logResponse.json();
          if (serverLogs.length > 0) {
            setLabsData((prevData) => {
              const newData = { ...prevData };
              (Object.keys(newData) as LabId[]).forEach((labId) => {
                newData[labId].logs = serverLogs.filter(
                  (l) => l.labId === labId,
                );
              });
              return newData;
            });
          }
        }
        console.log("Dados restaurados do servidor!");
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadServerData();
  }, []);

  // Sincronizar com Backend (Sync Logic)
  useEffect(() => {
    const syncData = async () => {
      try {
        const allPcs = Object.values(labsData).flatMap((lab) =>
          lab.pcs.map((p) => ({
            ...p,
            location:
              Object.keys(labsData).find((key) =>
                labsData[key].pcs.includes(p),
              ) || "",
          })),
        );

        const allLogs = Object.entries(labsData).flatMap(([labId, data]) =>
          data.logs.map((l) => ({ ...l, labId })),
        );

        // Sync PCs
        await fetch("/api/sync-pcs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pcs: allPcs }),
        });

        // Sync Lab Logs
        await fetch("/api/sync-lab-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs: allLogs }),
        });

        console.log("Sincronização com servidor realizada");
      } catch (error) {
        console.error("Erro ao sincronizar:", error);
      }
    };

    // Debounce simples para não spammar o servidor
    const timeout = setTimeout(syncData, 1000);
    return () => clearTimeout(timeout);
  }, [labsData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-20">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Lab Selector */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-md">
                  <Server className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground">
                    IT Dashboard
                  </h1>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="flex bg-muted/50 p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Server className="w-4 h-4 mr-2" />
                  Início
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background shadow-sm"
                >
                  <Server className="w-4 h-4 mr-2" />
                  Labs
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/cameras")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Câmeras
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/aps")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Router className="w-4 h-4 mr-2" />
                  APs
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/technical-rooms")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Server className="w-4 h-4 mr-2" />
                  Switches
                </Button>
              </div>

              <div className="h-8 w-px bg-border" />

              <LabSelector
                selectedLab={selectedLab}
                onSelectLab={handleSelectLab}
              />
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-4">
              <StatusSummary pcs={currentLabData.pcs} />

              <div className="h-8 w-px bg-border" />

              <ReportsModal />

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (
                    confirm(
                      `Tem certeza que deseja ligar TODOS os ${currentLabData.pcs.length} computadores do ${currentLab.name}?`,
                    )
                  ) {
                    toast.info("Iniciando sequência de Wake-on-LAN...");
                    let count = 0;
                    for (const pc of currentLabData.pcs) {
                      if (pc.mac) {
                        // Envia sem esperar resposta para ser rápido
                        fetch("/api/wake", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ mac: pc.mac }),
                        }).catch(console.error);
                        count++;
                        // Pequeno delay para não congestionar a rede
                        await new Promise((r) => setTimeout(r, 50));
                      }
                    }
                    toast.success(`Comando enviado para ${count} máquinas!`);
                  }
                }}
              >
                <Server className="w-4 h-4 mr-2" />
                Ligar
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (
                    confirm(
                      `ATENÇÃO: Isso irá enviar comando de DESLIGAR para TODOS os ${currentLabData.pcs.length} computadores do ${currentLab.name}. Deseja continuar?`,
                    )
                  ) {
                    toast.info("Enviando comandos de desligamento...");
                    let count = 0;
                    for (const pc of currentLabData.pcs) {
                      if (pc.ip) {
                        try {
                          fetch("/api/shutdown", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ip: pc.ip }),
                          }).catch(console.error);
                          count++;
                          await new Promise((r) => setTimeout(r, 50));
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }
                    toast.success(`Comando enviado para ${count} máquinas!`);
                  }
                }}
              >
                <Power className="w-4 h-4 mr-2" />
                Desligar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  toast.info(
                    "Iniciando verificação de status (Relatório apenas)...",
                  );
                  // Não atualizamos o status visual dos PCs, apenas geramos o relatório
                  // O usuário quer controle MANUAL dos status (luzes)

                  const pcsToCheck = [...currentLabData.pcs];
                  let onlineCount = 0;

                  const report = {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    total: pcsToCheck.length,
                    online_after_wake: 0,
                    failures: [] as any[],
                    details: [] as any[],
                  };

                  const promises = pcsToCheck.map(async (pc) => {
                    if (!pc.ip) {
                      report.failures.push({
                        name: pc.name,
                        ip: "N/A",
                        mac: pc.mac,
                        reason: "No IP Configured",
                      });
                      report.details.push({
                        name: pc.name,
                        ip: "N/A",
                        status: "FAILED",
                      });
                      return;
                    }
                    try {
                      const response = await fetch("/api/ping", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ip: pc.ip }),
                      });
                      const data = await response.json();

                      if (data.alive) {
                        onlineCount++;
                        report.online_after_wake++;
                        report.details.push({
                          name: pc.name,
                          ip: pc.ip,
                          status: "SUCCESS",
                        });
                        // NÃO ATUALIZA STATUS VISUAL (MANUAL APENAS)
                      } else {
                        report.failures.push({
                          name: pc.name,
                          ip: pc.ip,
                          mac: pc.mac,
                          reason: "No Ping Response",
                        });
                        report.details.push({
                          name: pc.name,
                          ip: pc.ip,
                          status: "FAILED",
                        });
                      }
                    } catch (e) {
                      report.failures.push({
                        name: pc.name,
                        ip: pc.ip,
                        mac: pc.mac,
                        reason: "Network Error",
                      });
                      report.details.push({
                        name: pc.name,
                        ip: pc.ip,
                        status: "FAILED",
                      });
                    }
                  });

                  await Promise.all(promises);

                  // Não chamamos setLabsData aqui para não alterar as luzes

                  // Salvar relatório
                  try {
                    await fetch("/api/reports", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(report),
                    });
                    toast.success(
                      `Relatório salvo! ${onlineCount} PCs responderam ao ping.`,
                    );
                  } catch (error) {
                    console.error("Erro ao salvar relatório:", error);
                    toast.error("Erro ao salvar relatório");
                  }
                }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Verificar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* PC Grid */}
        <main className="flex-1 overflow-auto p-5">
          <div
            key={selectedLab}
            className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3 animate-fade-in"
          >
            {currentLabData.pcs.map((pc, index) => (
              <div
                key={pc.id}
                style={{ animationDelay: `${index * 10}ms` }}
                className="animate-fade-in"
              >
                <PCCard
                  pc={pc}
                  isSelected={pc.id === selectedPcId}
                  onClick={() => handleSelectPc(pc.id)}
                />
              </div>
            ))}

            {/* Add PC Button - Moved to End */}
            <div className="animate-fade-in flex items-center justify-center">
              <Button
                variant="outline"
                className="w-full h-full min-h-[140px] flex flex-col gap-2 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => {
                  const newId = `${currentLab.id}-PC${String(currentLabData.pcs.length + 1).padStart(2, "0")}`;
                  const newPc: PC = {
                    id: newId,
                    name: newId,
                    ip: "",
                    mac: "",
                    status: "offline",
                    history: [],
                    switchId: "",
                    switchPort: "",
                  };
                  setLabsData({
                    ...labsData,
                    [selectedLab]: {
                      ...currentLabData,
                      pcs: [...currentLabData.pcs, newPc],
                    },
                  });
                  toast.success(`PC ${newId} adicionado!`);
                }}
              >
                <div className="p-3 bg-muted rounded-full">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Adicionar PC
                </span>
              </Button>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-[360px] border-l border-border bg-card flex flex-col shadow-sm">
          {/* Edit Panel */}
          <div className="flex-1 overflow-hidden">
            {selectedPc ? (
              <EditPanel
                key={`${selectedLab}-${selectedPc.id}`}
                pc={selectedPc}
                onSave={handleSavePc}
                onClose={() => setSelectedPcId(null)}
                onWake={async (mac, ip) => {
                  try {
                    const response = await fetch("/api/wake", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ mac, ip }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(
                        errorData.error || "Falha ao enviar comando",
                      );
                    }

                    toast.success(`Comando Wake-on-LAN enviado para ${mac}`);
                  } catch (error) {
                    console.error("WoL Error:", error);
                    toast.error("Erro ao enviar comando Wake-on-LAN");
                  }
                }}
                onPing={async (ip) => {
                  try {
                    const response = await fetch("/api/ping", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ ip }),
                    });

                    if (!response.ok) {
                      throw new Error("Falha ao pingar");
                    }

                    const data = await response.json();
                    if (data.alive) {
                      toast.success(`Ping OK: ${data.time}ms`);
                      return true;
                    } else {
                      toast.error("Host inacessível");
                      return false;
                    }
                  } catch (error) {
                    console.error("Ping Error:", error);
                    toast.error("Erro ao realizar ping");
                    return false;
                  }
                }}
                onShutdown={async (ip) => {
                  try {
                    const response = await fetch("/api/shutdown", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ip }),
                    });

                    if (!response.ok) throw new Error("Falha no comando");

                    toast.success(`Comando DESLIGAR enviado para ${ip}`);
                  } catch (error) {
                    console.error("Shutdown Error:", error);
                    toast.error("Erro ao enviar comando de desligamento");
                  }
                }}
                onDelete={(id) => {
                  const newPcs = currentLabData.pcs.filter((p) => p.id !== id);
                  setLabsData({
                    ...labsData,
                    [selectedLab]: {
                      ...currentLabData,
                      pcs: newPcs,
                    },
                  });
                  setSelectedPcId(null);
                  toast.success("PC removido");
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 gap-6">
                <div className="text-center animate-fade-in">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center">
                    <Server className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Selecione um PC
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    para editar suas configurações
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lab Log */}
          <div className="p-4 border-t border-border bg-muted/30">
            <LabLog
              logs={currentLabData.logs}
              labName={currentLab.name}
              onAddLog={handleAddLabLog}
              onDeleteLog={handleDeleteLabLog}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
