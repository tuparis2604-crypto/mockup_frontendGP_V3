import { useLocation } from "wouter";
import {
  Map,
  Construction,
  Target,
  BarChart2,
  GitBranch,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";

const teaserBlocks = [
  {
    icon: Target,
    title: "Macros e Metas do Período",
    description:
      "Visualização consolidada de todas as macrocompetências e metas definidas na reunião inicial.",
    available: false,
  },
  {
    icon: TrendingUp,
    title: "Evolução por Competência",
    description:
      "Gráfico de progresso individual por competência ao longo do período de 6 meses.",
    available: false,
  },
  {
    icon: GitBranch,
    title: "Jornada de Desenvolvimento",
    description:
      "Linha do tempo visual conectando assessment, kickoff, registros e reuniões intermediárias.",
    available: false,
  },
  {
    icon: Layers,
    title: "Histórico de Períodos",
    description:
      "Comparativo entre períodos anteriores e o atual, com evolução de competências ao longo do tempo.",
    available: false,
  },
  {
    icon: BarChart2,
    title: "Radar de Competências",
    description:
      "Visão em radar mostrando o nível atual em cada competência versus as metas do período.",
    available: false,
  },
];

export default function DevelopmentMap() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/login");
  };

  return (
    <DashboardLayout
      userName="João"
      userRole="RH"
      onLogout={handleLogout}
    >
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Map size={28} className="text-accent" />
          <h1 className="text-3xl font-bold text-foreground">Mapa de Desenvolvimento</h1>
        </div>
        <p className="text-muted-foreground">
          Visão integrada da jornada de desenvolvimento por período.
        </p>
      </div>

      {/* Status Banner */}
      <div className="mb-8 p-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Construction size={24} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-900">Página em Desenvolvimento</h2>
            <p className="text-sm text-amber-800 mt-0.5">
              Esta área está sendo construída. Os dados do período já estão disponíveis
              nas páginas de Progresso e Gerido.
            </p>
          </div>
        </div>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400 text-amber-800 hover:bg-amber-100"
            onClick={() => setLocation("/progresso")}
          >
            Meu Progresso
            <ArrowRight size={14} className="ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400 text-amber-800 hover:bg-amber-100"
            onClick={() => setLocation("/dashboard-pessoal")}
          >
            Dashboard Pessoal
            <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* O que estará aqui */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground mb-1">O que estará aqui</h2>
        <p className="text-sm text-muted-foreground">
          Prévia dos blocos que comporão o Mapa de Desenvolvimento quando finalizado.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {teaserBlocks.map((block) => {
          const Icon = block.icon;
          return (
            <Card
              key={block.title}
              className="opacity-70 relative overflow-hidden border-dashed"
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-lg">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                  Em breve
                </span>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{block.title}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{block.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Onde os dados estão agora */}
      <Card className="bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3">Enquanto isso, os dados do período estão em:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setLocation("/progresso")}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors text-left"
          >
            <TrendingUp size={18} className="text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Meu Progresso</p>
              <p className="text-xs text-blue-700">Assessment, kickoff, macros, registros do período</p>
            </div>
            <ArrowRight size={14} className="text-blue-400 ml-auto flex-shrink-0" />
          </button>
          <button
            onClick={() => setLocation("/dashboard-pessoal")}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors text-left"
          >
            <BarChart2 size={18} className="text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Dashboard Pessoal</p>
              <p className="text-xs text-blue-700">Métricas, evolução e sugestões do período</p>
            </div>
            <ArrowRight size={14} className="text-blue-400 ml-auto flex-shrink-0" />
          </button>
        </div>
      </Card>
    </DashboardLayout>
  );
}
