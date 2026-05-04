import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  Layers,
  MessageSquarePlus,
  Paperclip,
  CalendarClock,
  ChevronDown,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMe,
  logout,
  getHighestRole,
  getAllUsers,
  listCheckins,
  isGP,
  isGestor,
  isGestorAuxiliar,
} from "@/lib/api";
import type { User, Checkin, RecordFlag, RecordStatus } from "@/lib/api";

const FLAG_CONFIG: Record<RecordFlag, { label: string; dot: string; bg: string; text: string }> = {
  green: { label: "Verde", dot: "bg-green-500", bg: "bg-green-100", text: "text-green-800" },
  yellow: { label: "Amarela", dot: "bg-amber-500", bg: "bg-amber-100", text: "text-amber-800" },
  red: { label: "Vermelha", dot: "bg-red-500", bg: "bg-red-100", text: "text-red-800" },
};

const STATUS_CONFIG: Record<RecordStatus, { label: string; icon: React.ReactNode }> = {
  draft: { label: "Rascunho", icon: <CalendarClock size={12} className="text-amber-500" /> },
  grouped: { label: "Agrupado", icon: <Layers size={12} className="text-indigo-500" /> },
  published: { label: "Publicado", icon: <CheckCircle2 size={12} className="text-green-500" /> },
};

