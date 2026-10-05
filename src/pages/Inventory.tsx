import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Activity, Search, RefreshCw, Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Header } from "@/components/Header";

interface InventoryItem {
  id: string;
  name: string | null;
  ip: string | null;
  location: string | null;
  patrimony: string | null;
  serialNumber: string | null;
  manufacturer: string | null;
  model: string | null;
  macAddress: string | null;
  consolePort: string | null;
  sfp: string | null;
  general: string | null;
  status: string;
  pingStatus?: string;
  connectedSwitch?: string;
  connectedPort?: string;
}

const Inventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [mappedDevices, setMappedDevices] = useState<any[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("Em Uso");
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    ip: "",
    location: "",
    patrimony: "",
    serialNumber: "",
    manufacturer: "",
    model: "",
    macAddress: "",
    consolePort: "",
    sfp: "",
    general: "",
    status: "Em Estoque",
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        toast.error("Erro ao buscar inventário.");
      }

      const devRes = await Promise.all([
        fetch("/api/switches").then(r => r.ok ? r.json() : []),
        fetch("/api/aps").then(r => r.ok ? r.json() : []),
        fetch("/api/cameras").then(r => r.ok ? r.json() : []),
        fetch("/api/pcs").then(r => r.ok ? r.json() : []),
      ]);
      setMappedDevices(devRes.flat());

    } catch (error) {
      toast.error("Falha de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEdit = async () => {
    if (!formData.name && !formData.ip) {
      toast.error("O item precisa ter pelo menos nome ou IP.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const isEditing = !!formData.id;
      const url = isEditing ? `/api/inventory/${formData.id}` : "/api/inventory";
      const method = isEditing ? "PUT" : "POST";
      
      const payload = { ...formData };
      delete payload.pingStatus;
      delete payload.connectedSwitch;
      delete payload.connectedPort;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(`Item ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
        setIsAddModalOpen(false);
        setFormData({
          name: "", ip: "", location: "", patrimony: "", serialNumber: "",
          manufacturer: "", model: "", macAddress: "", consolePort: "", sfp: "", general: "", status: "Em Estoque"
        });
        fetchInventory();
      } else {
        toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} item.`);
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (item: InventoryItem) => {
    setFormData(item);
    setIsAddModalOpen(true);
  };

  const handleNewClick = () => {
    setFormData({
      name: "", ip: "", location: "", patrimony: "", serialNumber: "",
      manufacturer: "", model: "", macAddress: "", consolePort: "", sfp: "", general: "", status: "Em Estoque"
    });
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item? Essa ação também apagará o dispositivo do sistema se ele estiver cadastrado.")) return;
    
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Item excluído com sucesso!");
        fetchInventory(); // Reload list
      } else {
        toast.error("Erro ao excluir item.");
      }
    } catch (error) {
      toast.error("Erro na comunicação com o servidor.");
    }
  };

  const filteredItems = items.filter((item) => {
    if (item.status !== activeTab) return false;
    
    // Category Filter Logic
    if (categoryFilter !== "Todos") {
      const name = (item.name || "").toLowerCase();
      const model = (item.model || "").toLowerCase();
      
      let isMatch = false;
      if (categoryFilter === "APs") isMatch = name.includes("ap ") || name.startsWith("ap-") || name.startsWith("ap") || model.includes("access point");
      else if (categoryFilter === "Câmeras") isMatch = name.includes("cam") || model.includes("câmera") || model.includes("camera");
      else if (categoryFilter === "Switches") isMatch = name.includes("sw") || model.includes("switch");
      else if (categoryFilter === "Computadores") isMatch = name.includes("pc") || name.includes("desktop") || name.includes("notebook") || model.includes("computador");
      else if (categoryFilter === "Outros") {
        const isAp = name.includes("ap ") || name.startsWith("ap-") || name.startsWith("ap") || model.includes("access point");
        const isCam = name.includes("cam") || model.includes("câmera") || model.includes("camera");
        const isSw = name.includes("sw") || model.includes("switch");
        const isPc = name.includes("pc") || name.includes("desktop") || name.includes("notebook") || model.includes("computador");
        isMatch = !isAp && !isCam && !isSw && !isPc;
      }
      
      if (!isMatch) return false;
    }

    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return Object.values(item).some(
      (val) => val !== null && String(val).toLowerCase().includes(lowerSearch),
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Header activeTab="inventory">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar qualquer coisa..."
            className="pl-9 h-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todas as Categorias</SelectItem>
            <SelectItem value="APs">Access Points</SelectItem>
            <SelectItem value="Câmeras">Câmeras</SelectItem>
            <SelectItem value="Switches">Switches</SelectItem>
            <SelectItem value="Computadores">Computadores</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInventory}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleNewClick} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Editar Equipamento" : "Adicionar Equipamento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {formData.status === "Em Estoque" && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md space-y-2">
                  <label className="text-sm font-medium text-indigo-900">Vincular a equipamento configurado no Mapa (Opcional)</label>
                  <select 
                    className="w-full h-9 rounded-md border text-sm px-3 bg-white"
                    onChange={(e) => {
                      const dev = mappedDevices.find(d => d.id === e.target.value);
                      if (dev) {
                        setFormData({
                          ...formData,
                          name: dev.name,
                          ip: dev.ip || formData.ip,
                          location: dev.location || formData.location,
                          status: "Em Uso"
                        });
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled hidden>Selecione um equipamento do mapa...</option>
                    {mappedDevices.map(d => (
                      <option key={d.id} value={d.id}>{d.name} {d.ip ? `(${d.ip})` : ''}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                    className="w-full h-9 rounded-md border text-sm px-3 bg-white"
                    value={formData.status || "Em Estoque"}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Em Estoque">Em Estoque / Não Uso</option>
                    <option value="Em Uso">Em Uso</option>
                  </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome / Hostname</label>
                <Input value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">IP</label>
                <Input value={formData.ip || ""} onChange={(e) => setFormData({...formData, ip: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Localização</label>
                <Input value={formData.location || ""} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Patrimônio</label>
                <Input value={formData.patrimony || ""} onChange={(e) => setFormData({...formData, patrimony: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nº de Série</label>
                <Input value={formData.serialNumber || ""} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fabricante</label>
                <Input value={formData.manufacturer || ""} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo</label>
                <Input value={formData.model || ""} onChange={(e) => setFormData({...formData, model: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço MAC</label>
                <Input value={formData.macAddress || ""} onChange={(e) => setFormData({...formData, macAddress: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Porta Console</label>
                <Input value={formData.consolePort || ""} onChange={(e) => setFormData({...formData, consolePort: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SFP</label>
                <Input value={formData.sfp || ""} onChange={(e) => setFormData({...formData, sfp: e.target.value})} />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Observações Gerais</label>
                <Input value={formData.general || ""} onChange={(e) => setFormData({...formData, general: e.target.value})} />
              </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateOrEdit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Salvar Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full p-6">
        <div className="mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="Em Uso">Em Uso</TabsTrigger>
              <TabsTrigger value="Em Estoque">Em Estoque</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  <TableHead className="whitespace-nowrap font-bold">
                    Nome
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    IP
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Status (Ping)
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Switch
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Porta (SW)
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Localização
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Patrimônio
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Nº Série
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Fabricante
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Modelo
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    MAC
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Porta Console
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    SFP
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold">
                    Geral
                  </TableHead>
                  <TableHead className="whitespace-nowrap font-bold text-center">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Carregando inventário...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={15}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-zinc-50/50">
                      <TableCell className="font-medium whitespace-nowrap">
                        {item.name || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-500 whitespace-nowrap">
                        {item.ip || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.pingStatus?.toLowerCase() === "online" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Online
                          </span>
                        ) : item.pingStatus?.toLowerCase() === "offline" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Offline
                          </span>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-500 whitespace-nowrap">
                        {item.connectedSwitch || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-500 whitespace-nowrap">
                        {item.connectedPort || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.location || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-500 whitespace-nowrap">
                        {item.patrimony || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-500 whitespace-nowrap">
                        {item.serialNumber || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.manufacturer || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.model || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500 whitespace-nowrap">
                        {item.macAddress || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-500 whitespace-nowrap">
                        {item.consolePort || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-500 whitespace-nowrap">
                        {item.sfp || "-"}
                      </TableCell>
                      <TableCell
                        className="text-zinc-500 max-w-xs truncate"
                        title={item.general || ""}
                      >
                        {item.general || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditClick(item)}
                            className="h-8 w-8 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(item.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 border-t bg-zinc-50 text-xs text-zinc-500 flex justify-between items-center">
            <span>
              Exibindo {filteredItems.length} de {items.length} itens
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
