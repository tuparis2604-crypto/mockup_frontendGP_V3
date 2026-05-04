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
  Brain,
  History,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { Button } from "@/components/ui/button";
import { getMe, logout, getHighestRole } from "@/lib/api";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api";

const teaserBlocks = [
  {
    icon: Target,
    title: "Macros e Metas do Ciclo",
    description:
      "Visualização consolidada de todas as macrocompetências e metas definidas no ciclo anual.",
    version: "V2" as const,
  },
  {
    icon: TrendingUp,
    title: "Evolução por Competência",
    description:
      "Gráfico de progresso individual por competência ao longo do ciclo de desenvolvimento.",
    version: "V2" as const,
  },
  {
    icon: GitBranch,
    title: "Jornada Visual",
    description:
      "Linha do tempo visual conectando assessment, reuniões, registros e formulários.",
    version: "V2" as const,
  },
  {
    icon: Layers,
    title: "Histórico de Ciclos",
    description:
      "Comparativo entre ciclos anteriores e o atual, com evolução de competências ao longo do tempo.",
    version: "V3" as const,
  },
  {
    icon: BarChart2,
    title: "Radar de Competências",
    description:
      "Visão em radar mostrando o nível atual em cada competência versus as metas do ciclo.",
    version: "V3" as const,
  },
  {
    icon: Brain,
    title: "Análise com IA",
    description:
      "Classificação automática, resumo de evolução e sugestões baseadas em padrões de desenvolvimento.",
    version: "V3" as const,
  },
];

const CURRENT_DATA_LOCATION = [
  {
    title: "Ciclo de Assessment",
    description: "Etapas, status e responsáveis do ciclo anual",
    path: "/ciclo-assessment",
    icon: Target,
  },
  {
    title: "Jornada",
    description: "Metas, direcionadores e sugestões",
    path: "/jornada",
    icon: TrendingUp,
  },
  {
    title: "Check-ins",
    description: "Registros contínuos com flags",
    path: "/checkins",
    icon: BarChart2,
  },
  {
    title: "Histórico",
    description: "Linha do tempo de eventos e reuniões",
    path: "/historico",
    icon: History,
  },
];

export default function DevelopmentMap() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      const currentUser = await getMe();
      if (!currentUser) { setLocation("/login"); return; }
      setUser(currentUser);
    };
    init();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  const userName = user?.name || "—";
  const userRole = user ? getHighestRole(user.roles) : "Colaborador";

  return (
    <DashboardLayout userName={userName} userRole={userRole} onLogout={handleLogout}>
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <Map size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Mapa de Desenvolvimento</h1>
        <VersionBadge version="V3" />
      </div>

      <PageIntro text="Página em desenvolvimento para consolidar futuramente uma visão visual da evolução, competências, histórico e plano de desenvolvimento. Os dados já estão disponíveis nas páginas abaixo." />

      {/* Status Banner */}
      <div className="mb-6 p-5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Construction size={20} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-amber-900">Módulo em Desenvolvimento — V2/V3</h2>
          <p className="text-sm text-amber-800 mt-0.5">
            Esta visão integrada será construída progressivamente. As funcionalidades de V2 chegam
            com a integração Supabase; as de V3 na expansão modular.
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400 text-amber-800 hover:bg-amber-100"
            onClick={() => setLocation("/jornada")}
          >
            Jornada <ArrowRight size={12} className="ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400 text-amber-800 hover:bg-amber-100"
            onClick={() => setLocation("/ciclo-assessment")}
          >
            Ciclo <ArrowRight size={12} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Onde os dados estão agora */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground mb-3">Dados disponíveis agora em:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CURRENT_DATA_LOCATION.map((loc) => {
            const Icon = loc.icon;
            return (
              <button
                key={loc.path}
                onClick={() => setLocation(loc.path)}
                className="flex items-center gap-3 p-3.5 bg-secondary/40 rounded-lg border border-border hover:border-accent/30 transition-all text-left"
              >
                <Icon size={18} className="text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{loc.title}</p>
                  <p className="text-xs text-muted-foreground">{loc.description}</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* O que estará aqui */}
      <div className="mb-3">
        <h2 className="text-sm font-bold text-foreground mb-1">Roadmap — O que estará aqui</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Prévia dos blocos que comporão o Mapa de Desenvolvimento nas versões futuras.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teaserBlocks.map((block) => {
          const Icon = block.icon;
          return (
            <Card key={block.title} className="opacity-70 relative overflow-hidden border-dashed">
              <div className="absolute top-3 right-3">
                <VersionBadge version={block.version} />
              </div>
              <div className="flex items-start gap-3 mb-2 pr-12">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-accent" />
                </div>
                <p className="font-bold text-foreground text-sm leading-tight">{block.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">{block.description}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Página placeholder elegante. Mapa completo previsto para V2 (Supabase) e V3 (Expansão).
      </div>
    </DashboardLayout>
  );
}
