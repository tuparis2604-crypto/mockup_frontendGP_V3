import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Eye,
  EyeOff,
  Download,
  Plus,
  CalendarDays,
  FileText,
  Target,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PriorityCompetencies, { PriorityCompetency } from "@/components/PriorityCompetencies";
import JornadaDeEvolucao from "@/components/JornadaDeEvolucao";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMe,
  logout,
  getHighestRole,
  getActivePeriod,
  getAssessment,
  getKickoff,
  getMacroGoals,
  getSuggestions,
  getIntermediateMeetings,
  listCheckins,
} from "@/lib/api";
import type {
  User,
  DevelopmentPeriod,
  AssessmentRecord,
  KickoffMeeting,
  MacroGoal,
  PeriodSuggestion,
  IntermediateMeeting,
  Checkin,
  RecordFlag,
} from "@/lib/api";

const FLAG_BADGE: Record<RecordFlag, { label: string; classes: string; dot: string }> = {
  green: { label: "Verde", classes: "bg-green-100 text-green-800", dot: "bg-green-500" },
  yellow: { label: "Amarela", classes: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  red: { label: "Vermelha", classes: "bg-red-100 text-red-800", dot: "bg-red-500" },
};

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  draft: { label: "Rascunho", classes: "bg-gray-100 text-gray-600" },
  grouped: { label: "Agrupado", classes: "bg-blue-100 text-blue-700" },
  published: { label: "Publicado", classes: "bg-green-100 text-green-700" },
};

function periodProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export default function Progress() {
  const [, setLocation] = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [period, setPeriod] = useState<DevelopmentPeriod | null>(null);
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [kickoff, setKickoff] = useState<KickoffMeeting | null>(null);
  const [goals, setGoals] = useState<MacroGoal[]>([]);
  const [suggestions, setSuggestions] = useState<PeriodSuggestion[]>([]);
  const [intermediateMeetings, setIntermediateMeetings] = useState<IntermediateMeeting[]>([]);
  const [records, setRecords] = useState<Checkin[]>([]);

  const [selectedCompetency, setSelectedCompetency] = useState("todas");
  const [showOnlyPriority, setShowOnlyPriority] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showKickoff, setShowKickoff] = useState(false);
  const [showGoals, setShowGoals] = useState(true);
  const [showMeetings, setShowMeetings] = useState(true);

  useEffect(() => {
    const init = async () => {
      const me = await getMe();
      if (!me) { setLocation("/login"); return; }
      setUser(me);

      const p = await getActivePeriod(me.id);
      setPeriod(p);

      if (p) {
        const [a, k, g, s, im, r] = await Promise.all([
          getAssessment(p.id),
          getKickoff(p.id),
          getMacroGoals(p.id),
          getSuggestions(p.id),
          getIntermediateMeetings(p.id),
          listCheckins({ user_id: me.id, period_id: p.id }),
        ]);
        setAssessment(a);
        setKickoff(k);
        setGoals(g);
        setSuggestions(s);
        setIntermediateMeetings(im);
        setRecords(r);
      } else {
        const r = await listCheckins({ user_id: me.id });
        setRecords(r);
      }
    };
    init();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  const competencies = Array.from(new Set(records.map((r) => r.macro)));
  const filteredRecords = records.filter((r) => {
    if (selectedCompetency !== "todas" && r.macro !== selectedCompetency) return false;
    if (showOnlyPriority && kickoff && !kickoff.macros.includes(r.macro)) return false;
    return true;
  });

  const priorityCompetencies: PriorityCompetency[] = (kickoff?.macros || []).map((macro, idx) => ({
    name: macro,
    priority: idx + 1,
    evolution: records.filter((r) => r.macro === macro && r.flag === "green").length * 2
      - records.filter((r) => r.macro === macro && r.flag === "red").length * 3,
    lastUpdate: records.find((r) => r.macro === macro)?.created_at?.split("T")[0] || "",
  }));

  const draftCount = records.filter((r) => r.status === "draft").length;
  const meetingRequestCount = records.filter((r) => r.meeting_request?.status === "pending").length;
  const progress = period ? periodProgress(period.start_date, period.end_date) : 0;

  if (!user) return null;

  return (
    <DashboardLayout
      userName={user.name}
      userRole={getHighestRole(user.roles)}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Meu Progresso</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desenvolvimento no período atual.
        </p>
      </div>

      {/* ── PERÍODO ATUAL ── */}
      {period ? (
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays size={16} className="text-accent" />
                <span className="text-sm font-semibold text-foreground">Período Ativo</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  Em curso
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(period.start_date).toLocaleDateString("pt-BR")} até{" "}
                {new Date(period.end_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {draftCount > 0 && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                  {draftCount} rascunho{draftCount > 1 ? "s" : ""}
                </span>
              )}
              {meetingRequestCount > 0 && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {meetingRequestCount} pedido{meetingRequestCount > 1 ? "s" : ""} de reunião
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className="bg-accent rounded-full h-2.5 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{progress}% do período concluído</p>
        </Card>
      ) : (
        <Card className="mb-6 border-dashed">
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum período ativo encontrado.
          </p>
        </Card>
      )}

      {/* ── JORNADA ── */}
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-2">Jornada de Evolução</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Progresso acumulado nos registros do período atual.
        </p>
        <JornadaDeEvolucao
          currentPoints={records.filter((r) => r.flag === "green" && r.status === "published").length * 8}
          maxPoints={100}
          validCheckins={records.filter((r) => r.status === "published").length}
          alerts={
            draftCount > 0
              ? [`Você tem ${draftCount} rascunho${draftCount > 1 ? "s" : ""} aguardando publicação.`]
              : []
          }
          trend={records.filter((r) => r.flag === "green").length > records.filter((r) => r.flag === "red").length ? "positive" : "neutral"}
        />
      </Card>

      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => setLocation("/novo-registro")}
          className="bg-primary text-primary-foreground"
        >
          <Plus size={16} className="mr-2" />
          Novo Registro
        </Button>
        <Button variant="outline" onClick={() => setLocation("/resumo")}>
          <Download size={16} className="mr-2" />
          Gerar Resumo
        </Button>
      </div>

      {/* ── INÍCIO DO PERÍODO ── */}
      {(assessment || kickoff) && (
        <div className="mb-6 space-y-3">
          <h2 className="text-base font-bold text-foreground">Início do Período</h2>

          {/* Assessment */}
          {assessment && (
            <Card className="p-0">
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setShowAssessment(!showAssessment)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Assessment</p>
                    <p className="text-xs text-muted-foreground">
                      Realizado em {new Date(assessment.assessed_at).toLocaleDateString("pt-BR")}
                      {assessment.attachment && ` · PDF: ${assessment.attachment.name}`}
                    </p>
                  </div>
                </div>
                {showAssessment ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>
              {showAssessment && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm text-foreground mt-3">{assessment.result_summary}</p>
                  {assessment.attachment && (
                    <div className="mt-3 flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg">
                      <FileText size={14} className="text-blue-600" />
                      <span className="text-xs text-blue-800">{assessment.attachment.name}</span>
                      <span className="text-xs text-blue-600 ml-auto">
                        {(assessment.attachment.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Kickoff */}
          {kickoff && (
            <Card className="p-0">
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setShowKickoff(!showKickoff)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Reunião Inicial</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(kickoff.meeting_date).toLocaleDateString("pt-BR")} · {kickoff.macros.length} macros definidas
                    </p>
                  </div>
                </div>
                {showKickoff ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>
              {showKickoff && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm text-foreground mt-3">{kickoff.conclusions}</p>
                  {kickoff.macros.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {kickoff.macros.map((m) => (
                        <span key={m} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ── DIRECIONADORES DO PERÍODO ── */}
      {(goals.length > 0 || priorityCompetencies.length > 0) && (
        <Card className="mb-6">
          <button
            className="w-full flex items-center justify-between mb-1"
            onClick={() => setShowGoals(!showGoals)}
          >
            <div className="flex items-center gap-2">
              <Target size={18} className="text-accent" />
              <h2 className="text-base font-bold text-foreground">Direcionadores do Período</h2>
            </div>
            {showGoals ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>

          {showGoals && (
            <div className="mt-4 space-y-4">
              {priorityCompetencies.length > 0 && (
                <PriorityCompetencies competencies={priorityCompetencies} compact />
              )}

              {goals.length > 0 && (
                <div className="space-y-3 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Metas</p>
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          goal.status === "achieved" ? "bg-green-500" : "bg-accent"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{goal.macro}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                        {goal.target && (
                          <p className="text-xs text-accent mt-1">Meta: {goal.target}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sugestões</p>
                  {suggestions.map((sug) => (
                    <div key={sug.id} className="flex items-start gap-2.5 p-2.5 bg-secondary/50 rounded-lg">
                      <Lightbulb size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground flex-1">{sug.text}</p>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                          sug.status === "done"
                            ? "bg-green-100 text-green-700"
                            : sug.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {sug.status === "done" ? "Concluída" : sug.status === "in_progress" ? "Em andamento" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── ATUALIZAÇÕES DO PERÍODO (Reuniões Intermediárias) ── */}
      {intermediateMeetings.length > 0 && (
        <Card className="mb-6">
          <button
            className="w-full flex items-center justify-between mb-1"
            onClick={() => setShowMeetings(!showMeetings)}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-accent" />
              <h2 className="text-base font-bold text-foreground">Atualizações do Período</h2>
              <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                {intermediateMeetings.length} reunião{intermediateMeetings.length > 1 ? "ões" : ""}
              </span>
            </div>
            {showMeetings ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>

          {showMeetings && (
            <div className="mt-4 space-y-3">
              {intermediateMeetings.map((meeting) => (
                <div key={meeting.id} className="p-3 bg-secondary/50 rounded-lg border-l-4 border-l-purple-400">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Reunião intermediária · {new Date(meeting.meeting_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{meeting.summary}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── HISTÓRICO DE REGISTROS ── */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <h2 className="text-base font-bold text-foreground flex-1">Histórico de Registros</h2>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCompetency} onValueChange={setSelectedCompetency}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue placeholder="Competência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Competências</SelectItem>
              {competencies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 text-xs">
            <input
              type="checkbox"
              checked={showOnlyPriority}
              onChange={(e) => setShowOnlyPriority(e.target.checked)}
              className="w-3 h-3"
            />
            Apenas Prioritárias
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setLocation("/novo-registro")}
            >
              <Plus size={14} className="mr-1" />
              Criar primeiro registro
            </Button>
          </Card>
        ) : (
          filteredRecords.map((record) => {
            const flagCfg = FLAG_BADGE[record.flag];
            const statusCfg = STATUS_BADGE[record.status] || STATUS_BADGE.published;
            const isPriority = kickoff?.macros.includes(record.macro);
            return (
              <Card
                key={record.id}
                className={`hover:shadow-sm transition-shadow ${
                  isPriority ? "border-l-4 border-l-amber-400" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Flag */}
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${flagCfg.classes}`}>
                        <span className={`w-2 h-2 rounded-full ${flagCfg.dot}`} />
                        {flagCfg.label}
                      </span>
                      {/* Status */}
                      {record.status !== "published" && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.classes}`}>
                          {statusCfg.label}
                        </span>
                      )}
                      {/* Macro */}
                      <span className={`text-sm font-medium ${isPriority ? "text-amber-600" : "text-accent"}`}>
                        {isPriority && "★ "}{record.macro}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{record.text}</p>

                    {/* Meeting request indicator */}
                    {record.meeting_request && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg w-fit">
                        <MessageSquare size={12} />
                        <span>Pedido de reunião pendente</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {record.visibility === "visible" ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye size={14} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <EyeOff size={14} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <Card className="text-center">
            <p className="text-2xl font-bold text-accent">{records.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {records.filter((r) => r.flag === "green").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Verde</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {records.filter((r) => r.flag === "yellow").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Amarela</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {records.filter((r) => r.flag === "red").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Vermelha</p>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
