import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
  Download,
  FileText,
  Target,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  PlayCircle,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import CheckinEvaluationButton from "@/components/CheckinEvaluationButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  getAllUsers,
  getActivePeriod,
  getAssessment,
  getKickoff,
  getMacroGoals,
  getSuggestions,
  getIntermediateMeetings,
  createIntermediateMeeting,
  listCheckins,
  evaluateCheckin,
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

function periodProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export default function ManagedProgress() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/gerido/:id");
  const managedId = params?.id || "";

  const [managedUser, setManagedUser] = useState<User | null>(null);
  const [period, setPeriod] = useState<DevelopmentPeriod | null>(null);
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [kickoff, setKickoff] = useState<KickoffMeeting | null>(null);
  const [goals, setGoals] = useState<MacroGoal[]>([]);
  const [suggestions, setSuggestions] = useState<PeriodSuggestion[]>([]);
  const [intermediateMeetings, setIntermediateMeetings] = useState<IntermediateMeeting[]>([]);
  const [records, setRecords] = useState<Checkin[]>([]);

  const [showAssessment, setShowAssessment] = useState(false);
  const [showKickoff, setShowKickoff] = useState(false);
  const [showGoals, setShowGoals] = useState(true);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [newMeetingDate, setNewMeetingDate] = useState("");
  const [newMeetingSummary, setNewMeetingSummary] = useState("");
  const [savingMeeting, setSavingMeeting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const users = await getAllUsers();
      const user = users.find((u) => u.id === managedId);
      if (user) setManagedUser(user);

      const p = await getActivePeriod(managedId);
      setPeriod(p);

      if (p) {
        const [a, k, g, s, im, r] = await Promise.all([
          getAssessment(p.id),
          getKickoff(p.id),
          getMacroGoals(p.id),
          getSuggestions(p.id),
          getIntermediateMeetings(p.id),
          listCheckins({ user_id: managedId, period_id: p.id }),
        ]);
        setAssessment(a);
        setKickoff(k);
        setGoals(g);
        setSuggestions(s);
        setIntermediateMeetings(im);
        setRecords(r);
      } else {
        const r = await listCheckins({ user_id: managedId });
        setRecords(r);
      }
    };
    init();
  }, [managedId]);

  const handleEvaluate = async (recordId: string, status: "valid" | "invalid") => {
    await evaluateCheckin(recordId, status);
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? { ...r, evaluation: { status, evaluated_by: "", evaluated_at: new Date().toISOString() } }
          : r
      )
    );
  };

  const handleAddMeeting = async () => {
    if (!period || !newMeetingDate || !newMeetingSummary.trim()) return;
    setSavingMeeting(true);
    const meeting = await createIntermediateMeeting({
      period_id: period.id,
      employee_id: managedId,
      meeting_date: newMeetingDate,
      summary: newMeetingSummary,
    });
    setIntermediateMeetings((prev) => [meeting, ...prev]);
    setNewMeetingDate("");
    setNewMeetingSummary("");
    setShowAddMeeting(false);
    setSavingMeeting(false);
  };

  const managedName = managedUser?.name || "Colaborador";
  const progress = period ? periodProgress(period.start_date, period.end_date) : 0;
  const draftCount = records.filter((r) => r.status === "draft").length;
  const meetingRequestCount = records.filter((r) => r.meeting_request?.status === "pending").length;

  return (
    <DashboardLayout userName="João" userRole="Gestor" onLogout={() => setLocation("/login")}>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => setLocation("/meu-time")}
          className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Voltar para Meu Time</span>
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Progresso de {managedName}</h1>
            <p className="text-muted-foreground text-sm">
              Acompanhamento completo do período de desenvolvimento.
            </p>
          </div>
          {!period && (
            <Button
              onClick={() => setLocation(`/inicio-periodo/${managedId}`)}
              className="bg-primary text-primary-foreground"
            >
              <PlayCircle size={16} className="mr-2" />
              Iniciar Período
            </Button>
          )}
        </div>
      </div>

      {/* ── PERÍODO ── */}
      {period ? (
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays size={15} className="text-accent" />
                <span className="text-sm font-semibold text-foreground">Período Ativo</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Em curso</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(period.start_date).toLocaleDateString("pt-BR")} até{" "}
                {new Date(period.end_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {draftCount > 0 && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                  {draftCount} rascunho{draftCount > 1 ? "s" : ""}
                </span>
              )}
              {meetingRequestCount > 0 && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {meetingRequestCount} pedido{meetingRequestCount > 1 ? "s" : ""} de reunião
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-accent rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{progress}% do período concluído</p>
        </Card>
      ) : (
        <Card className="mb-6 border-dashed bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-900">Nenhum período ativo</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Registre o assessment e a reunião inicial para começar o período de desenvolvimento.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setLocation(`/inicio-periodo/${managedId}`)}
              className="bg-amber-600 text-white hover:bg-amber-700 ml-4 flex-shrink-0"
            >
              Iniciar
            </Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={() => setLocation(`/novo-registro?for=${managedId}`)}
          className="bg-primary text-primary-foreground"
        >
          <Plus size={16} className="mr-2" />
          Novo Registro
        </Button>
        <Button variant="outline" onClick={() => setShowAddMeeting(true)}>
          <MessageSquare size={16} className="mr-2" />
          Registrar Reunião
        </Button>
        <Button variant="outline" onClick={() => setLocation("/resumo")}>
          <Download size={16} className="mr-2" />
          Gerar Resumo
        </Button>
      </div>

      {/* ── INÍCIO DO PERÍODO ── */}
      {(assessment || kickoff) && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide text-muted-foreground">
            Início do Período
          </h2>

          {assessment && (
            <Card className="p-0">
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setShowAssessment(!showAssessment)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Assessment</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(assessment.assessed_at).toLocaleDateString("pt-BR")}
                      {assessment.attachment && ` · ${assessment.attachment.name}`}
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
                      <span className="text-xs text-blue-800 flex-1 truncate">{assessment.attachment.name}</span>
                      <span className="text-xs text-blue-600">{(assessment.attachment.size / 1024).toFixed(0)} KB</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {kickoff && (
            <Card className="p-0">
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setShowKickoff(!showKickoff)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <MessageSquare size={14} className="text-purple-600" />
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
                        <span key={m} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">{m}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ── DIRECIONADORES ── */}
      {(goals.length > 0 || suggestions.length > 0) && (
        <Card className="mb-6">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShowGoals(!showGoals)}
          >
            <div className="flex items-center gap-2">
              <Target size={16} className="text-accent" />
              <h2 className="text-base font-bold text-foreground">Plano Atual</h2>
            </div>
            {showGoals ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>

          {showGoals && (
            <div className="mt-4 space-y-4">
              {goals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Metas</p>
                  {goals.map((g) => (
                    <div key={g.id} className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{g.macro}</p>
                        <p className="text-xs text-muted-foreground">{g.description}</p>
                        {g.target && <p className="text-xs text-accent mt-0.5">Meta: {g.target}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sugestões</p>
                  {suggestions.map((s) => (
                    <div key={s.id} className="flex items-start gap-2 p-2.5 bg-secondary/50 rounded-lg">
                      <Lightbulb size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground flex-1">{s.text}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-medium ${
                        s.status === "done" ? "bg-green-100 text-green-700" :
                        s.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {s.status === "done" ? "Concluída" : s.status === "in_progress" ? "Em andamento" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── REUNIÕES INTERMEDIÁRIAS ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Atualizações do Período</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMeeting(!showAddMeeting)}
          >
            <Plus size={14} className="mr-1" />
            Registrar Reunião
          </Button>
        </div>

        {/* Form nova reunião */}
        {showAddMeeting && (
          <Card className="mb-3 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground text-sm">Nova Reunião Intermediária</h3>
              <button onClick={() => setShowAddMeeting(false)}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Data da Reunião</label>
                <Input
                  type="date"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Resumo / Conclusões</label>
                <Textarea
                  placeholder="Descreva os pontos principais discutidos, alinhamentos e encaminhamentos..."
                  value={newMeetingSummary}
                  onChange={(e) => setNewMeetingSummary(e.target.value)}
                  className="min-h-24 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddMeeting}
                  disabled={!newMeetingDate || !newMeetingSummary.trim() || savingMeeting}
                  className="bg-primary text-primary-foreground"
                >
                  {savingMeeting ? "Salvando..." : "Salvar Reunião"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddMeeting(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {intermediateMeetings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">
            Nenhuma reunião intermediária registrada ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {intermediateMeetings.map((m) => (
              <Card key={m.id} className="border-l-4 border-l-purple-400">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Reunião intermediária · {new Date(m.meeting_date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-foreground">{m.summary}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── HISTÓRICO DE REGISTROS ── */}
      <h2 className="text-base font-bold text-foreground mb-3">Histórico de Registros</h2>

      {records.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const flagCfg = FLAG_BADGE[record.flag];
            return (
              <Card key={record.id} className="hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${flagCfg.classes}`}>
                        <span className={`w-2 h-2 rounded-full ${flagCfg.dot}`} />
                        {flagCfg.label}
                      </span>
                      {record.status === "draft" && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Rascunho
                        </span>
                      )}
                      <span className="text-sm font-medium text-accent">{record.macro}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{record.text}</p>
                    {record.meeting_request && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquare size={12} className="text-purple-600" />
                          <span className="text-xs font-medium text-purple-800">Pedido de Reunião</span>
                        </div>
                        <p className="text-xs text-purple-700">{record.meeting_request.agenda}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <CheckinEvaluationButton
                      checkinId={record.id}
                      currentEvaluation={record.evaluation?.status || null}
                      onEvaluate={(status) => handleEvaluate(record.id, status)}
                    />
                    {record.visibility === "private" ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                        <EyeOff size={12} />
                        <span>Privado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                        <Eye size={12} />
                        <span>Visível</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <h2 className="text-base font-bold text-blue-900 mb-3">Sugestões de Desenvolvimento</h2>
          <div className="space-y-2">
            {suggestions.filter((s) => s.status !== "done").map((s) => (
              <div key={s.id} className="p-2.5 bg-white rounded border border-blue-100 flex gap-2">
                <Lightbulb size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900">{s.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <Card className="text-center">
            <p className="text-2xl font-bold text-accent">{records.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">{records.filter((r) => r.flag === "green").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Verde</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-amber-600">{records.filter((r) => r.flag === "yellow").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Amarela</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-600">{records.filter((r) => r.flag === "red").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Vermelha</p>
          </Card>
        </div>
      )}

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>Nota:</strong> Como gestor, você visualiza todos os registros, incluindo os privados. Registros privados não são visíveis para o colaborador, mas compõem a análise do período.
        </p>
      </Card>
    </DashboardLayout>
  );
}
