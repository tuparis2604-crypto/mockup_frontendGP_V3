import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ClipboardList,
  Save,
  Send,
  Paperclip,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getMe,
  logout,
  getHighestRole,
  getAssessmentCycles,
  getProgressForms,
  saveProgressForm,
  isGP,
  isGestor,
} from "@/lib/api";
import type { User, ProgressForm } from "@/lib/api";

const QUESTIONS = [
  "Quais ações definidas na reunião principal foram colocadas em prática?",
  "O que avançou bem no seu desenvolvimento neste quadrimestre?",
  "O que está mais difícil e por quê?",
  "Que apoio ou recursos você precisaria para acelerar seu desenvolvimento?",
  "Como você avalia seu progresso em relação às metas definidas na jornada?",
];

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  not_started: {
    label: "Não iniciado",
    className: "bg-secondary text-muted-foreground",
    icon: <Clock size={12} />,
  },
  draft: {
    label: "Rascunho",
    className: "bg-amber-100 text-amber-800",
    icon: <Clock size={12} className="text-amber-500" />,
  },
  submitted: {
    label: "Enviado",
    className: "bg-green-100 text-green-800",
    icon: <CheckCircle2 size={12} className="text-green-600" />,
  },
  reviewed_by_gp: {
    label: "Revisado pelo GP",
    className: "bg-blue-100 text-blue-800",
    icon: <CheckCircle2 size={12} className="text-blue-600" />,
  },
};

export default function ProgressFormPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProgressForm | null>(null);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cycleId, setCycleId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        setUser(currentUser);

        const cycles = await getAssessmentCycles({ employee_id: currentUser.id });
        const cycle = cycles[0];
        if (cycle) {
          setCycleId(cycle.id);
          const forms = await getProgressForms({ cycle_id: cycle.id, employee_id: currentUser.id });
          const q1Form = forms.find((f) => f.quadrimestre === 1);
          if (q1Form && q1Form.status !== "not_started") {
            setForm(q1Form);
            const filled = QUESTIONS.map((q) => {
              const resp = q1Form.responses.find((r) => r.question === q);
              return resp?.answer || "";
            });
            setAnswers(filled);
            setAttachments(q1Form.attachments.map((a) => ({ name: a.name, type: a.type })));
          }
        }
      } catch {
        setLocation("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  const handleSave = async (submit = false) => {
    if (!user || !cycleId) return;
    setSaving(true);
    try {
      const saved = await saveProgressForm({
        cycle_id: cycleId,
        employee_id: user.id,
        quadrimestre: 1,
        responses: QUESTIONS.map((q, i) => ({ question: q, answer: answers[i] })),
        attachments: attachments.map((a) => ({ name: a.name, url: "", type: a.type })),
        status: submit ? "submitted" : "draft",
        due_date: "2026-06-30",
        submitted_at: submit ? new Date().toISOString() : undefined,
      });
      setForm(saved);
      toast.success(submit ? "Formulário enviado!" : "Rascunho salvo.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments((prev) => [...prev, { name: file.name, type: file.type }]);
    e.target.value = "";
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const highestRole = getHighestRole(user.roles);
  const isGPorGestor = isGP(user.roles) || isGestor(user.roles);
  const status = form?.status || "not_started";
  const statusCfg = STATUS_CONFIG[status];
  const isSubmitted = status === "submitted" || status === "reviewed_by_gp";
  const hasAnswers = answers.some((a) => a.trim());

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <ClipboardList size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Formulário de Avanço — Q1</h1>
        <VersionBadge version="V1" />
      </div>

      <PageIntro text="Formulário quadrimestral obrigatório respondido pelo gerido. Diferente dos check-ins contínuos — é um acompanhamento estruturado a cada 4 meses. O GP acompanha com reunião." />

      <div className="max-w-2xl">
        {/* Status e prazo */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusCfg.className}`}>
            {statusCfg.icon} {statusCfg.label}
          </div>
          <span className="text-xs text-muted-foreground">Prazo: 30/06/2026</span>
        </div>

        {/* Aviso para GP/Gestor */}
        {isGPorGestor && !isSubmitted && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-900">Este formulário é respondido pelo gerido</p>
            </div>
            <p className="text-xs text-amber-800">
              Apenas o gerido pode preencher e enviar este formulário. Você pode acompanhar o status no Ciclo de Assessment.
            </p>
          </div>
        )}

        {!cycleId && (
          <Card className="text-center py-8">
            <AlertTriangle size={24} className="mx-auto text-amber-500 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum ciclo ativo encontrado.</p>
          </Card>
        )}

        {cycleId && (
          <Card>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {QUESTIONS.map((question, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {idx + 1}. {question}
                  </label>
                  <Textarea
                    placeholder="Sua resposta..."
                    value={answers[idx]}
                    onChange={(e) =>
                      setAnswers((prev) => {
                        const updated = [...prev];
                        updated[idx] = e.target.value;
                        return updated;
                      })
                    }
                    className="min-h-20"
                    disabled={isSubmitted || (isGPorGestor && !isSubmitted)}
                  />
                </div>
              ))}

              {/* Anexos */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Evidências e Anexos (opcional)
                </label>
                {!isSubmitted && !isGPorGestor && (
                  <label className="flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors text-sm text-muted-foreground mb-3">
                    <Paperclip size={16} />
                    Adicionar arquivo
                    <input type="file" className="hidden" onChange={handleFileAdd} />
                  </label>
                )}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((a, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-secondary/40 rounded-lg">
                        <Paperclip size={14} className="text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{a.name}</span>
                        {!isSubmitted && !isGPorGestor && (
                          <button
                            type="button"
                            onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            <X size={14} className="text-muted-foreground hover:text-foreground" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nota sobre diferença do check-in */}
              <div className="p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
                <strong>Diferença do check-in contínuo:</strong> Este formulário é estruturado, obrigatório e acontece a cada 4 meses. O GP acompanha com reunião específica.
              </div>

              {isSubmitted && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-800">
                    {status === "reviewed_by_gp" ? "Revisado pelo GP" : "Formulário enviado — aguardando revisão do GP"}
                  </span>
                </div>
              )}

              {!isSubmitted && !isGPorGestor && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={saving || !hasAnswers}
                    className="flex-1"
                  >
                    <Save size={14} className="mr-1" /> Salvar Rascunho
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving || !hasAnswers}
                    className="flex-1"
                  >
                    <Send size={14} className="mr-1" /> Enviar Formulário
                  </Button>
                </div>
              )}
            </form>
          </Card>
        )}

        <div className="mt-4 flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setLocation("/ciclo-assessment")}>
            Voltar ao Ciclo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation("/jornada")}>
            Ver Jornada
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          <strong>Modo MOCK:</strong> Formulário salvo localmente. Obrigatório a cada 4 meses. GP acompanha com reunião.
        </div>
      </div>
    </DashboardLayout>
  );
}
