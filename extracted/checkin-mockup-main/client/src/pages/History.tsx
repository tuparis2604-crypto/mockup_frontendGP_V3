import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  History as HistoryIcon,
  MessageSquare,
  Calendar,
  FileText,
  CheckCircle2,
  Eye,
  EyeOff,
  Paperclip,
  Layers,
  Filter,
  ChevronDown,
  ClipboardList,
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
  listCheckins,
  getMeetings,
  getProgressForms,
  isGP,
  isGestor,
  isGestorAuxiliar,
} from "@/lib/api";
import type { User, Checkin, Meeting, ProgressForm, RecordFlag } from "@/lib/api";

type EventType = "checkin" | "meeting" | "progress_form" | "assessment";

interface TimelineEvent {
  id: string;
  type: EventType;
  date: string;
  title: string;
  description: string;
  flag?: RecordFlag;
  status?: string;
  visibility?: "private" | "visible";
  attachments?: number;
}

const FLAG_CONFIG: Record<RecordFlag, { dot: string; bg: string; text: string }> = {
  green: { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-800" },
  yellow: { dot: "bg-amber-500", bg: "bg-amber-100", text: "text-amber-800" },
  red: { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-800" },
};

const MEETING_TYPE_LABEL: Record<string, string> = {
  reuniao_1_gp_gerido: "Reunião 1 — GP + Gerido",
  reuniao_2_gp_gerido: "Reunião 2 — GP + Gerido",
  reuniao_gp_gestor: "Reunião GP + Gestor",
  reuniao_principal: "Reunião Principal",
  reuniao_avulsa: "Reunião Avulsa",
  reuniao_quadrimestral: "Reunião Quadrimestral",
  reuniao_checkin: "Reunião de Check-in",
};

const TYPE_ICON: Record<EventType, React.ReactNode> = {
  checkin: <MessageSquare size={15} className="text-blue-500" />,
  meeting: <Calendar size={15} className="text-purple-500" />,
  progress_form: <ClipboardList size={15} className="text-indigo-500" />,
  assessment: <FileText size={15} className="text-amber-500" />,
};

const TYPE_LABEL: Record<EventType, string> = {
  checkin: "Check-in",
  meeting: "Reunião",
  progress_form: "Formulário Quadrimestral",
  assessment: "Assessment",
};

function EventCard({ event }: { event: TimelineEvent }) {
  const isPrivate = event.visibility === "private";
  const flagCfg = event.flag ? FLAG_CONFIG[event.flag] : null;

  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          {TYPE_ICON[event.type]}
        </div>
        <div className="w-px bg-border flex-1 mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {TYPE_LABEL[event.type]}
          </span>
          {flagCfg && event.flag && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${flagCfg.bg} ${flagCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${flagCfg.dot}`} />
              {event.flag === "green" ? "Verde" : event.flag === "yellow" ? "Amarela" : "Vermelha"}
            </span>
          )}
          {isPrivate && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <EyeOff size={10} /> Privado
            </span>
          )}
          {!isPrivate && event.status === "published" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Eye size={10} /> Visível
            </span>
          )}
          {event.status === "done" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 size={10} /> Realizada
            </span>
          )}
          {event.status === "pending" && (
            <span className="text-xs text-amber-600">Pendente</span>
          )}
          {event.attachments && event.attachments > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip size={10} /> {event.attachments}
            </span>
          )}
        </div>

        <p className="font-semibold text-foreground text-sm">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{event.description}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {new Date(event.date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

export default function History() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [flagFilter, setFlagFilter] = useState<RecordFlag | "all">("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        setUser(currentUser);

        const [users, checkins, meetings, forms] = await Promise.all([
          getAllUsers(),
          listCheckins(),
          getMeetings(),
          getProgressForms(),
        ]);
        setAllUsers(users);

        const isElevated =
          isGP(currentUser.roles) ||
          isGestor(currentUser.roles) ||
          isGestorAuxiliar(currentUser.roles);

        const timeline: TimelineEvent[] = [];

        // Check-ins
        const visibleCheckins = isElevated
          ? checkins
          : checkins.filter(
              (c) =>
                c.subject_user_id === currentUser.id &&
                (c.visibility === "visible" || c.author_user_id === currentUser.id)
            );

        for (const c of visibleCheckins) {
          const subjectName = users.find((u) => u.id === c.subject_user_id)?.name || "—";
          const authorName = users.find((u) => u.id === c.author_user_id)?.name || "—";
          timeline.push({
            id: c.id,
            type: "checkin",
            date: c.created_at,
            title: `Check-in sobre ${subjectName}`,
            description: c.text.length > 120 ? c.text.slice(0, 120) + "…" : c.text,
            flag: c.flag,
            status: c.status,
            visibility: c.visibility,
            attachments: c.attachments.length,
          });
        }

        // Reuniões
        for (const m of meetings) {
          if (!isElevated) continue;
          timeline.push({
            id: m.id,
            type: "meeting",
            date: m.actual_date || m.planned_date || m.created_at,
            title: MEETING_TYPE_LABEL[m.type] || "Reunião",
            description:
              m.summary ||
              m.agenda ||
              "Sem resumo disponível.",
            status: m.status,
          });
        }

        // Formulários
        for (const f of forms) {
          if (f.status === "not_started") continue;
          if (!isElevated && f.employee_id !== currentUser.id) continue;
          const empName = users.find((u) => u.id === f.employee_id)?.name || "—";
          timeline.push({
            id: f.id,
            type: "progress_form",
            date: f.submitted_at || f.created_at,
            title: `Formulário Q${f.quadrimestre} — ${empName}`,
            description: `Status: ${
              f.status === "submitted"
                ? "Enviado"
                : f.status === "draft"
                ? "Rascunho"
                : "Revisado pelo GP"
            }`,
            status: f.status,
            attachments: f.attachments.length,
          });
        }

        // Ordenar por data desc
        timeline.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setEvents(timeline);
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

  const filtered = events.filter((e) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (flagFilter !== "all" && e.flag !== flagFilter) return false;
    return true;
  });

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <HistoryIcon size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <VersionBadge version="V1" />
      </div>

      <PageIntro text="Linha do tempo com registros, reuniões, evidências, check-ins, formulários e eventos relevantes da jornada. Use os filtros para navegar por tipo, flag ou período." />

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 h-9"
        >
          <Filter size={14} /> Filtros{" "}
          <ChevronDown size={12} className={`transition-transform ${showFilterPanel ? "rotate-180" : ""}`} />
        </button>
        {typeFilter !== "all" && (
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-2 py-1"
          >
            {TYPE_LABEL[typeFilter]} ✕
          </button>
        )}
        {flagFilter !== "all" && (
          <button
            type="button"
            onClick={() => setFlagFilter("all")}
            className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-2 py-1"
          >
            Flag {flagFilter} ✕
          </button>
        )}
      </div>

      {showFilterPanel && (
        <Card className="mb-5 p-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Tipo</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "checkin", "meeting", "progress_form"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      typeFilter === t
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {t === "all" ? "Todos" : TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Flag</p>
              <div className="flex gap-2">
                {(["all", "green", "yellow", "red"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlagFilter(f)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      flagFilter === f
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {f !== "all" && (
                      <span className={`w-2 h-2 rounded-full ${FLAG_CONFIG[f as RecordFlag].dot}`} />
                    )}
                    {f === "all" ? "Todas" : f === "green" ? "Verde" : f === "yellow" ? "Amarela" : "Vermelha"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground mb-5">
        {filtered.length} evento{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Layers size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum evento encontrado com os filtros selecionados.</p>
        </Card>
      ) : (
        <div className="max-w-2xl">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          <div className="text-center text-xs text-muted-foreground pt-2">
            Fim do histórico disponível
          </div>
        </div>
      )}

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Histórico simulado. Em V2 incluirá evidências, anexos e avaliações com permissão por perfil.
      </div>
    </DashboardLayout>
  );
}
