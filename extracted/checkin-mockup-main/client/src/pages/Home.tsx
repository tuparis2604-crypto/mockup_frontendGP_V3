import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ChevronRight,
  TrendingUp,
  Plus,
  FileText,
  Users,
  BarChart3,
  AlertCircle,
  Zap,
  CalendarDays,
  MessageSquare,
  Clock,
  Map,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import {
  getMe,
  logout,
  getHighestRole,
  getActivePeriod,
  listCheckins,
} from "@/lib/api";
import type { User, DevelopmentPeriod, Checkin } from "@/lib/api";

const mockAlerts = [
  {
    id: "1",
    type: "warning",
    title: "Baixo Registro em Comunicação",
    description: "Você não registrou nada sobre Comunicação nas últimas 2 semanas.",
  },
  {
    id: "2",
    type: "success",
    title: "Progresso em Liderança",
    description: "Você acumulou 6 registros verdes em Liderança neste período.",
  },
];

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getMe();
        if (currentUser) {
          setUser(currentUser);
          const [p, r] = await Promise.all([
            getActivePeriod(currentUser.id),
            listCheckins({ user_id: currentUser.id }),
          ]);
          setPeriod(p);
          setRecords(r);
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

  const isManager = user.roles.includes("Gestor");
  const isExecutive = user.roles.includes("RH") || user.roles.includes("Sócio");

  const draftCount = records.filter((r) => r.status === "draft").length;
  const pendingMeetings = records.filter((r) => r.meeting_request?.status === "pending").length;
  const greenCount = records.filter((r) => r.flag === "green" && r.status === "published").length;
  const progress = period ? periodProgress(period.start_date, period.end_date) : 0;

  return (
    <DashboardLayout
      userName={user.name}
      userRole={getHighestRole(user.roles)}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo, {user.name}!</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desenvolvimento e registre fatos ao longo do período.
        </p>
      </div>

      {/* ── PERÍODO ATUAL ── */}
      {period ? (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-accent" />
              <span className="font-semibold text-foreground">Período Ativo</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Em curso</span>
            </div>
            <button
              onClick={() => setLocation("/progresso")}
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
            >
              Ver detalhes <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{greenCount}</p>
              <p className="text-xs text-muted-foreground">Registros verdes</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-600">{draftCount}</p>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-purple-600">{pendingMeetings}</p>
              <p className="text-xs text-muted-foreground">Pedidos de reunião</p>
            </div>
          </div>

          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-accent rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progress}% · {new Date(period.start_date).toLocaleDateString("pt-BR")} – {new Date(period.end_date).toLocaleDateString("pt-BR")}
          </p>
        </Card>
      ) : (
        <Card className="mb-6 border-dashed border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900 font-medium mb-1">Nenhum período ativo</p>
          <p className="text-xs text-amber-700">Solicite ao gestor o início do período de desenvolvimento.</p>
        </Card>
      )}

      {/* ── PENDÊNCIAS ── */}
      {(draftCount > 0 || pendingMeetings > 0) && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <h2 className="text-sm font-bold text-amber-900 mb-3">Pendências</h2>
          <div className="space-y-2">
            {draftCount > 0 && (
              <button
                onClick={() => setLocation("/progresso")}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {draftCount} rascunho{draftCount > 1 ? "s" : ""} aguardando publicação
                    </p>
                    <p className="text-xs text-amber-700">Revise e publique quando estiver pronto.</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-amber-400 flex-shrink-0" />
              </button>
            )}
            {pendingMeetings > 0 && (
              <button
                onClick={() => setLocation("/progresso")}
                className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {pendingMeetings} pedido{pendingMeetings > 1 ? "s" : ""} de reunião pendente{pendingMeetings > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-amber-700">Registros com solicitação de reunião aguardando reconhecimento.</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-amber-400 flex-shrink-0" />
              </button>
            )}
          </div>
        </Card>
      )}

      {/* ── AVISOS ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Avisos Recentes</h2>
        <div className="space-y-3">
          {mockAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex gap-3 p-4 rounded-lg border-l-4 ${
                alert.type === "warning"
                  ? "bg-amber-50 border-l-amber-500"
                  : "bg-green-50 border-l-green-500"
              }`}
            >
              <AlertCircle
                size={20}
                className={alert.type === "warning" ? "text-amber-600" : "text-green-600"}
              />
              <div>
                <p className={`font-bold text-sm ${alert.type === "warning" ? "text-amber-900" : "text-green-900"}`}>
                  {alert.title}
                </p>
                <p className={`text-xs mt-1 ${alert.type === "warning" ? "text-amber-800" : "text-green-800"}`}>
                  {alert.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" onClick={() => setLocation("/avisos")}>
          Ver Todos os Avisos
        </Button>
      </div>

      {/* ── NAVEGAÇÃO RÁPIDA ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Navegação Rápida</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/progresso")}>
            <div className="flex items-start justify-between mb-3">
              <TrendingUp size={24} className="text-accent" />
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Meu Progresso</h3>
            <p className="text-xs text-muted-foreground mb-3">Assessment, kickoff, metas e registros do período</p>
            <p className="text-sm font-semibold text-accent">{records.length} registro{records.length !== 1 ? "s" : ""} no período</p>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/novo-registro")}>
            <div className="flex items-start justify-between mb-3">
              <Plus size={24} className="text-accent" />
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Novo Registro</h3>
            <p className="text-xs text-muted-foreground mb-3">Registre um fato com flag verde, amarela ou vermelha</p>
            <p className="text-sm font-semibold text-accent">Salvar como rascunho ou publicar</p>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/dashboard-pessoal")}>
            <div className="flex items-start justify-between mb-3">
              <Zap size={24} className="text-accent" />
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Dashboard Pessoal</h3>
            <p className="text-xs text-muted-foreground mb-3">Métricas, evolução e análise do período</p>
            <p className="text-sm font-semibold text-accent">Análise de desenvolvimento</p>
          </Card>

          {isManager && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/meu-time")}>
              <div className="flex items-start justify-between mb-3">
                <Users size={24} className="text-accent" />
                <ChevronRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Meu Time</h3>
              <p className="text-xs text-muted-foreground mb-3">Acompanhe os períodos dos seus geridos</p>
              <p className="text-sm font-semibold text-accent">Registros e reuniões</p>
            </Card>
          )}

          {isExecutive && (
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation("/dashboards")}>
              <div className="flex items-start justify-between mb-3">
                <BarChart3 size={24} className="text-accent" />
                <ChevronRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Dashboards</h3>
              <p className="text-xs text-muted-foreground mb-3">Visão organizacional dos períodos</p>
              <p className="text-sm font-semibold text-accent">Métricas globais</p>
            </Card>
          )}

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow opacity-80 border-dashed"
            onClick={() => setLocation("/mapa-desenvolvimento")}
          >
            <div className="flex items-start justify-between mb-3">
              <Map size={24} className="text-accent" />
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Em breve</span>
            </div>
            <h3 className="font-bold text-foreground mb-1">Mapa de Desenvolvimento</h3>
            <p className="text-xs text-muted-foreground mb-3">Visão integrada da sua jornada</p>
            <p className="text-sm font-semibold text-muted-foreground">Em desenvolvimento</p>
          </Card>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <p>
          <strong>Modo MOCK:</strong> Todos os dados são salvos localmente no seu navegador. Ao conectar a um backend real, os dados serão sincronizados com o servidor.
        </p>
      </div>
    </DashboardLayout>
  );
}
