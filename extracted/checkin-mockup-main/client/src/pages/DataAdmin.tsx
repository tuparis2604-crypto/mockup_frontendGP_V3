import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Database,
  Upload,
  Download,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Construction,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { Button } from "@/components/ui/button";
import { getMe, logout, getHighestRole, getAllUsers, isGP, isDP } from "@/lib/api";
import type { User } from "@/lib/api";

const integrationsRoadmap = [
  {
    name: "Supabase",
    description: "Base de dados principal, autenticação e RLS (segurança por perfil).",
    version: "V2" as const,
    status: "planned",
  },
  {
    name: "n8n",
    description: "Automações e orquestração de processos internos.",
    version: "V2" as const,
    status: "planned",
  },
  {
    name: "Smartsheet",
    description: "Espelho e integração com base atual de colaboradores.",
    version: "V2" as const,
    status: "planned",
  },
  {
    name: "LG",
    description: "Integração com sistema de treinamentos e desenvolvimento.",
    version: "V3" as const,
    status: "future",
  },
];

export default function DataAdmin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        if (!isGP(currentUser.roles) && !isDP(currentUser.roles)) {
          setLocation("/");
          return;
        }
        setUser(currentUser);
        const users = await getAllUsers();
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
  const employees = allUsers.filter((u) => u.roles.includes("Colaborador"));
  const managers = allUsers.filter((u) => u.roles.includes("Gestor"));
  const gpDp = allUsers.filter(
    (u) => u.roles.includes("Sócio") || u.roles.includes("GP") || u.roles.includes("RH") || u.roles.includes("DP")
  );

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <Database size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Dados / Admin</h1>
        <VersionBadge version="V2" />
      </div>

      <PageIntro text="Área administrativa para gestão de base, importações, exportações, integrações e consistência dos dados operacionais. Algumas funcionalidades chegam na V2 e V3." />

      {/* Resumo da base */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <Users size={16} className="text-accent" /> Base de Colaboradores
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-accent">{employees.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Geridos</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-accent">{managers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Gestores</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-accent">{gpDp.length}</p>
            <p className="text-xs text-muted-foreground mt-1">GP / DP</p>
          </Card>
        </div>

        {/* Tabela simplificada */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Nome</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Perfil</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Ciclo</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Área</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent text-xs font-bold">{u.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {u.roles[0]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{u.faixa}</td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{u.area || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Importação / Exportação (placeholder V2) */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-accent" /> Importação e Exportação
          <VersionBadge version="V2" />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="opacity-80 border-dashed">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Upload size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Importar CSV / XLSX</p>
                <VersionBadge version="V2" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Importar base de colaboradores, resultados de assessment ou dados históricos.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full opacity-60">
              <Upload size={14} className="mr-1" /> Importar arquivo
            </Button>
          </Card>

          <Card className="opacity-80 border-dashed">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Download size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Exportar Dados</p>
                <VersionBadge version="V2" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Exportar relatórios de desenvolvimento, check-ins, formulários e assessments.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full opacity-60">
              <Download size={14} className="mr-1" /> Exportar CSV
            </Button>
          </Card>
        </div>
      </section>

      {/* Integrações (roadmap) */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
          <RefreshCw size={16} className="text-accent" /> Integrações
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Preparação para conectar a plataforma com sistemas externos. Segurança real via Supabase/RLS.
        </p>
        <div className="space-y-3">
          {integrationsRoadmap.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-secondary/20"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <ExternalLink size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-foreground text-sm">{integration.name}</p>
                  <VersionBadge version={integration.version} />
                </div>
                <p className="text-xs text-muted-foreground">{integration.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600 flex-shrink-0">
                <Construction size={12} /> Planejado
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Validação de dados */}
      <section>
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-accent" /> Consistência de Dados
          <VersionBadge version="V2" />
        </h2>
        <Card className="opacity-80 border-dashed">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm mb-1">
                Validação automática de inconsistências
              </p>
              <p className="text-xs text-muted-foreground">
                Verificação de colaboradores sem gestor, ciclos sem GP, avaliações duplicadas e
                divergências entre base e Smartsheet. Disponível na V2.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-xs text-muted-foreground">Todos os usuários têm perfil definido</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Dados simulados. Importações, exportações e integrações reais chegam na V2/V3. Visível apenas para GP e DP.
      </div>
    </DashboardLayout>
  );
}
