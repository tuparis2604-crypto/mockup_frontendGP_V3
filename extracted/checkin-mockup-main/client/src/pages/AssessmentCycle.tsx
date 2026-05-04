import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronRight,
  FileText,
  Users,
  User,
  Calendar,
  Lock,
  Eye,
  FilePen,
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
  getRoleDisplayName,
  getAllUsers,
  getAssessmentCycles,
  isGP,
  isGestor,
  isGestorAuxiliar,
} from "@/lib/api";
import type { User as UserType, AssessmentCycle as CycleType, CycleStepStatus } from "@/lib/api";

const STEP_STATUS_CONFIG: Record<
  CycleStepStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  not_started: {
    label: "Não iniciado",
    icon: <Circle size={14} className="text-muted-foreground" />,
    className: "text-muted-foreground",
  },
  pending: {
    label: "Pendente",
    icon: <Clock size={14} className="text-amber-500" />,
    className: "text-amber-700",
  },
  in_progress: {
    label: "Em andamento",
    icon: <Clock size={14} className="text-blue-500" />,
    className: "text-blue-700",
  },
  completed: {
    label: "Concluído",
    icon: <CheckCircle2 size={14} className="text-green-500" />,
    className: "text-green-700",
  },
  delayed: {
    label: "Atrasado",
    icon: <AlertTriangle size={14} className="text-red-500" />,
    className: "text-red-700",
  },
  draft: {
    label: "Rascunho",
    icon: <FilePen size={14} className="text-indigo-400" />,
    className: "text-indigo-700",
  },
  private: {
    label: "Privado",
    icon: <Lock size={14} className="text-slate-400" />,
    className: "text-slate-700",
  },
  published: {
    label: "Publicado",
    icon: <Eye size={14} className="text-green-500" />,
    className: "text-green-700",
  },
  awaiting_review: {
    label: "Aguardando revisão",
    icon: <Clock size={14} className="text-purple-400" />,
    className: "text-purple-700",
  },
};

const OVERALL_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  not_started: { label: "Não iniciado", className: "bg-secondary text-muted-foreground" },
  in_progress: { label: "Em andamento", className: "bg-blue-100 text-blue-800" },
  completed: { label: "Concluído", className: "bg-green-100 text-green-800" },
};

function StepRow({
  label,
  status,
  description,
}: {
  label: string;
  status: CycleStepStatus;
  description?: string;
}) {
  const cfg = STEP_STATUS_CONFIG[status] || STEP_STATUS_CONFIG.not_started;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <span className={`text-xs font-medium flex-shrink-0 ${cfg.className}`}>{cfg.label}</span>
    </div>
  );
}

