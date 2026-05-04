import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronRight, ChevronDown, Users, PlayCircle, CalendarDays } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { getMe, logout, getHighestRole, getAllUsers, getActivePeriod, listCheckins } from "@/lib/api";
import type { User, DevelopmentPeriod, Checkin } from "@/lib/api";

interface TeamMemberData {
  user: User;
  period: DevelopmentPeriod | null;
  records: Checkin[];
  subordinates?: TeamMemberData[];
}

function periodProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

interface TeamMemberRowProps {
  data: TeamMemberData;
  level?: number;
  onViewMember: (id: string) => void;
  onStartPeriod: (id: string) => void;
}

function TeamMemberRow({ data, level = 0, onViewMember, onStartPeriod }: TeamMemberRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { user, period, records } = data;
  const hasSubordinates = data.subordinates && data.subordinates.length > 0;

  const draftCount = records.filter((r) => r.status === "draft").length;
  const meetingRequests = records.filter((r) => r.meeting_request?.status === "pending").length;
  const progress = period ? periodProgress(period.start_date, period.end_date) : 0;

  const lastRecord = records[0];

  return (
    <>
      <Card
        className={`hover:shadow-md transition-shadow ${period ? "" : "border-dashed border-amber-200 bg-amber-50/30"}`}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasSubordinates && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-foreground hover:bg-secondary rounded p-1 transition-colors flex-shrink-0"
              >
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {!hasSubordinates && <div className="w-6 flex-shrink-0" />}

            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-bold text-sm">{user.name.charAt(0)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-foreground text-sm">{user.name}</h3>
                <span className="text-xs text-muted-foreground">{user.faixa}</span>
                {period ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                    Período ativo
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full">
                    Sem período
                  </span>
                )}
              </div>

              {period ? (
                <div className="mt-1.5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={10} />
                      {new Date(period.start_date).toLocaleDateString("pt-BR")} – {new Date(period.end_date).toLocaleDateString("pt-BR")}
                    </span>
                    <span>{records.length} registro{records.length !== 1 ? "s" : ""}</span>
                    {draftCount > 0 && (
                      <span className="text-amber-600">{draftCount} rascunho{draftCount > 1 ? "s" : ""}</span>
                    )}
                    {meetingRequests > 0 && (
                      <span className="text-purple-600">{meetingRequests} pedido{meetingRequests > 1 ? "s" : ""} reunião</span>
                    )}
                  </div>
                  <div className="w-full max-w-32 bg-secondary rounded-full h-1.5">
                    <div className="bg-accent rounded-full h-1.5" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700 mt-0.5">
                  Período de desenvolvimento não iniciado.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!period && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => onStartPeriod(user.id)}
              >
                <PlayCircle size={12} className="mr-1" />
                Iniciar
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7"
              onClick={() => onViewMember(user.id)}
            >
              Ver
              <ChevronRight size={12} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Subordinates */}
      {expanded && hasSubordinates && data.subordinates && (
        <div className="space-y-3 mt-3">
          {data.subordinates.map((sub) => (
            <TeamMemberRow
              key={sub.user.id}
              data={sub}
              level={level + 1}
              onViewMember={onViewMember}
              onStartPeriod={onStartPeriod}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function MyTeam() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teamData, setTeamData] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const me = await getMe();
      if (!me) { setLocation("/login"); return; }
      setCurrentUser(me);

      const allUsers = await getAllUsers();
      const directReports = allUsers.filter((u) => u.manager_id === me.id);

      const teamWithData: TeamMemberData[] = await Promise.all(
        directReports.map(async (u) => {
          const [period, records] = await Promise.all([
            getActivePeriod(u.id),
            listCheckins({ user_id: u.id }),
          ]);

          // Load sub-subordinates
          const subReports = allUsers.filter((s) => s.manager_id === u.id);
          const subordinates: TeamMemberData[] = await Promise.all(
            subReports.map(async (sub) => {
              const [sp, sr] = await Promise.all([
                getActivePeriod(sub.id),
                listCheckins({ user_id: sub.id }),
              ]);
              return { user: sub, period: sp, records: sr };
            })
          );

          return { user: u, period, records, subordinates: subordinates.length > 0 ? subordinates : undefined };
        })
      );

      setTeamData(teamWithData);
      setLoading(false);
    };
    init();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  if (!currentUser) return null;

  const totalMembers = teamData.reduce((sum, d) => sum + 1 + (d.subordinates?.length || 0), 0);
  const activePeriods = teamData.filter((d) => d.period).length;
  const pendingMeetings = teamData.reduce((sum, d) => sum + d.records.filter((r) => r.meeting_request?.status === "pending").length, 0);
  const totalRecords = teamData.reduce((sum, d) => sum + d.records.length, 0);

  return (
    <DashboardLayout
      userName={currentUser.name}
      userRole={getHighestRole(currentUser.roles)}
      onLogout={handleLogout}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Meu Time</h1>
        <p className="text-muted-foreground">
          Acompanhe os períodos de desenvolvimento e registros do seu time.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-bold text-accent">{totalMembers}</p>
          <p className="text-sm text-muted-foreground mt-2">Pessoas no Time</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{activePeriods}</p>
          <p className="text-sm text-muted-foreground mt-2">Períodos Ativos</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-accent">{totalRecords}</p>
          <p className="text-sm text-muted-foreground mt-2">Total Registros</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">{pendingMeetings}</p>
          <p className="text-sm text-muted-foreground mt-2">Pedidos Reunião</p>
        </Card>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : teamData.length === 0 ? (
        <Card className="text-center py-12">
          <Users size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhum gerido encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {teamData.map((data) => (
            <TeamMemberRow
              key={data.user.id}
              data={data}
              onViewMember={(id) => setLocation(`/gerido/${id}`)}
              onStartPeriod={(id) => setLocation(`/inicio-periodo/${id}`)}
            />
          ))}
        </div>
      )}

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Users size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-900">Gestão por Período</h3>
            <p className="text-sm text-blue-800 mt-1">
              Cada colaborador deve ter um período ativo com assessment e reunião inicial registrados.
              Clique em "Iniciar" para começar o período de desenvolvimento de um gerido sem período ativo.
            </p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
