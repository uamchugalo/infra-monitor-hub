import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Activity, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

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
}

const Inventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        toast.error("Erro ao buscar inventário.");
      }
    } catch (error) {
      toast.error("Falha de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return Object.values(item).some(
      (val) => val !== null && String(val).toLowerCase().includes(lowerSearch),
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-20">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-md shadow-sm">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground">
                    Inventário
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Gestão de Equipamentos
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex bg-muted/50 p-1 rounded-lg">
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                  <Activity className="w-4 h-4 mr-2" />
                  Início
                </Button>
                <Button variant="secondary" size="sm">
                  <Package className="w-4 h-4 mr-2" />
                  Inventário
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar qualquer coisa..."
                  className="pl-9 h-9 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full p-6">
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
                      colSpan={11}
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
