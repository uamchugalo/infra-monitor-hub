import { useNavigate } from "react-router-dom";
import {
  Server,
  Video,
  Router,
  Network,
  Activity,
  ShieldCheck,
  Box,
  ExternalLink,
  Package,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";

const Home = () => {
  const navigate = useNavigate();

  const modules = [
    /*{
            title: "Laboratórios",
            description: "Gerenciamento de máquinas e infraestrutura dos laboratórios.",
            icon: <Server className="w-6 h-6" />,
            path: "/labs",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "hover:border-blue-200"
        },*/
    {
      title: "Câmeras",
      description: "Monitoramento em tempo real e status das câmeras IP.",
      icon: <Video className="w-6 h-6" />,
      path: "/cameras",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "hover:border-amber-200",
    },
    {
      title: "Access Points",
      description: "Gestão de conectividade Wi-Fi e pontos de acesso.",
      icon: <Router className="w-6 h-6" />,
      path: "/aps",
      color: "text-sky-600",
      bg: "bg-sky-50",
      border: "hover:border-sky-200",
    },
    {
      title: "Salas Técnicas",
      description: "Mapeamento físico de Switches e Patch Panels.",
      icon: <Network className="w-6 h-6" />,
      path: "/technical-rooms",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "hover:border-purple-200",
    },
    {
      title: "Topologia de Rede",
      description:
        "Visualização dinâmica da conexão entre switches e dispositivos.",
      icon: <Activity className="w-6 h-6" />,
      path: "/topology",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "hover:border-emerald-200",
    },
    {
      title: "Inventário",
      description: "Gestão completa de equipamentos e busca global.",
      icon: <Package className="w-6 h-6" />,
      path: "/inventory",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "hover:border-indigo-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header Sincronizado */}
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-20">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-md shadow-sm">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground">
                    IT Dashboard
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Painel de Infraestrutura
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex bg-muted/50 p-1 rounded-lg">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background shadow-sm"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase">
                  Sistemas Online
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="text-muted-foreground ml-2">
                <Settings className="w-4 h-4" />
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-8 md:p-12 lg:p-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
            Bem-vindo ao Dashboard de TI
          </h2>
          <p className="text-zinc-500 font-medium">
            Selecione o módulo de infraestrutura que deseja gerenciar hoje.
          </p>
        </div>

        {/* Grid of Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module, i) => (
            <div
              key={i}
              onClick={() => navigate(module.path)}
              className={`group relative flex items-start gap-6 p-8 rounded-2xl border border-zinc-200 bg-white cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 ${module.border}`}
            >
              <div
                className={`shrink-0 w-14 h-14 rounded-xl ${module.bg} ${module.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
              >
                {module.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-zinc-900">
                    {module.title}
                  </h3>
                  <div className="p-1 rounded-full bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
                  </div>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                  {module.description}
                </p>
                <div className="inline-flex items-center text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors uppercase tracking-widest">
                  Acessar agora &rarr;
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="p-8 text-center text-zinc-400">
        <p className="text-[11px] font-bold uppercase tracking-widest">
          Dashboard TI &copy; {new Date().getFullYear()} - Infra Monitor Hub
        </p>
      </footer>
    </div>
  );
};

export default Home;
