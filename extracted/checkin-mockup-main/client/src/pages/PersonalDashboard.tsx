import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  BookOpen,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Target,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PriorityCompetencies, { PriorityCompetency } from "@/components/PriorityCompetencies";
import EvolutionTrail, { EvolutionPoint } from "@/components/EvolutionTrail";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getMe,
  logout,
  getHighestRole,
  getActivePeriod,
  getKickoff,
  getMacroGoals,
  getSuggestions,
  listCheckins,
} from "@/lib/api";
import type { User, DevelopmentPeriod, MacroGoal, PeriodSuggestion, Checkin } from "@/lib/api";

const FLAG_COLORS: Record<string, string> = {
  green: "#16a34a",
  yellow: "#d97706",
  red: "#dc2626",
};

const SUGGESTION_ICONS: Record<string, typeof BookOpen> = {
  course: BookOpen,
  book: BookOpen,
  mentoring: Lightbulb,
  action: ArrowRight,
};

function periodProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export default function PersonalDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [period, setPeriod] = useState<DevelopmentPeriod | null>(null);
  const [goals, setGoals] = useState<MacroGoal[]>([]);
  const [suggestions, setSuggestions] = useState<PeriodSuggestion[]>([]);
  const [records, setRecords] = useState<Checkin[]>([]);
  const [kickoffMacros, setKickoffMacros] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const me = await getMe();
      if (!me) { setLocation("/login"); return; }
      setUser(me);

      const p = await getActivePeriod(me.id);
      setPeriod(p);

      if (p) {
        const [k, g, s, r] = await Promise.all([
          getKickoff(p.id),
          getMacroGoals(p.id),
          getSuggestions(p.id),
          listCheckins({ user_id: me.id, period_id: p.id }),
        ]);
        setKickoffMacros(k?.macros || []);
        setGoals(g);
        setSuggestions(s);
        setRecords(r);
      } else {
        const r = await listCheckins({ user_id: me.id });
        setRecords(r);
      }
    };
    init();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  if (!user) return null;

  const publishedRecords = records.filter((r) => r.status === "published");
  const draftCount = records.filter((r) => r.status === "draft").length;
  const pendingMeetings = records.filter((r) => r.meeting_request?.status === "pending").length;
  const progress = period ? periodProgress(period.start_date, period.end_date) : 0;

  // Flag distribution for pie chart
  const flagData = [
    { name: "Verde", value: publishedRecords.filter((r) => r.flag === "green").length, color: FLAG_COLORS.green },
    { name: "Amarela", value: publishedRecords.filter((r) => r.flag === "yellow").length, color: FLAG_COLORS.yellow },
    { name: "Vermelha", value: publishedRecords.filter((r) => r.flag === "red").length, color: FLAG_COLORS.red },
  ].filter((d) => d.value > 0);

  // Competency data for bar chart
  const competencySet = Array.from(new Set(records.map((r) => r.macro)));
  const competencyData = competencySet.map((macro) => ({
    name: macro.length > 12 ? macro.slice(0, 12) + "…" : macro,
    fullName: macro,
    value: records.filter((r) => r.macro === macro && r.flag === "green").length * 2
      + records.filter((r) => r.macro === macro && r.flag === "yellow").length
      - records.filter((r) => r.macro === macro && r.flag === "red").length,
  }));

  // Priority competencies from kickoff
  const priorityCompetencies: PriorityCompetency[] = kickoffMacros.map((macro, idx) => ({
    name: macro,
    priority: idx + 1,
    evolution: records.filter((r) => r.macro === macro && r.flag === "green").length * 2
      - records.filter((r) => r.macro === macro && r.flag === "red").length * 2,
    lastUpdate: records.find((r) => r.macro === macro)?.created_at?.split("T")[0] || "",
  }));

  // Mock evolution points (would come from API)
  const evolutionPoints: EvolutionPoint[] = [
    { date: "Out", value: 0, isPriority: false },
    { date: "Nov", value: 20, isPriority: false },
    { date: "Dez", value: 35, isPriority: true },
    { date: "Jan", value: 45, isPriority: false },
    { date: "Fev", value: 68, isPriority: true },
    { date: "Mar", value: progress, isPriority: true },
  ];

  const alerts = [
    records.filter((r) => r.flag === "red").length > 2 && {
      severity: "warning",
      message: `${records.filter((r) => r.flag === "red").length} registros com flag vermelha no período. Considere solicitar uma reunião de alinhamento.`,
    },
    draftCount > 0 && {
      severity: "info",
      message: `Você tem ${draftCount} rascunho${draftCount > 1 ? "s" : ""} aguardando publicação.`,
    },
    pendingMeetings > 0 && {
      severity: "warning",
      message: `${pendingMeetings} pedido${pendingMeetings > 1 ? "s" : ""} de reunião pendente${pendingMeetings > 1 ? "s" : ""}.`,
    },
  ].filter(Boolean) as { severity: string; message: string }[];

  return (
    <DashboardLayout
      userName={user.name}
      userRole={getHighestRole(user.roles)}
      onLogout={handleLogout}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Seu Dashboard Pessoal</h1>
        <p className="text-muted-foreground">
          Análise do seu desenvolvimento no período atual.
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3 mb-8">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                alert.severity === "warning"
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <AlertCircle size={18} className={alert.severity === "warning" ? "text-amber-600" : "text-blue-600"} />
              <p className={`text-sm ${alert.severity === "warning" ? "text-amber-900" : "text-blue-900"}`}>
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── PERÍODO ── */}
      {period && (
        <Card className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-accent" />
            <h2 className="font-bold text-foreground">Período Atual</h2>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Ativo</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="text-center p-2 bg-secondary/50 rounded-lg">
              <p className="text-lg font-bold text-accent">{publishedRecords.length}</p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
            <div className="text-center p-2 bg-secondary/50 rounded-lg">
              <p className="text-lg font-bold text-amber-600">{draftCount}</p>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
            <div className="text-center p-2 bg-secondary/50 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{pendingMeetings}</p>
              <p className="text-xs text-muted-foreground">Pedidos reunião</p>
            </div>
            <div className="text-center p-2 bg-secondary/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">{progress}%</p>
              <p className="text-xs text-muted-foreground">Do período</p>
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-accent rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </Card>
      )}

      {/* ── METAS DO PERÍODO ── */}
      {goals.length > 0 && (
        <Card className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-accent" />
            <h2 className="text-lg font-bold text-foreground">Metas do Período</h2>
          </div>
          <div className="space-y-3">
            {goals.map((goal) => {
              const relatedRecords = records.filter((r) => r.macro === goal.macro);
              const greenRecs = relatedRecords.filter((r) => r.flag === "green").length;
              return (
                <div key={goal.id} className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{goal.macro}</span>
                    <span className="text-xs text-green-600">{greenRecs} reg. positivos</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                  {goal.target && (
                    <p className="text-xs text-accent mt-1">Meta: {goal.target}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── GRID PRINCIPAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Competências Prioritárias */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-bold text-foreground mb-4">Competências Prioritárias</h2>
            {priorityCompetencies.length > 0 ? (
              <PriorityCompetencies competencies={priorityCompetencies} />
            ) : (
              <p className="text-sm text-muted-foreground">Macros definidas na reunião inicial aparecerão aqui.</p>
            )}
          </Card>
        </div>

        {/* Trilha de Evolução */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-bold text-foreground mb-4">Trilha de Evolução do Período</h2>
            <EvolutionTrail points={evolutionPoints} />
          </Card>
        </div>
      </div>

      {/* ── DISTRIBUIÇÃO DE FLAGS ── */}
      {flagData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-lg font-bold text-foreground mb-4">Distribuição por Flag</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={flagData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {flagData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-foreground mb-4">Score por Competência</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={competencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="name" type="category" width={80} stroke="#6B7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                  formatter={(v, _n, p) => [v, p.payload.fullName]}
                />
                <Bar dataKey="value" fill="#4B5563" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* ── SUGESTÕES ── */}
      {suggestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Sugestões do Período</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((sug) => {
              const Icon = Lightbulb;
              return (
                <Card key={sug.id} className="hover:shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <Icon size={22} className="text-amber-500" />
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
                  <p className="text-sm text-foreground">{sug.text}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-accent">{records.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Registros</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {records.filter((r) => r.flag === "green").length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Verde</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-amber-600">
            {records.filter((r) => r.flag === "yellow").length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Amarela</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {records.filter((r) => r.flag === "red").length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Vermelha</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