function CycleCard({
  cycle,
  employee,
  manager,
  gp,
  expanded,
  onToggle,
  currentUser,
  onNavigate,
}: {
  cycle: CycleType;
  employee: UserType | undefined;
  manager: UserType | undefined;
  gp: UserType | undefined;
  expanded: boolean;
  onToggle: () => void;
  currentUser: UserType;
  onNavigate: (path: string) => void;
}) {
  const overallCfg = OVERALL_STATUS_BADGE[cycle.overall_status] || OVERALL_STATUS_BADGE.not_started;
  const hasDeepFollowup = employee?.deep_followup;

  return (
    <Card className={`transition-all ${hasDeepFollowup ? "border-l-4 border-l-amber-400" : ""}`}>
      {/* Header */}
      <button
        className="w-full text-left"
        onClick={onToggle}
        type="button"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold text-sm">{employee?.name?.charAt(0) || "?"}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground text-sm">{employee?.name || "—"}</p>
                {hasDeepFollowup && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                    Acomp. Profundo
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {employee?.faixa} · {employee?.area} · Ciclo {cycle.year}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${overallCfg.className}`}>
              {overallCfg.label}
            </span>
            <ChevronRight
              size={16}
              className={`text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </div>
        </div>

        {/* Etapa atual */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar size={12} />
          <span>Etapa atual: <strong className="text-foreground">{cycle.current_step}</strong></span>
        </div>

        {/* Responsáveis */}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User size={11} /> GP: <strong className="text-foreground">{gp?.name || "—"}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} /> Gestor: <strong className="text-foreground">{manager?.name || "—"}</strong>
          </span>
        </div>
      </button>

      {/* Expanded: step list */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Etapas do Ciclo
          </p>
          <StepRow
            label="Assessment"
            status={cycle.assessment_status}
            description="Resultado anual do assessment"
          />
          <StepRow
            label="Reunião 1 — GP + Gerido"
            status={cycle.meeting_1_status}
            description="Compreensão do resultado"
          />
          <StepRow
            label="Autoavaliação"
            status={cycle.self_review_status}
            description="Respondida pelo gerido"
          />
          <StepRow
            label="Reunião 2 — GP + Gerido"
            status={cycle.meeting_2_status}
            description="Feedback sobre autoavaliação"
          />
          <StepRow
            label="Avaliação do Gestor"
            status={cycle.manager_review_status}
            description="Respondida pelo gestor — gerido vê apenas se publicada"
          />
          <StepRow
            label="Reunião GP + Gestor"
            status={cycle.meeting_gp_manager_status}
            description="Alinhamento antes da reunião principal"
          />
          <StepRow
            label="Reunião Principal"
            status={cycle.main_meeting_status}
            description="GP + Gestor + Gerido — define jornada"
          />
          <StepRow
            label="Definição da Jornada"
            status={cycle.journey_status}
            description="Áreas, metas, treinamentos e ações"
          />
          <StepRow
            label="Formulário Quadrimestral 1"
            status={cycle.progress_form_1_status}
            description="Respondido pelo gerido a cada 4 meses"
          />
          <StepRow
            label="Formulário Quadrimestral 2"
            status={cycle.progress_form_2_status}
            description="Segundo acompanhamento"
          />

          {/* Ações rápidas contextuais */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Ações rápidas
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Gerido: ver própria autoavaliação e formulário */}
              {cycle.employee_id === currentUser.id && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate("/autoavaliacao")}
                    className="text-xs"
                  >
                    <FilePen size={12} className="mr-1" /> Autoavaliação
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate("/formulario-quadrimestral")}
                    className="text-xs"
                  >
                    <FileText size={12} className="mr-1" /> Formulário Q1
                  </Button>
                </>
              )}
              {/* Gestor: ver avaliação do gestor */}
              {cycle.manager_id === currentUser.id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate("/avaliacao-gestor")}
                  className="text-xs"
                >
                  <FileText size={12} className="mr-1" /> Avaliação do Gestor
                </Button>
              )}
              {/* GP: acesso a todos */}
              {isGP(currentUser.roles) && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate("/autoavaliacao")}
                    className="text-xs"
                  >
                    <Eye size={12} className="mr-1" /> Ver Autoavaliação
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate("/avaliacao-gestor")}
                    className="text-xs"
                  >
                    <FileText size={12} className="mr-1" /> Ver Av. Gestor
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate("/formulario-quadrimestral")}
                    className="text-xs"
                  >
                    <FileText size={12} className="mr-1" /> Ver Formulário Q1
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AssessmentCycle() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [cycles, setCycles] = useState<CycleType[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>("cycle-1");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        setUser(currentUser);
        const [fetchedCycles, users] = await Promise.all([
          getAssessmentCycles({ year: 2026 }),
          getAllUsers(),
        ]);
        setCycles(fetchedCycles);
        setAllUsers(users);
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
  const isGPUser = isGP(user.roles);
  const isGestorUser = isGestor(user.roles) || isGestorAuxiliar(user.roles);

  // Para gerido, mostrar apenas o próprio ciclo
  const visibleCycles = isGPUser
    ? cycles
    : isGestorUser
    ? cycles.filter((c) => {
        const employee = allUsers.find((u) => u.id === c.employee_id);
        return employee?.manager_id === user.id;
      })
    : cycles.filter((c) => c.employee_id === user.id);

  const getUserById = (id?: string) => allUsers.find((u) => u.id === id);

  const completedCount = visibleCycles.filter((c) => c.overall_status === "completed").length;
  const inProgressCount = visibleCycles.filter((c) => c.overall_status === "in_progress").length;
  const notStartedCount = visibleCycles.filter((c) => c.overall_status === "not_started").length;

  return (
    <DashboardLayout
      userName={user.name}
      userRole={highestRole}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <FileText size={24} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Ciclo de Assessment</h1>
        <VersionBadge version="V1" />
      </div>

      <PageIntro text="Acompanhamento das etapas do ciclo anual, do resultado do assessment à definição da jornada de desenvolvimento. Cada pessoa pode estar em uma etapa diferente." />

      {/* Stats (visível para GP/Gestor) */}
      {(isGPUser || isGestorUser) && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Concluídos</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-muted-foreground">{notStartedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Não iniciados</p>
          </Card>
        </div>
      )}

      {/* Legenda de status */}
      <div className="mb-5 flex flex-wrap gap-3 text-xs">
        {(["completed", "in_progress", "delayed", "pending", "draft", "private"] as CycleStepStatus[]).map(
          (s) => {
            const cfg = STEP_STATUS_CONFIG[s];
            return (
              <span key={s} className="flex items-center gap-1 text-muted-foreground">
                {cfg.icon} {cfg.label}
              </span>
            );
          }
        )}
      </div>

      {/* Ciclos */}
      {visibleCycles.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground text-sm">Nenhum ciclo encontrado para este perfil.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {visibleCycles.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              employee={getUserById(cycle.employee_id)}
              manager={getUserById(cycle.manager_id)}
              gp={getUserById(cycle.gp_id)}
              expanded={expandedId === cycle.id}
              onToggle={() =>
                setExpandedId(expandedId === cycle.id ? null : cycle.id)
              }
              currentUser={user}
              onNavigate={setLocation}
            />
          ))}
        </div>
      )}

      {/* Ação rápida */}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" size="sm" onClick={() => setLocation("/checkins")}>
          Ver Check-ins
        </Button>
        <Button variant="outline" size="sm" onClick={() => setLocation("/jornada")}>
          Ver Jornada
        </Button>
        {isGPUser && (
          <Button variant="outline" size="sm" onClick={() => setLocation("/pendencias")}>
            Ver Pendências
          </Button>
        )}
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Dados simulados. Integração futura com Supabase/n8n.
      </div>
    </DashboardLayout>
  );
}
