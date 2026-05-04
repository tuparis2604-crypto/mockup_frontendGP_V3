import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FilePen, Save, Send, Paperclip, X, CheckCircle2, Clock, Eye } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getMe, logout, getHighestRole, getAssessmentCycles, getSelfReview, saveSelfReview } from "@/lib/api";
import type { User, SelfReview as SelfReviewType } from "@/lib/api";

const QUESTIONS = [
  "Quais foram suas principais entregas e conquistas neste ciclo?",
  "Em quais áreas você percebeu maior crescimento?",
  "O que você identificou como principal oportunidade de desenvolvimento?",
  "Quais situações foram mais desafiadoras e como você as enfrentou?",
  "Que evidências você pode compartilhar do seu desenvolvimento?",
];

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  draft: {
    label: "Rascunho",
    className: "bg-amber-100 text-amber-800",
    icon: <Clock size={12} />,
  },
  submitted: {
    label: "Enviada",
    className: "bg-green-100 text-green-800",
    icon: <CheckCircle2 size={12} />,
  },
  reviewed: {
    label: "Revisada pelo GP",
    className: "bg-blue-100 text-blue-800",
    icon: <Eye size={12} />,
  },
};

export default function SelfReview() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [selfReview, setSelfReview] = useState<SelfReviewType | null>(null);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        setUser(currentUser);

        const cycles = await getAssessmentCycles({ employee_id: currentUser.id });
        const cycle = cycles[0];
        if (cycle) {
          const review = await getSelfReview(cycle.id);
          if (review) {
            setSelfReview(review);
            const filled = QUESTIONS.map((q) => {
              const resp = review.responses.find((r) => r.question === q);
              return resp?.answer || "";
            });
            setAnswers(filled);
            setAttachments(
              review.attachments.map((a) => ({ name: a.name, type: a.type }))
            );
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
    if (!user) return;
    setSaving(true);
    try {
      const cycles = await getAssessmentCycles({ employee_id: user.id });
      const cycle = cycles[0];
      if (!cycle) return;

      const review = await saveSelfReview({
        cycle_id: cycle.id,
        employee_id: user.id,
        responses: QUESTIONS.map((q, i) => ({ question: q, answer: answers[i] })),
        attachments: attachments.map((a) => ({ name: a.name, url: "", type: a.type })),
        status: submit ? "submitted" : "draft",
        submitted_at: submit ? new Date().toISOString() : undefined,
      });

      setSelfReview(review);
      toast.success(submit ? "Autoavaliação enviada!" : "Rascunho salvo com sucesso.");
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
  const isSubmitted = selfReview?.status === "submitted" || selfReview?.status === "reviewed";
  const statusCfg = selfReview ? STATUS_CONFIG[selfReview.status] : null;
  const hasAnswers = answers.some((a) => a.trim().length > 0);

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <FilePen size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Autoavaliação</h1>
        <VersionBadge version="V1" />
      </div>

      <PageIntro text="Respondida pelo gerido. Será acompanhada pelo GP na Reunião 2. Você pode salvar como rascunho e continuar depois. Adicione evidências e anexos se quiser." />

      <div className="max-w-2xl">
        {/* Status */}
        {statusCfg && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-5 ${statusCfg.className}`}>
            {statusCfg.icon}
            <span className="text-sm font-semibold">{statusCfg.label}</span>
            {selfReview?.submitted_at && (
              <span className="text-xs ml-auto opacity-80">
                {new Date(selfReview.submitted_at).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        )}

        {isSubmitted && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-5 text-sm text-blue-900">
            <strong>Autoavaliação enviada.</strong> O GP poderá revisá-la antes da Reunião 2. Após o envio, não é possível editar.
          </div>
        )}

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
                  className="min-h-24"
                  disabled={isSubmitted}
                />
              </div>
            ))}

            {/* Anexos */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Evidências e Anexos (opcional)
              </label>
              {!isSubmitted && (
                <label className="flex items-center gap-2 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors text-sm text-muted-foreground mb-3">
                  <Paperclip size={16} />
                  Adicionar arquivo (PDF, imagem, documento...)
                  <input type="file" className="hidden" onChange={handleFileAdd} />
                </label>
              )}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-secondary/40 rounded-lg">
                      <Paperclip size={14} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground flex-1 truncate">{a.name}</span>
                      {!isSubmitted && (
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aviso de privacidade */}
            <div className="p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
              Sua autoavaliação será revisada pelo GP. O gestor verá apenas o que for compartilhado na Reunião 2.
            </div>

            {/* Ações */}
            {!isSubmitted && (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={saving || !hasAnswers}
                  className="flex-1"
                >
                  <Save size={14} className="mr-1" />
                  Salvar Rascunho
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving || !hasAnswers}
                  className="flex-1"
                >
                  <Send size={14} className="mr-1" />
                  Enviar Autoavaliação
                </Button>
              </div>
            )}
          </form>
        </Card>

        <div className="mt-4 flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setLocation("/ciclo-assessment")}>
            Voltar ao Ciclo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation("/jornada")}>
            Ver Jornada
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          <strong>Modo MOCK:</strong> Autoavaliação salva localmente. Em V2, integrado com Supabase.
        </div>
      </div>
    </DashboardLayout>
  );
}