function FlagDot({ flag }: { flag: RecordFlag }) {
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${FLAG_CONFIG[flag].dot}`} />;
}

function CheckinCard({
  checkin,
  author,
  subject,
}: {
  checkin: Checkin;
  author?: User;
  subject?: User;
}) {
  const flagCfg = FLAG_CONFIG[checkin.flag];
  const statusCfg = STATUS_CONFIG[checkin.status];
  const isPrivate = checkin.visibility === "private";

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <FlagDot flag={checkin.flag} />
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${flagCfg.bg} ${flagCfg.text}`}>
              {flagCfg.label}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-muted-foreground">{checkin.macro}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {statusCfg.icon} {statusCfg.label}
            </span>
            {isPrivate && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <EyeOff size={11} /> Privado
                </span>
              </>
            )}
            {!isPrivate && checkin.status === "published" && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Eye size={11} /> Visível ao gerido
                </span>
              </>
            )}
          </div>

          {/* Text */}
          <p className="text-sm text-foreground leading-relaxed">{checkin.text}</p>

          {/* Published note */}
          {checkin.published_note && (
            <p className="mt-2 text-xs text-muted-foreground italic border-l-2 border-border pl-2">
              {checkin.published_note}
            </p>
          )}

          {/* Footer */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              Sobre: <strong>{subject?.name || "—"}</strong>
            </span>
            <span>
              Por: <strong>{author?.name || "—"}</strong>
            </span>
            <span>{new Date(checkin.created_at).toLocaleDateString("pt-BR")}</span>
            {checkin.attachments.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip size={11} /> {checkin.attachments.length} anexo{checkin.attachments.length > 1 ? "s" : ""}
              </span>
            )}
            {checkin.meeting_request && (
              <span className="flex items-center gap-1 text-purple-600">
                <MessageSquarePlus size={11} /> Reunião solicitada
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Checkins() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchUser, setSearchUser] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [flagFilter, setFlagFilter] = useState<RecordFlag | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RecordStatus | "all">("all");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        setUser(currentUser);
        const [fetched, users] = await Promise.all([listCheckins(), getAllUsers()]);
        setAllUsers(users);

        // Filtrar checkins visíveis conforme perfil
        const highestRole = getHighestRole(currentUser.roles);
        const isElevated = isGP(currentUser.roles) || isGestor(currentUser.roles) || isGestorAuxiliar(currentUser.roles);
        const visible = isElevated
          ? fetched
          : fetched.filter(
              (c) =>
                c.subject_user_id === currentUser.id &&
                (c.visibility === "visible" || c.author_user_id === currentUser.id)
            );
        setCheckins(visible);
      } catch {
        setLocation("/login");
      } finally {
        setLoading(false);
      }
    };
    init();

    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const isElevated = isGP(user.roles) || isGestor(user.roles) || isGestorAuxiliar(user.roles);
  const highestRole = getHighestRole(user.roles);

  const managedUsers = allUsers.filter((u) => u.manager_id === user.id);
  const otherUsers = allUsers.filter((u) => u.manager_id !== user.id && u.id !== user.id);

  const filteredCheckins = checkins.filter((c) => {
    if (selectedUserId !== "all" && c.subject_user_id !== selectedUserId) return false;
    if (flagFilter !== "all" && c.flag !== flagFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const getUserById = (id: string) => allUsers.find((u) => u.id === id);
  const greenCount = checkins.filter((c) => c.flag === "green").length;
  const yellowCount = checkins.filter((c) => c.flag === "yellow").length;
  const redCount = checkins.filter((c) => c.flag === "red").length;
  const draftCount = checkins.filter((c) => c.status === "draft").length;

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Check-ins</h1>
        <VersionBadge version="V1" />
      </div>

      <PageIntro text="Registro contínuo de percepções, evidências, alertas e avanços, permitindo acompanhamento mais próximo da evolução profissional. Flags verde, amarela e vermelha sinalizam o tipo de observação." />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card className="text-center p-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <p className="text-xl font-bold text-green-700">{greenCount}</p>
          </div>
          <p className="text-xs text-muted-foreground">Verde</p>
        </Card>
        <Card className="text-center p-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <p className="text-xl font-bold text-amber-700">{yellowCount}</p>
          </div>
          <p className="text-xs text-muted-foreground">Amarela</p>
        </Card>
        <Card className="text-center p-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <p className="text-xl font-bold text-red-700">{redCount}</p>
          </div>
          <p className="text-xs text-muted-foreground">Vermelha</p>
        </Card>
        <Card className="text-center p-3">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock size={14} className="text-amber-500" />
            <p className="text-xl font-bold text-amber-700">{draftCount}</p>
          </div>
          <p className="text-xs text-muted-foreground">Rascunhos</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setLocation("/novo-registro")}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus size={16} /> Novo Check-in
        </Button>

        {/* Busca de colaborador */}
        {isElevated && (
          <div className="relative flex-1 min-w-48 max-w-64" ref={dropdownRef}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8 h-9 text-sm"
              placeholder="Filtrar por colaborador..."
              value={selectedUserId === "all" ? searchUser : getUserById(selectedUserId)?.name || ""}
              onFocus={() => { setSearchUser(""); setShowDropdown(true); }}
              onChange={(e) => {
                setSearchUser(e.target.value);
                setSelectedUserId("all");
                setShowDropdown(true);
              }}
            />
            {showDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-secondary text-sm transition-colors"
                  onClick={() => { setSelectedUserId("all"); setSearchUser(""); setShowDropdown(false); }}
                >
                  Todos os colaboradores
                </button>
                {managedUsers
                  .filter((u) => !searchUser || u.name.toLowerCase().includes(searchUser.toLowerCase()))
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-secondary text-sm transition-colors border-l-2 border-l-accent"
                      onClick={() => { setSelectedUserId(u.id); setShowDropdown(false); }}
                    >
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-accent">Meu gerido</p>
                    </button>
                  ))}
                {otherUsers
                  .filter((u) => !searchUser || u.name.toLowerCase().includes(searchUser.toLowerCase()))
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-secondary text-sm transition-colors"
                      onClick={() => { setSelectedUserId(u.id); setShowDropdown(false); }}
                    >
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.faixa}</p>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 h-9"
        >
          <Filter size={14} /> Filtros <ChevronDown size={12} className={`transition-transform ${showFilterPanel ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilterPanel && (
        <Card className="mb-4 p-4">
          <div className="flex flex-wrap gap-4">
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
                        ? f === "all"
                          ? "bg-foreground text-background border-foreground"
                          : `border-transparent ${FLAG_CONFIG[f as RecordFlag].bg} ${FLAG_CONFIG[f as RecordFlag].text}`
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {f !== "all" && (
                      <span className={`w-2 h-2 rounded-full ${FLAG_CONFIG[f as RecordFlag].dot}`} />
                    )}
                    {f === "all" ? "Todas" : FLAG_CONFIG[f as RecordFlag].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Status</p>
              <div className="flex gap-2">
                {(["all", "draft", "grouped", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      statusFilter === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {s === "all" ? "Todos" : STATUS_CONFIG[s as RecordStatus].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filteredCheckins.length} registro{filteredCheckins.length !== 1 ? "s" : ""}</p>
      </div>

      {filteredCheckins.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground text-sm mb-4">Nenhum check-in encontrado com os filtros selecionados.</p>
          <Button variant="outline" size="sm" onClick={() => setLocation("/novo-registro")}>
            <Plus size={14} className="mr-1" /> Criar Primeiro Check-in
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCheckins.map((checkin) => (
            <CheckinCard
              key={checkin.id}
              checkin={checkin}
              author={getUserById(checkin.author_user_id)}
              subject={getUserById(checkin.subject_user_id)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Dados simulados. Segurança por perfil (RLS) será implementada no Supabase.
      </div>
    </DashboardLayout>
  );
}
