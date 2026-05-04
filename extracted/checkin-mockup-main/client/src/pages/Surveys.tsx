import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart2,
  Construction,
  PlusCircle,
  Eye,
  Download,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { getMe, logout, getHighestRole, getSurveys, isGP, isDP } from "@/lib/api";
import type { User, Survey } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-secondary text-muted-foreground" },
  active: { label: "Ativa", className: "bg-green-100 text-green-800" },
  closed: { label: "Encerrada", className: "bg-slate-100 text-slate-700" },
};

const futureFeatures = [
  {
    title: "Construtor de Pesquisas",
    description: "GP e DP criam pesquisas com perguntas de texto, escala e múltipla escolha.",
    icon: PlusCircle,
  },
  {
    title: "Segmentação de Público",
    description: "Escolha quem responde: equipe, área, ciclo ou colaboradores específicos.",
    icon: Users,
  },
  {
    title: "Acompanhamento de Respostas",
    description: "GP vê quem respondeu e o que respondeu, com controle de anonimato opcional.",
    icon: Eye,
  },
  {
    title: "Exportação e Dashboards",
    description: "Resultados consolidados com exportação para CSV e visualização em dashboard.",
    icon: Download,
  },
];

export default function Surveys() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        setUser(currentUser);
        const s = await getSurveys();
        setSurveys(s);
      } catch {
        setLocation("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const highestRole = getHighestRole(user.roles);
  const isManager = isGP(user.roles) || isDP(user.roles);

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <BarChart2 size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Pesquisas</h1>
        <VersionBadge version="V3" />
      </div>

      <PageIntro text="Espaço futuro para criação, envio, acompanhamento e consolidação de pesquisas internas. GP e DP criam pesquisas; GP controla quem responde e vê os resultados." />

      {/* Status banner */}
      <div className="mb-6 p-5 rounded-xl border border-dashed border-amber-300 bg-amber-50 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Construction size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-amber-900">Módulo em Desenvolvimento — V3</p>
          <p className="text-sm text-amber-800 mt-0.5">
            As pesquisas internas serão implementadas na versão de expansão modular. Abaixo você
            pode ver as pesquisas já cadastradas e o roadmap de funcionalidades.
          </p>
        </div>
      </div>

      {/* Pesquisas existentes (seed) */}
      {surveys.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-foreground mb-4">Pesquisas Cadastradas</h2>
          <div className="space-y-3">
            {surveys.map((survey) => {
              const statusCfg = STATUS_CONFIG[survey.status] || STATUS_CONFIG.draft;
              return (
                <Card key={survey.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground text-sm">{survey.title}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      {survey.description && (
                        <p className="text-xs text-muted-foreground">{survey.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {survey.target_users.length} participantes
                        </span>
                        <span>{survey.response_count} respostas</span>
                        {survey.due_date && (
                          <span>Prazo: {new Date(survey.due_date).toLocaleDateString("pt-BR")}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Construction size={11} /> Em breve
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Roadmap V3 */}
      <section>
        <h2 className="text-base font-bold text-foreground mb-2">Funcionalidades — V3</h2>
        <p className="text-xs text-muted-foreground mb-4">
          O que será disponibilizado na expansão modular.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {futureFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="opacity-70 border-dashed relative">
                <div className="absolute top-3 right-3">
                  <VersionBadge version="V3" />
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-amber-600" />
                  </div>
                  <div className="pr-10">
                    <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Pesquisas simuladas. Módulo completo previsto para V3.
      </div>
    </DashboardLayout>
  );
}
