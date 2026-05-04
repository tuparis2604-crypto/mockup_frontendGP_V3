import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ClipboardList,
  MessageSquare,
  Route,
  BarChart3,
  AlertCircle,
  Clock,
  ChevronRight,
  History,
  Map,
  GraduationCap,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import {
  getMe,
  logout,
  getHighestRole,
  getRoleDisplayName,
  getActivePeriod,
  listCheckins,
  getAssessmentCycles,
  getProgressForms,
  isGP,
  isGestor,
  isGestorAuxiliar,
  getDeepFollowups,
} from "@/lib/api";
import type { User, DevelopmentPeriod, Checkin, AssessmentCycle, ProgressForm } from "@/lib/api";

function periodProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [period, setPeriod] = useState<DevelopmentPeriod | null>(null);
  const [records, setRecords] = useState<Checkin[]>([]);
  const [cycles, setCycles] = useState<AssessmentCycle[]>([]);
  const [progressForms, setProgressForms] = useState<ProgressForm[]>([]);
  const [deepFollowupCount, setDeepFollowupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getMe();
        if (currentUser) {
          setUser(currentUser);
          const [p, r, c, pf] = await Promise.all([
            getActivePeriod(currentUser.id),
            listCheckins({ user_id: currentUser.id }),
            getAssessmentCycles({ year: 2026 }),
            getProgressForms({ employee_id: currentUser.id }),
          ]);
          setPeriod(p);
          setRecords(r);
          setCycles(c);
          setProgressForms(pf);

          if (isGP(currentUser.roles)) {
            const followups = await getDeepFollowups();
            setDeepFollowupCount(followups.filter((f) => f.status === "active").length);
          }
        } else {
          setLocation("/login");
        }
      } catch {
        setLocation("/login");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) return null;

  const highestRole = getHighestRole(user.roles);
  const displayRole = getRoleDisplayName(highestRole);
  const isGPUser = isGP(user.roles);
  const isGestorUser = isGestor(user.roles) || isGestorAuxiliar(user.roles);

  const draftCount = records.filter((r) => r.status === "draft").length;
  const greenCount = records.filter((r) => r.flag === "green" && r.status === "published").length;
  const redCount = records.filter((r) => r.flag === "red").length;
  const progress = period ? periodProgress(period.start_date, period.end_date) : 0;

  const myCycle = cycles.find((c) => c.employee_id === user.id);
  const pendingProgressForm = progressForms.find((f) => f.status === "not_started");

  // Alertas calculados
  const alerts: { type: "warning" | "critical" | "success"; title: string; description: string }[] = [];

  if (draftCount > 0) {
    alerts.push({
      type: "warning",
      title: `${draftCount} rascunho${draftCount > 1 ? "s" : ""} aguardando publicação`,
      description: "Revise e publique quando estiver pronto.",
    });
  }
  if (redCount > 0) {
    alerts.push({
      type: "critical",
      title: `${redCount} check-in${redCount > 1 ? "s" : ""} de flag vermelha`,
      description: "Registros críticos requerem atenção.",
    });
  }
  if (myCycle?.self_review_status === "pending" || myCycle?.self_review_status === "not_started") {
    alerts.push({
      type: "warning",
      title: "Autoavaliação pendente",
      description: "Sua autoavaliação do ciclo ainda não foi enviada.",
    });
  }
  if (pendingProgressForm) {
    alerts.push({
      type: "warning",
      title: "Formulário quadrimestral não enviado",
      description: "O formulário de avanço deste quadrimestre aguarda seu preenchimento.",
    });
  }
  if (greenCount >= 3) {
    alerts.push({
      type: "success",
      title: `${greenCount} check-ins verdes publicados`,
      description: "Bom ritmo de registros positivos no período.",
    });
  }
  if (isGPUser && deepFollowupCount > 0) {
    alerts.push({
      type: "warning",
      title: `${deepFollowupCount} colaborador${deepFollowupCount > 1 ? "es" : ""} em acompanhamento profundo`,
      description: "Verificar status dos acompanhamentos em andamento.",
    });
  }

  const quickLinks = [
    {
      label: "Ciclo de Assessment",
      description: "Etapas e status do ciclo anual",
      path: "/ciclo-assessment",
      icon: <ClipboardList size={20} className="text-accent" />,
      show: true,
    },
    {
      label: "Check-ins",
      description: "Registros contínuos com flags",
      path: "/checkins",
      icon: <MessageSquare size={20} className="text-accent" />,
      show: true,
    },
    {
      label: "Jornada",
      description: "Metas, direcionadores e ações",
      path: "/jornada",
      icon: <Route size={20} className="text-accent" />,
      show: true,
    },
    {
      label: "Histórico",
      description: "Linha do tempo do ciclo",
      path: "/historico",
      icon: <History size={20} className="text-accent" />,
      show: true,
    },
    {
      label: "Pendências",
      description: "Controle operacional por colaborador",
      path: "/pendencias",
      icon: <AlertCircle size={20} className="text-accent" />,
      show: isGPUser,
    },
    {
      label: "Dashboards",
      description: "Visão organizacional",
      path: "/dashboards",
      icon: <BarChart3 size={20} className="text-accent" />,
      show: isGPUser || isGestorUser,
    },
    {
      label: "Mapa de Desenvolvimento",
      description: "Visão integrada — em breve",
      path: "/mapa-desenvolvimento",
      icon: <Map size={20} className="text-muted-foreground" />,
      show: true,
      future: true,
    },
    {
      label: "Treinamentos",
      description: "Catálogo e trilhas",
      path: "/treinamentos",
      icon: <GraduationCap size={20} className="text-muted-foreground" />,
      show: true,
      future: true,
    },
  ].filter((l) => l.show);

  return (
    <DashboardLayout
      userName={user.name}
      userRole={highestRole}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-foreground mb-1">Bem-vindo, {user.name}!</h1>
        <p className="text-sm text-muted-foreground">{displayRole} · Ciclo 2026</p>
      </div>

      <PageIntro text="Visão consolidada do ciclo de desenvolvimento, pendências, alertas e principais indicadores por perfil." />

      {/* Ciclo atual / Período */}
      {myCycle ? (
        <Card className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-accent" />
              <span className="font-semibold text-foreground text-sm">Meu Ciclo 2026</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {myCycle.overall_status === "in_progress" ? "Em andamento" : myCycle.overall_status === "completed" ? "Concluído" : "Não iniciado"}
              </span>
            </div>
            <button
              onClick={() => setLocation("/ciclo-assessment")}
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
            >
              Ver detalhes <ChevronRight size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span>Etapa atual:</span>
            <strong className="text-foreground">{myCycle.current_step}</strong>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-lg font-bold text-green-700">{greenCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">Check-ins verdes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock size={12} className="text-amber-500" />
                <p className="text-lg font-bold text-amber-700">{draftCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-lg font-bold text-red-700">{redCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">Vermelhos</p>
            </div>
          </div>

          {period && (
            <div className="mt-3">
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div
                  className="bg-accent rounded-full h-1.5 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {progress}% · {new Date(period.start_date).toLocaleDateString("pt-BR")} – {new Date(period.end_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </Card>
      ) : period ? (
        <Card className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={16} className="text-accent" />
            <span className="font-semibold text-foreground text-sm">Período Ativo</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
            <div className="bg-accent rounded-full h-1.5" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progress}% · {new Date(period.start_date).toLocaleDateString("pt-BR")} – {new Date(period.end_date).toLocaleDateString("pt-BR")}
          </p>
        </Card>
      ) : (
        <Card className="mb-5 border-dashed border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900 font-medium mb-1">Nenhum ciclo ativo</p>
          <p className="text-xs text-amber-700">Solicite ao GP o início do ciclo de desenvolvimento.</p>
        </Card>
      )}

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-foreground mb-3">Alertas e Pendências</h2>
          <div className="space-y-2">
            {alerts.slice(0, 4).map((alert, idx) => (
              <div
                key={idx}
                className={`flex gap-3 p-3 rounded-lg border-l-4 ${
                  alert.type === "critical"
                    ? "bg-red-50 border-l-red-500"
                    : alert.type === "warning"
                    ? "bg-amber-50 border-l-amber-500"
                    : "bg-green-50 border-l-green-500"
                }`}
              >
                {alert.type === "critical" ? (
                  <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                ) : alert.type === "success" ? (
                  <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold text-sm ${
                    alert.type === "critical" ? "text-red-900" : alert.type === "success" ? "text-green-900" : "text-amber-900"
                  }`}>
                    {alert.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    alert.type === "critical" ? "text-red-800" : alert.type === "success" ? "text-green-800" : "text-amber-800"
                  }`}>
                    {alert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navegação rápida */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground mb-3">Navegação Rápida</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.path}
              type="button"
              onClick={() => setLocation(link.path)}
              className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all hover:shadow-sm ${
                link.future
                  ? "border-dashed border-border/60 opacity-75 hover:opacity-100"
                  : "border-border hover:border-accent/30"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">{link.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-sm leading-tight">{link.label}</p>
                  {link.future && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
                      V3
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Todos os dados são salvos localmente no navegador. Integração futura com Supabase/n8n.
      </div>
    </DashboardLayout>
  );
}
