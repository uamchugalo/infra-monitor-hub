import { useState, useEffect } from 'react';
import { PC, LabLog as LabLogType } from '@/types/pc';
import { generateInitialPCs } from '@/utils/pcData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PCCard } from '@/components/PCCard';
import { EditPanel } from '@/components/EditPanel';
import { LabLog } from '@/components/LabLog';
import { StatusSummary } from '@/components/StatusSummary';
import { Server, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [pcs, setPcs] = useLocalStorage<PC[]>('lab-pcs', generateInitialPCs());
  const [labLogs, setLabLogs] = useLocalStorage<LabLogType[]>('lab-logs', []);
  const [selectedPcId, setSelectedPcId] = useState<number | null>(null);

  const selectedPc = pcs.find(p => p.id === selectedPcId) || null;

  const handleSelectPc = (id: number) => {
    setSelectedPcId(id === selectedPcId ? null : id);
  };

  const handleSavePc = (updatedPc: PC) => {
    setPcs(pcs.map(p => p.id === updatedPc.id ? updatedPc : p));
    toast.success(`PC #${String(updatedPc.id).padStart(2, '0')} atualizado`);
  };

  const handleAddLabLog = (log: LabLogType) => {
    setLabLogs([log, ...labLogs]);
    toast.success('Log do laboratório adicionado');
  };

  const handleDeleteLabLog = (id: string) => {
    setLabLogs(labLogs.filter(l => l.id !== id));
  };

  const handleResetData = () => {
    if (confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
      setPcs(generateInitialPCs());
      setLabLogs([]);
      setSelectedPcId(null);
      toast.success('Dados resetados com sucesso');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Dashboard de Infraestrutura
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Laboratório de Informática • 40 Estações
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <StatusSummary pcs={pcs} />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetData}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* PC Grid */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
            {pcs.map((pc) => (
              <PCCard
                key={pc.id}
                pc={pc}
                isSelected={pc.id === selectedPcId}
                onClick={() => handleSelectPc(pc.id)}
              />
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-96 border-l border-border bg-sidebar flex flex-col">
          {/* Edit Panel */}
          <div className="flex-1 overflow-hidden">
            {selectedPc ? (
              <EditPanel
                key={selectedPc.id}
                pc={selectedPc}
                onSave={handleSavePc}
                onClose={() => setSelectedPcId(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Server className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selecione um PC para editar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lab Log */}
          <div className="border-t border-border">
            <LabLog
              logs={labLogs}
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
