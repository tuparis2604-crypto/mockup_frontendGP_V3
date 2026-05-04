import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMe, logout, getHighestRole, getOrgDashboard } from "@/lib/api";
import type { User } from "@/lib/api";

const FLAG_COLORS = ["#16a34a", "#d97706", "#dc2626"];

const consistencyTrend = [
  { month: "Out", registros: 42, periodos: 2 },
  { month: "Nov", registros: 68, periodos: 3 },
  { month: "Dez", registros: 85, periodos: 3 },
  { month: "Jan", registros: 112, periodos: 4 },
  { month: "Fev", registros: 145, periodos: 4 },
  { month: "Mar", registros: 168, periodos: 5 },
];

const recordsByArea = [
  { name: "Tecnologia", value: 145 },
  { name: "Vendas", value: 98 },
  { name: "RH", value: 67 },
  { name: "Financeiro", value: 54 },
  { name: "Operações", value: 76 },
];

export default function Dashboards() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("atual");
  const [selectedArea, setSelectedArea] = useState("todas");

  useEffect(() => {
    const init = async () => {
      const me = await getMe();
      if (!me) { setLocation("/login"); return; }
      setUser(me);
      const data = await getOrgDashboard();
      setOrgData(data);
    };
    init();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  if (!user || !orgData) return null;

  const flagPieData = [
    { name: "Verde", value: orgData.checkins_by_flag.green, color: FLAG_COLORS[0] },
    { name: "Amarela", value: orgData.checkins_by_flag.yellow, color: FLAG_COLORS[1] },
    { name: "Vermelha", value: orgData.checkins_by_flag.red, color: FLAG_COLORS[2] },
  ].filter((d) => d.value > 0);

  const macroData = orgData.checkins_by_macro
    .filter((m: any) => m.count > 0)
    .map((m: any) => ({
      name: m.macro.length > 12 ? m.macro.slice(0, 12) + "…" : m.macro,
      fullName: m.macro,
      value: m.count,
    }));

  return (
    <DashboardLayout
      userName={user.name}
      userRole={getHighestRole(user.roles)}
      onLogout={handleLogout}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboards</h1>
        <p className="text-muted-foreground">
          Visão organizacional dos períodos de desenvolvimento e registros.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="atual">Período Atual</SelectItem>
            <SelectItem value="anterior">Período Anterior</SelectItem>
            <SelectItem value="todos">Todos os Períodos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Áreas</SelectItem>
            <SelectItem value="tech">Tecnologia</SelectItem>
            <SelectItem value="vendas">Vendas</SelectItem>
            <SelectItem value="rh">RH</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-bold text-accent">{orgData.total_checkins}</p>
          <p className="text-sm text-muted-foreground mt-2">Registros Total</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-accent">{orgData.active_periods}</p>
          <p className="text-sm text-muted-foreground mt-2">Períodos Ativos</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-accent">{orgData.total_users}</p>
          <p className="text-sm text-muted-foreground mt-2">Colaboradores</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{orgData.checkins_by_flag.green}</p>
          <p className="text-sm text-muted-foreground mt-2">Registros Verdes</p>
        </Card>
      </div>

      {/* Período — resumo de flags */}
      <Card className="mb-8">
        <h3 className="font-bold text-foreground mb-4">Distribuição de Registros por Flag</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-3xl font-bold text-green-600">{orgData.checkins_by_flag.green}</p>
            <p className="text-sm text-green-800 font-medium mt-1">Verde</p>
            <p className="text-xs text-green-700 mt-0.5">Positivos / Forças</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-3xl font-bold text-amber-600">{orgData.checkins_by_flag.yellow}</p>
            <p className="text-sm text-amber-800 font-medium mt-1">Amarela</p>
            <p className="text-xs text-amber-700 mt-0.5">Atenção / Melhoria</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-3xl font-bold text-red-600">{orgData.checkins_by_flag.red}</p>
            <p className="text-sm text-red-800 font-medium mt-1">Vermelha</p>
            <p className="text-xs text-red-700 mt-0.5">Crítico / Urgente</p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Registros por Área */}
        <Card>
          <h3 className="font-bold text-foreground mb-4">Registros por Área</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={recordsByArea}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
              <Bar dataKey="value" fill="#4B5563" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Flags Pie */}
        <Card>
          <h3 className="font-bold text-foreground mb-4">Flags por Tipo</h3>
          {flagPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={flagPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {flagPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">Nenhum registro ainda.</p>
          )}
        </Card>
      </div>

      {/* Distribuição por Macrocompetência */}
      {macroData.length > 0 && (
        <Card className="mb-8">
          <h3 className="font-bold text-foreground mb-4">Registros por Macrocompetência</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={macroData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis dataKey="name" type="category" width={90} stroke="#6B7280" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                formatter={(v, _n, p) => [v, p.payload.fullName]}
              />
              <Bar dataKey="value" fill="#4B5563" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Tendência de Registros */}
      <Card className="mb-8">
        <h3 className="font-bold text-foreground mb-4">Evolução de Registros e Períodos</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={consistencyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="registros" stroke="#4B5563" strokeWidth={2} dot={{ fill: "#4B5563", r: 4 }} name="Registros" />
            <Line type="monotone" dataKey="periodos" stroke="#9CA3AF" strokeWidth={2} dot={{ fill: "#9CA3AF", r: 4 }} name="Períodos Ativos" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Usuários por Role */}
      <Card className="bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3">Composição Organizacional</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(orgData.users_by_role).map(([role, count]) => (
            <div key={role} className="text-center p-3 bg-white rounded-lg border border-blue-100">
              <p className="text-xl font-bold text-blue-900">{count as number}</p>
              <p className="text-xs text-blue-700 mt-0.5">{role}</p>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
