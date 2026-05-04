import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Upload, X, Search, CalendarClock, MessageSquarePlus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getMe,
  logout,
  getHighestRole,
  getAllUsers,
  getActivePeriod,
  getMacros,
  createCheckin,
} from "@/lib/api";
import type { User, RecordFlag, RecordStatus } from "@/lib/api";

const FLAG_CONFIG: Record<RecordFlag, { label: string; color: string; dot: string; description: string }> = {
  green: {
    label: "Verde — Positivo",
    color: "border-green-500 bg-green-50 text-green-800",
    dot: "bg-green-500",
    description: "Força, destaque, bom exemplo",
  },
  yellow: {
    label: "Amarela — Atenção",
    color: "border-amber-500 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
    description: "Ponto de melhoria, oportunidade",
  },
  red: {
    label: "Vermelha — Crítico",
    color: "border-red-500 bg-red-50 text-red-800",
    dot: "bg-red-500",
    description: "Situação crítica, requer atenção imediata",
  },
};

export default function NewRecord() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [managedUsers, setManagedUsers] = useState<User[]>([]);
  const [macros, setMacros] = useState<string[]>([]);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState("self");
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [description, setDescription] = useState("");
  const [flag, setFlag] = useState<RecordFlag>("green");
  const [competency, setCompetency] = useState("");
  const [visible, setVisible] = useState(true);
  const [status, setStatus] = useState<RecordStatus>("published");
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const [hasMeetingRequest, setHasMeetingRequest] = useState(false);
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [publishedNote, setPublishedNote] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const user = await getMe();
      if (!user) { setLocation("/login"); return; }
      setCurrentUser(user);

      const users = await getAllUsers();
      setAllUsers(users);
      setManagedUsers(users.filter((u) => u.manager_id === user.id));
    };
    getMacros().then(setMacros);
    init();
  }, [setLocation]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments([...attachments, { name: file.name, type: file.type }]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.id !== currentUser?.id &&
      u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUserName =
    selectedUserId === "self"
      ? "Mim mesmo"
      : allUsers.find((u) => u.id === selectedUserId)?.name || "";

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id);
    setUserSearch(user.name);
    setShowUserDropdown(false);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    const periodResult = await getActivePeriod(
      selectedUserId === "self" ? currentUser.id : selectedUserId
    );

    await createCheckin({
      subject_user_id: selectedUserId === "self" ? currentUser.id : selectedUserId,
      period_id: periodResult?.id,
      flag,
      macro: competency,
      text: description,
      visibility: visible ? "visible" : "private",
      status,
      attachments: attachments.map((a) => ({ name: a.name, url: "", type: a.type })),
      meeting_request: hasMeetingRequest && meetingAgenda.trim()
        ? {
            id: `mr-${Date.now()}`,
            record_id: "",
            agenda: meetingAgenda,
            requested_at: new Date().toISOString(),
            status: "pending",
          }
        : undefined,
      published_note: status === "published" && publishedNote.trim() ? publishedNote : undefined,
    });

    setLocation("/progresso");
  };

  const isFormValid = description.trim() && competency && flag;

  if (!currentUser) return null;

  const isManager =
    currentUser.roles.includes("Gestor") ||
    currentUser.roles.includes("RH") ||
    currentUser.roles.includes("Sócio");

  return (
    <DashboardLayout
      userName={currentUser.name}
      userRole={getHighestRole(currentUser.roles)}
      onLogout={handleLogout}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Novo Registro</h1>
        <p className="text-muted-foreground">
          Registre um fato observado vinculado ao período de desenvolvimento em curso.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

            {/* ── Quem é o registro ── */}
            {isManager && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Registrar para:
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Buscar colaborador ou 'mim mesmo'..."
                      value={selectedUserId === "self" ? "Mim mesmo" : userSearch}
                      onFocus={() => {
                        if (selectedUserId === "self") setUserSearch("");
                        setShowUserDropdown(true);
                      }}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setSelectedUserId("");
                        setShowUserDropdown(true);
                      }}
                    />
                  </div>

                  {showUserDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {/* Self option */}
                      {(!userSearch || "mim mesmo".includes(userSearch.toLowerCase())) && (
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors"
                          onClick={() => {
                            setSelectedUserId("self");
                            setUserSearch("");
                            setShowUserDropdown(false);
                          }}
                        >
                          <p className="text-sm font-medium text-foreground">Mim mesmo</p>
                        </button>
                      )}

                      {/* Managed users — highlighted */}
                      {managedUsers
                        .filter((u) => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()))
                        .map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors border-l-2 border-l-accent"
                            onClick={() => handleSelectUser(u)}
                          >
                            <p className="text-sm font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-accent">Meu gerido · {u.faixa}</p>
                          </button>
                        ))}

                      {/* Other users */}
                      {filteredUsers
                        .filter((u) => !managedUsers.some((m) => m.id === u.id))
                        .map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors"
                            onClick={() => handleSelectUser(u)}
                          >
                            <p className="text-sm font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.faixa} · {getHighestRole(u.roles)}</p>
                          </button>
                        ))}

                      {filteredUsers.length === 0 && userSearch && userSearch !== "Mim mesmo" && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum colaborador encontrado.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Descrição ── */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descreva o fato observado *
              </label>
              <Textarea
                placeholder="Ex: Conduziu a reunião de planejamento de forma estruturada, alinhando todos os stakeholders..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-32"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Seja específico: contexto, ações observadas e resultado.
              </p>
            </div>

            {/* ── Flag ── */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Flag do Registro *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(FLAG_CONFIG) as RecordFlag[]).map((f) => {
                  const cfg = FLAG_CONFIG[f];
                  return (
                    <label
                      key={f}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        flag === f ? cfg.color : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="flag"
                        value={f}
                        checked={flag === f}
                        onChange={() => setFlag(f)}
                        className="sr-only"
                      />
                      <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${cfg.dot}`} />
                      <div>
                        <p className="text-sm font-semibold leading-tight">{cfg.label}</p>
                        <p className="text-xs opacity-80 mt-0.5">{cfg.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── Macrocompetência ── */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Macrocompetência *
              </label>
              <Select value={competency} onValueChange={setCompetency}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma competência" />
                </SelectTrigger>
                <SelectContent>
                  {macros.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Visibilidade ── */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground text-sm">Visível para o colaborador</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Se desativado, apenas gestores e RH verão este registro.
                </p>
              </div>
              <Switch checked={visible} onCheckedChange={setVisible} />
            </div>

            {/* ── Status: rascunho ou publicar ── */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Como salvar?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    status === "draft" ? "border-amber-400 bg-amber-50" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    className="sr-only"
                  />
                  <CalendarClock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Salvar como Rascunho</p>
                    <p className="text-xs text-muted-foreground">Fica armazenado sem ser publicado. Você pode revisar e publicar depois.</p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    status === "published" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === "published"}
                    onChange={() => setStatus("published")}
                    className="sr-only"
                  />
                  <div className="w-4 h-4 rounded-full bg-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Publicar agora</p>
                    <p className="text-xs text-muted-foreground">O registro entra imediatamente no histórico do período.</p>
                  </div>
                </label>
              </div>

              {/* Nota de publicação */}
              {status === "published" && (
                <div className="mt-3">
                  <Textarea
                    placeholder="Nota de publicação (opcional) — contexto adicional ao publicar..."
                    value={publishedNote}
                    onChange={(e) => setPublishedNote(e.target.value)}
                    className="min-h-16 text-sm"
                  />
                </div>
              )}
            </div>

            {/* ── Pedido de Reunião ── */}
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus size={18} className="text-muted-foreground" />
                  <p className="font-medium text-foreground text-sm">Sinalizar necessidade de reunião</p>
                </div>
                <Switch checked={hasMeetingRequest} onCheckedChange={setHasMeetingRequest} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Isso não agenda uma reunião. É apenas uma sinalização com pauta específica para o gestor.
              </p>
              {hasMeetingRequest && (
                <Textarea
                  placeholder="Descreva a pauta da reunião que você gostaria de ter..."
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  className="min-h-20 text-sm"
                />
              )}
            </div>

            {/* ── Anexos ── */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Anexos (opcional)
              </label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-5 text-center hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={22} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para adicionar um arquivo</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-lg">
                      <span className="text-sm text-foreground truncate">{a.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Aviso privacidade ── */}
            {!visible && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>Privado:</strong> Este registro não ficará visível para o colaborador, mas
                  será considerado na análise de desenvolvimento do período.
                </p>
              </div>
            )}

            {/* ── Ações ── */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={!isFormValid}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {status === "draft" ? "Salvar Rascunho" : "Publicar Registro"}
              </Button>
              <Button
                type="button"
                onClick={() => setLocation("/progresso")}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
