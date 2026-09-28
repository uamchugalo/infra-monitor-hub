import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Laptop, Camera as CameraIcon, Wifi, Server, Package, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeTab: "home" | "cameras" | "aps" | "switches" | "inventory" | "topology";
  children?: ReactNode;
}

export const Header = ({ activeTab, children }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card shadow-sm sticky top-0 z-20 shrink-0">
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-md">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                IT Dashboard
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Painel de Infraestrutura
              </p>
            </div>
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex bg-muted/50 p-1 rounded-lg">
            <Button
              variant={activeTab === "home" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/")}
              className={activeTab === "home" ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : ""}
            >
              <Laptop className="w-4 h-4 mr-2" />
              Início
            </Button>
            <Button
              variant={activeTab === "cameras" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/cameras")}
              className={activeTab === "cameras" ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : ""}
            >
              <CameraIcon className="w-4 h-4 mr-2" />
              Câmeras
            </Button>
            <Button
              variant={activeTab === "aps" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/aps")}
              className={activeTab === "aps" ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : ""}
            >
              <Wifi className="w-4 h-4 mr-2" />
              APs
            </Button>
            <Button
              variant={activeTab === "switches" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/technical-rooms")}
              className={activeTab === "switches" ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : ""}
            >
              <Server className="w-4 h-4 mr-2" />
              Switches
            </Button>
            <Button
              variant={activeTab === "inventory" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/inventory")}
              className={activeTab === "inventory" ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : ""}
            >
              <Package className="w-4 h-4 mr-2" />
              Inventário
            </Button>
            <Button
              variant={activeTab === "topology" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate("/topology")}
              className={activeTab === "topology" ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : ""}
            >
              <Network className="w-4 h-4 mr-2" />
              Topologia
            </Button>
          </div>
        </div>
        {children && (
          <div className="flex gap-4 items-center">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};
