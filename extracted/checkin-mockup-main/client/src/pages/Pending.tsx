import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
  MessageSquare,
  CalendarCheck,
  User,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import {
  getMe,
  logout,
  getHighestRole,
  getAllUsers,
  getAssessmentCycles,
  getProgressForms,
  getMeetings,
  listCheckins,
  isGP,
} from "@/lib/api";
import type { User as UserType, AssessmentCycle, ProgressForm } from "@/lib/api";

interface PendingItem {
  userId: string;
  userName: string;
  area?: string;
  managerName?: string;
  assessment: "ok" | "pending" | "delayed";
  selfReview: "ok" | "pending" | "not_started";
  managerReview: "ok" | "draft" | "not_started";
  progressForm: "ok" | "not_started" | "draft";
  mainMeeting: "ok" | "pending";
  redCheckins: number;
  yellowCheckins: number;
  deepFollowup: boolean;
}

function StatusDot({
  status,
}: {
  status: "ok" | "pending" | "not_started" | "delayed" | "draft" | "warning";
}) {
  const cfg: Record<string, { color: string; label: string }> = {
    ok: { color: "bg-green-500", label: "Concluído" },
    pending: { color: "bg-amber-500", label: "Pendente" },
    not_started: { color: "bg-red-500", label: "Não iniciado" },
    delayed: { color: "bg-red-600", label: "Atrasado" },
    draft: { color: "bg-indigo-400", label: "Rascunho" },
    warning: { color: "bg-amber-400", label: "Atenção" },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span title={c.label} className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.color}`} />
  );
}

function PendingRow({ item, onView }: { item: PendingItem; onView: () => void }) {
  const criticalCount =
    (item.assessment === "delayed" ? 1 : 0) +
    (item.selfReview === "not_started" ? 1 : 0) +
    (item.managerReview === "not_started" ? 1 : 0) +
    (item.progressForm === "not_started" ? 1 : 0) +
    item.redCheckins;

  const warningCount =
    (item.assessment === "pending" ? 1 : 0) +
    (item.selfReview === "pending" ? 1 : 0) +
    (item.managerReview === "draft" ? 1 : 0) +
    (item.progressForm === "draft" ? 1 : 0) +
    item.yellowCheckins;

  const rowBg =
    criticalCount > 0
      ? "border-l-4 border-l-red-400"
      : warningCount > 0
      ? "border-l-4 border-l-amber-400"
      : "border-l-4 border-l-green-400";

  return (
    <Card className={`${rowBg} transition-all`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-bold text-sm">{item.userName.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground text-sm">{item.userName}</p>
              {item.deepFollowup && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                  Acomp. Profundo
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {item.area} · Gestor: {item.managerName || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200">
              <XCircle size={12} /> {criticalCount} crítico{criticalCount > 1 ? "s" : ""}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              <Clock size={12} /> {warningCount} atenção
            </span>
          )}
          {criticalCount === 0 && warningCount === 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
              <CheckCircle2 size={12} /> Em dia
            </span>
          )}
        </div>
      </div>

      {/* Item grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <ClipboardList size={12} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Assessment</p>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={item.assessment as any} />
            <p className="text-xs font-medium">
              {item.assessment === "ok"
                ? "Concluído"
                : item.assessment === "delayed"
                ? "Atrasado"
                : "Pendente"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Autoavaliação</p>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={item.selfReview as any} />
            <p className="text-xs font-medium">
              {item.selfReview === "ok"
                ? "Enviada"
                : item.selfReview === "not_started"
                ? "Não iniciada"
                : "Pendente"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Aval. Gestor</p>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={item.managerReview === "ok" ? "ok" : item.managerReview === "draft" ? "draft" : "not_started"} />
            <p className="text-xs font-medium">
              {item.managerReview === "ok"
                ? "Concluída"
                : item.managerReview === "draft"
                ? "Rascunho"
                : "Não iniciada"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <CalendarCheck size={12} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Form. Quad.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={item.progressForm === "ok" ? "ok" : item.progressForm === "draft" ? "draft" : "not_started"} />
            <p className="text-xs font-medium">
              {item.progressForm === "ok"
                ? "Enviado"
                : item.progressForm === "draft"
                ? "Rascunho"
                : "Não enviado"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <MessageSquare size={12} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Check-ins</p>
          </div>
          <div className="flex items-center gap-2">
            {item.redCheckins > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500" /> {item.redCheckins}
              </span>
            )}
            {item.yellowCheckins > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> {item.yellowCheckins}
              </span>
            )}
            {item.redCheckins === 0 && item.yellowCheckins === 0 && (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Pending() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserType | null>(null);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "ok">("all");

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        if (!isGP(currentUser.roles)) {
          setLocation("/");
          return;
        }
        setUser(currentUser);

        const [users, cycles, forms, checkins] = await Promise.all([
          getAllUsers(),
          getAssessmentCycles({ year: 2026 }),
          getProgressForms(),
          listCheckins(),
        ]);

        const employees = users.filter((u) => u.roles.includes("Colaborador"));

        const pending: PendingItem[] = employees.map((emp) => {
          const cycle: AssessmentCycle | undefined = cycles.find(
            (c) => c.employee_id === emp.id
          );
          const form: ProgressForm | undefined = forms.find(
            (f) => f.employee_id === emp.id && f.quadrimestre === 1
          );
          const manager = users.find((u) => u.id === emp.manager_id);
          const empCheckins = checkins.filter((c) => c.subject_user_id === emp.id);

          return {
            userId: emp.id,
            userName: emp.name,
            area: emp.area,
            managerName: manager?.name,
            assessment:
              cycle?.assessment_status === "completed"
                ? "ok"
                : cycle?.assessment_status === "delayed"
                ? "delayed"
                : "pending",
            selfReview:
              cycle?.self_review_status === "completed"
                ? "ok"
                : cycle?.self_review_status === "not_started"
                ? "not_started"
                : "pending",
            managerReview:
              cycle?.manager_review_status === "completed" || cycle?.manager_review_status === "published"
                ? "ok"
                : cycle?.manager_review_status === "draft"
                ? "draft"
                : "not_started",
            progressForm: form
              ? form.status === "submitted" || form.status === "reviewed_by_gp"
                ? "ok"
                : form.status === "draft"
                ? "draft"
                : "not_started"
              : "not_started",
            mainMeeting:
              cycle?.main_meeting_status === "completed" ? "ok" : "pending",
            redCheckins: empCheckins.filter((c) => c.flag === "red").length,
            yellowCheckins: empCheckins.filter((c) => c.flag === "yellow").length,
            deepFollowup: emp.deep_followup || false,
          };
        });

        pending.sort((a, b) => {
          const score = (item: PendingItem) =>
            item.redCheckins * 3 +
            (item.assessment === "delayed" ? 3 : 0) +
            (item.selfReview === "not_started" ? 2 : 0) +
            (item.managerReview === "not_started" ? 2 : 0) +
            item.yellowCheckins +
            (item.progressForm === "not_started" ? 1 : 0);
          return score(b) - score(a);
        });

        setItems(pending);
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

  const isCritical = (item: PendingItem) =>
    item.assessment === "delayed" ||
    item.selfReview === "not_started" ||
    item.managerReview === "not_started" ||
    item.progressForm === "not_started" ||
    item.redCheckins > 0;

  const isWarning = (item: PendingItem) =>
    !isCritical(item) &&
    (item.assessment === "pending" ||
      item.selfReview === "pending" ||
      item.managerReview === "draft" ||
      item.yellowCheckins > 0);

  const filtered = items.filter((item) => {
    if (filter === "critical") return isCritical(item);
    if (filter === "warning") return isWarning(item);
    if (filter === "ok") return !isCritical(item) && !isWarning(item);
    return true;
  });

  const criticalCount = items.filter(isCritical).length;
  const warningCount = items.filter(isWarning).length;
  const okCount = items.filter((i) => !isCritical(i) && !isWarning(i)).length;

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <AlertCircle size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Pendências</h1>
        <VersionBadge version="V1" />
      </div>

      <PageIntro text="Controle operacional do que está atrasado, não iniciado, em andamento ou concluído no ciclo de desenvolvimento. Ordenado por urgência." />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card
          className={`text-center p-4 cursor-pointer transition-all ${filter === "critical" ? "border-red-400 bg-red-50" : ""}`}
          onClick={() => setFilter(filter === "critical" ? "all" : "critical")}
        >
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <XCircle size={11} /> Críticos
          </p>
        </Card>
        <Card
          className={`text-center p-4 cursor-pointer transition-all ${filter === "warning" ? "border-amber-400 bg-amber-50" : ""}`}
          onClick={() => setFilter(filter === "warning" ? "all" : "warning")}
        >
          <p className="text-2xl font-bold text-amber-600">{warningCount}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Clock size={11} /> Atenção
          </p>
        </Card>
        <Card
          className={`text-center p-4 cursor-pointer transition-all ${filter === "ok" ? "border-green-400 bg-green-50" : ""}`}
          onClick={() => setFilter(filter === "ok" ? "all" : "ok")}
        >
          <p className="text-2xl font-bold text-green-600">{okCount}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <CheckCircle2 size={11} /> Em dia
          </p>
        </Card>
      </div>

      {/* Legenda */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Clique nos cards acima para filtrar. Barra lateral indica criticidade.</span>
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle2 size={32} className="mx-auto text-green-500 mb-3" />
          <p className="font-semibold text-foreground mb-1">Nenhuma pendência nesta categoria!</p>
          <p className="text-sm text-muted-foreground">
            {filter === "critical" ? "Nenhum item crítico." : filter === "warning" ? "Nenhum item de atenção." : "Todos em dia."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <PendingRow key={item.userId} item={item} onView={() => {}} />
          ))}
        </div>
      )}

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Dashboard de pendências simulado. Visível apenas para GP. Segurança real no Supabase.
      </div>
    </DashboardLayout>
  );
}
