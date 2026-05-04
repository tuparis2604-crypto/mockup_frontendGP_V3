import { ReactNode, useState } from "react";
import { Home, TrendingUp, FileText, Users, BarChart3, Settings, Menu, X, LogOut, Map } from "lucide-react";
import { Link, useLocation } from "wouter";

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  adminOnly?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/", icon: <Home size={20} /> },
  { label: "Meu Progresso", path: "/progresso", icon: <TrendingUp size={20} /> },
  { label: "Novo Registro", path: "/novo-registro", icon: <FileText size={20} /> },
  { label: "Dashboard Pessoal", path: "/dashboard-pessoal", icon: <BarChart3 size={20} /> },
  { label: "Meu Time", path: "/meu-time", icon: <Users size={20} />, adminOnly: true },
  { label: "Dashboards", path: "/dashboards", icon: <BarChart3 size={20} />, adminOnly: true },
  {
    label: "Mapa de Desenvolvimento",
    path: "/mapa-desenvolvimento",
    icon: <Map size={20} />,
    badge: "Em breve",
  },
  { label: "Configurações", path: "/configuracoes", icon: <Settings size={20} /> },
];

function DashboardLayoutContent({
  children,
  userName,
  userRole,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, setLocation] = useLocation();

  const isAdmin = userRole === "RH" || userRole === "Sócio" || userRole === "Gestor";

  return (
    <div className="flex h-screen bg-background flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-full md:w-64" : "w-20"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col md:relative absolute md:static z-40 ${
          sidebarOpen ? "" : "hidden md:flex"
        }`}
      >
        {/* Logo/Brand */}
        <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4">
          {sidebarOpen && (
            <img src="/logo-asbz.png" alt="ASBZ" className="h-12 object-contain" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-secondary rounded-lg p-2 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const isActive = location === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors block ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-secondary"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 leading-tight">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-secondary transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8">
          <div className="flex-1" />
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
            <button
              onClick={() => setLocation("/configuracoes")}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors cursor-pointer"
              title="Abrir Configurações"
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

export default DashboardLayoutContent;
