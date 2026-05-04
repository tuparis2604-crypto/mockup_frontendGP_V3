import { ReactNode, useState } from "react";
import {
  Home,
  ClipboardList,
  MessageSquare,
  History,
  AlertCircle,
  Route,
  Map,
  GraduationCap,
  BarChart2,
  Database,
  Settings,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { getRoleDisplayName } from "@/lib/api";

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

type NavVersion = "V1" | "V2" | "V3";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  adminOnly?: boolean;
  gpOnly?: boolean;
  dpOnly?: boolean;
  version?: NavVersion;
  badge?: string;
  group?: string;
}

const navItems: NavItem[] = [
  // ── Principal (V1) ─────────────────────────────────────────────────────────
  { label: "Dashboard", path: "/", icon: <Home size={18} />, group: "Principal" },
  {
    label: "Ciclo de Assessment",
    path: "/ciclo-assessment",
    icon: <ClipboardList size={18} />,
    version: "V1",
    group: "Principal",
  },
  {
    label: "Check-ins",
    path: "/checkins",
    icon: <MessageSquare size={18} />,
    version: "V1",
    group: "Principal",
  },
  {
    label: "Histórico",
    path: "/historico",
    icon: <History size={18} />,
    version: "V1",
    group: "Principal",
  },
  {
    label: "Pendências",
    path: "/pendencias",
    icon: <AlertCircle size={18} />,
    version: "V1",
    gpOnly: true,
    group: "Principal",
  },
  {
    label: "Jornada",
    path: "/jornada",
    icon: <Route size={18} />,
    version: "V1",
    group: "Principal",
  },
  // ── Ferramentas (V2/V3) ────────────────────────────────────────────────────
  {
    label: "Mapa de Desenvolvimento",
    path: "/mapa-desenvolvimento",
    icon: <Map size={18} />,
    version: "V3",
    group: "Ferramentas",
  },
  {
    label: "Treinamentos",
    path: "/treinamentos",
    icon: <GraduationCap size={18} />,
    version: "V3",
    group: "Ferramentas",
  },
  {
    label: "Pesquisas",
    path: "/pesquisas",
    icon: <BarChart2 size={18} />,
    version: "V3",
    group: "Ferramentas",
  },
  // ── Administração ──────────────────────────────────────────────────────────
  {
    label: "Meu Time",
    path: "/meu-time",
    icon: <Users size={18} />,
    adminOnly: true,
    group: "Administração",
  },
  {
    label: "Dashboards",
    path: "/dashboards",
    icon: <BarChart3 size={18} />,
    adminOnly: true,
    group: "Administração",
  },
  {
    label: "Dados / Admin",
    path: "/dados-admin",
    icon: <Database size={18} />,
    dpOnly: true,
    version: "V2",
    group: "Administração",
  },
  // ── Sistema ────────────────────────────────────────────────────────────────
  { label: "Configurações", path: "/configuracoes", icon: <Settings size={18} />, group: "Sistema" },
];

const VERSION_BADGE: Record<NavVersion, { label: string; className: string }> = {
  V1: { label: "V1", className: "bg-blue-50 text-blue-600 border-blue-100" },
  V2: { label: "V2", className: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  V3: { label: "V3", className: "bg-amber-50 text-amber-600 border-amber-100" },
};

const GROUPS_ORDER = ["Principal", "Ferramentas", "Administração", "Sistema"];

function groupItems(items: NavItem[]): Record<string, NavItem[]> {
  const result: Record<string, NavItem[]> = {};
  for (const g of GROUPS_ORDER) result[g] = [];
  for (const item of items) {
    const g = item.group || "Principal";
    if (!result[g]) result[g] = [];
    result[g].push(item);
  }
  return result;
}

export default function DashboardLayoutContent({
  children,
  userName,
  userRole,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useLocation();

  const isAdmin = userRole === "RH" || userRole === "Sócio" || userRole === "Gestor" || userRole === "GP" || userRole === "DP";
  const isGP = userRole === "Sócio" || userRole === "GP";
  const isDP = userRole === "RH" || userRole === "DP";

  const displayRole = getRoleDisplayName(userRole);

  const canSee = (item: NavItem) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.gpOnly && !isGP) return false;
    if (item.dpOnly && !isDP && !isGP) return false;
    return true;
  };

  const grouped = groupItems(navItems.filter(canSee));

  return (
    <div className="flex h-screen bg-background flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-full md:w-64" : "w-16"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col md:relative absolute md:static z-40 ${
          sidebarOpen ? "" : "hidden md:flex"
        }`}
      >
        {/* Logo/Brand */}
        <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4 flex-shrink-0">
          {sidebarOpen && (
            <img src="/logo-asbz.png" alt="ASBZ" className="h-10 object-contain" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-secondary rounded-lg p-2 transition-colors ml-auto"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-4">
          {GROUPS_ORDER.map((group) => {
            const items = grouped[group];
            if (!items || items.length === 0) return null;
            return (
              <div key={group}>
                {sidebarOpen && (
                  <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {group}
                  </p>
                )}
                {items.map((item) => {
                  const isActive = location === item.path;
                  const versionCfg = item.version ? VERSION_BADGE[item.version] : null;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {sidebarOpen && (
                        <>
                          <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                          {versionCfg && (
                            <span
                              className={`text-[9px] font-bold px-1 py-0.5 rounded border leading-tight flex-shrink-0 ${versionCfg.className}`}
                            >
                              {versionCfg.label}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-3 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-secondary transition-colors"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground hover:bg-secondary rounded-lg p-2 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{displayRole}</p>
            </div>
            <button
              onClick={() => setLocation("/configuracoes")}
              className="w-9 h-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors cursor-pointer flex-shrink-0"
              title="Configurações"
              type="button"
            >
              <span className="text-accent-foreground font-bold text-sm">
                {userName.charAt(0)}
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
