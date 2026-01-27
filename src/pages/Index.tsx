import { useState } from 'react';
import { PC, LabLog as LabLogType, LabData } from '@/types/pc';
import { generateInitialPCs, LABS, LabId } from '@/utils/pcData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PCCard } from '@/components/PCCard';
import { EditPanel } from '@/components/EditPanel';
import { LabLog } from '@/components/LabLog';
import { StatusSummary } from '@/components/StatusSummary';
import { LabSelector } from '@/components/LabSelector';
import { Server, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const initializeLabData = (): Record<LabId, LabData> => {
  const data: Record<string, LabData> = {};
  LABS.forEach(lab => {
    data[lab.id] = {
      pcs: generateInitialPCs(lab.id),
      logs: [],
    };
  });
  return data as Record<LabId, LabData>;
};

const Index = () => {
  const [labsData, setLabsData] = useLocalStorage<Record<LabId, LabData>>('labs-data', initializeLabData());
  const [selectedLab, setSelectedLab] = useState<LabId>('109');
  const [selectedPcId, setSelectedPcId] = useState<number | null>(null);

  const currentLabData = labsData[selectedLab];
  const currentLab = LABS.find(l => l.id === selectedLab)!;
  const selectedPc = currentLabData.pcs.find(p => p.id === selectedPcId) || null;

  const handleSelectLab = (labId: LabId) => {
    setSelectedLab(labId);
    setSelectedPcId(null);
  };

  const handleSelectPc = (id: number) => {
    setSelectedPcId(id === selectedPcId ? null : id);
  };

  const handleSavePc = (updatedPc: PC) => {
    setLabsData({
      ...labsData,
      [selectedLab]: {
        ...currentLabData,
        pcs: currentLabData.pcs.map(p => p.id === updatedPc.id ? updatedPc : p),
      },
    });
    toast.success(`PC #${String(updatedPc.id).padStart(2, '0')} salvo`);
  };

  const handleAddLabLog = (log: LabLogType) => {
    setLabsData({
      ...labsData,
      [selectedLab]: {
        ...currentLabData,
        logs: [log, ...currentLabData.logs],
      },
    });
    toast.success('Evento registrado');
  };

  const handleDeleteLabLog = (id: string) => {
    setLabsData({
      ...labsData,
      [selectedLab]: {
        ...currentLabData,
        logs: currentLabData.logs.filter(l => l.id !== id),
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
                  <p className="text-xs text-muted-foreground">
                    {currentLab.description}
                  </p>
                </div>
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
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetLab}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
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
              />
            ) : (
              <div className="h-full flex items-center justify-center p-6">
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
