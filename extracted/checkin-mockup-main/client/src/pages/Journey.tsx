import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Route,
  Target,
  BookOpen,
  Zap,
  CheckCircle2,
  Clock,
  Circle,
  GraduationCap,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { Button } from "@/components/ui/button";
import {
  getMe,
  logout,
  getHighestRole,
  getMacroGoals,
  getSuggestions,
  getActivePeriod,
  getTrainings,
  listCheckins,
  isGP,
  isGestor,
} from "@/lib/api";
import type { User, MacroGoal, PeriodSuggestion, Training } from "@/lib/api";

const GOAL_STATUS_CONFIG = {
  active: { label: "Em andamento", icon: <Clock size={13} className="text-blue-500" />, className: "text-blue-700" },
  achieved: { label: "Alcançado", icon: <CheckCircle2 size={13} className="text-green-500" />, className: "text-green-700" },
  paused: { label: "Pausado", icon: <Circle size={13} className="text-muted-foreground" />, className: "text-muted-foreground" },
};

const SUGGESTION_STATUS_CONFIG = {
  pending: { label: "Pendente", className: "bg-secondary text-muted-foreground" },
  in_progress: { label: "Em andamento", className: "bg-blue-100 text-blue-800" },
  done: { label: "Concluído", className: "bg-green-100 text-green-800" },
};

const FORMAT_LABEL: Record<string, string> = {
  presencial: "Presencial",
  youtube: "YouTube",
  lg: "LG",
  video: "Vídeo",
  link: "Link",
  pdf: "PDF",
  slides: "Slides/PPT",
};

const FORMAT_COLOR: Record<string, string> = {
  presencial: "bg-blue-50 text-blue-700",
  youtube: "bg-red-50 text-red-700",
  lg: "bg-purple-50 text-purple-700",
  video: "bg-indigo-50 text-indigo-700",
  link: "bg-sky-50 text-sky-700",
  pdf: "bg-amber-50 text-amber-700",
  slides: "bg-emerald-50 text-emerald-700",
};

export default function Journey() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<MacroGoal[]>([]);
  const [suggestions, setSuggestions] = useState<PeriodSuggestion[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        setUser(currentUser);

        const period = await getActivePeriod(currentUser.id);
        if (period) {
          const [g, s] = await Promise.all([
            getMacroGoals(period.id),
            getSuggestions(period.id),
          ]);
          setGoals(g);
          setSuggestions(s);
        }

        const t = await getTrainings({ suggested_for: currentUser.id });
        setTrainings(t);
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
  const isElevated = isGP(user.roles) || isGestor(user.roles);

  const achievedGoals = goals.filter((g) => g.status === "achieved").length;
  const activeGoals = goals.filter((g) => g.status === "active").length;

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <Route size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Jornada</h1>
        <VersionBadge version="V1" />
      </div>

      <PageIntro text="Espaço para acompanhar direcionadores, áreas de desenvolvimento, metas, ações recomendadas e evolução ao longo do ciclo. Definida na Reunião Principal." />

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-blue-600">{activeGoals}</p>
          <p className="text-xs text-muted-foreground mt-1">Metas ativas</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-green-600">{achievedGoals}</p>
          <p className="text-xs text-muted-foreground mt-1">Alcançadas</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-bold text-accent">{suggestions.filter((s) => s.status !== "done").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Ações em curso</p>
        </Card>
      </div>

      {/* Metas por macrocompetência */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-accent" />
          <h2 className="text-lg font-bold text-foreground">Metas e Direcionadores</h2>
        </div>

        {goals.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              Nenhuma meta definida. A jornada é definida na Reunião Principal.
            </p>
            {isElevated && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setLocation("/ciclo-assessment")}
              >
                Ver Ciclo de Assessment
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const statusCfg = GOAL_STATUS_CONFIG[goal.status] || GOAL_STATUS_CONFIG.active;
              return (
                <Card key={goal.id}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap size={16} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold text-accent">{goal.macro}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className={`flex items-center gap-1 text-xs ${statusCfg.className}`}>
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{goal.description}</p>
                      {goal.target && (
                        <p className="mt-1.5 text-xs text-muted-foreground flex items-start gap-1">
                          <Target size={11} className="mt-0.5 flex-shrink-0" />
                          {goal.target}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Ações sugeridas */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-accent" />
          <h2 className="text-lg font-bold text-foreground">Ações e Sugestões</h2>
        </div>

        {suggestions.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-muted-foreground text-sm">Nenhuma sugestão registrada ainda.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {suggestions.map((sug) => {
              const statusCfg =
                SUGGESTION_STATUS_CONFIG[sug.status] || SUGGESTION_STATUS_CONFIG.pending;
              return (
                <div
                  key={sug.id}
                  className="flex items-center gap-3 p-3 bg-secondary/40 rounded-lg border border-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{sug.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Origem: {sug.source === "kickoff" ? "Reunião inicial" : sug.source === "intermediate" ? "Reunião intermediária" : "Sistema"}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Treinamentos sugeridos */}
      {trainings.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-accent" />
            <h2 className="text-lg font-bold text-foreground">Treinamentos Indicados</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trainings.slice(0, 4).map((t) => (
              <Card key={t.id} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={16} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{t.title}</p>
                  {t.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.description}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${FORMAT_COLOR[t.format] || "bg-secondary text-muted-foreground"}`}>
                      {FORMAT_LABEL[t.format] || t.format}
                    </span>
                    {t.duration_minutes && (
                      <span className="text-xs text-muted-foreground">
                        {t.duration_minutes >= 60
                          ? `${Math.round(t.duration_minutes / 60)}h`
                          : `${t.duration_minutes}min`}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {trainings.length > 4 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => setLocation("/treinamentos")}
            >
              Ver todos os treinamentos <ArrowRight size={14} className="ml-1" />
            </Button>
          )}
        </section>
      )}

      {/* Acesso rápido */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={18} className="text-accent" />
          <h2 className="text-lg font-bold text-foreground">Acesso Rápido</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLocation("/checkins")}
            className="flex items-center gap-3 p-4 bg-secondary/40 rounded-lg border border-border hover:border-accent/40 transition-all text-left"
          >
            <MessageSquare size={20} className="text-accent flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Check-ins</p>
              <p className="text-xs text-muted-foreground">Registros contínuos da jornada</p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground ml-auto flex-shrink-0" />
          </button>
          <button
            type="button"
            onClick={() => setLocation("/ciclo-assessment")}
            className="flex items-center gap-3 p-4 bg-secondary/40 rounded-lg border border-border hover:border-accent/40 transition-all text-left"
          >
            <Target size={20} className="text-accent flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Ciclo de Assessment</p>
              <p className="text-xs text-muted-foreground">Etapas e status do ciclo anual</p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground ml-auto flex-shrink-0" />
          </button>
        </div>
      </section>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Dados simulados. Histórico profissional e mapa completo chegarão em versões futuras.
      </div>
    </DashboardLayout>
  );
}
