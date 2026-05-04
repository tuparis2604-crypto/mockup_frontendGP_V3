import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ClipboardList,
  Save,
  Send,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getMe,
  logout,
  getHighestRole,
  getAssessmentCycles,
  getManagerReview,
  saveManagerReview,
  getAllUsers,
  canEvaluateFormally,
} from "@/lib/api";
import type { User, ManagerReview } from "@/lib/api";

const QUESTIONS = [
  "Como você avalia o desempenho geral deste colaborador no ciclo?",
  "Quais foram os pontos críticos de desenvolvimento observados?",
  "Em quais competências você identificou maior evolução?",
  "Quais situações demonstraram melhor preparo para o próximo nível?",
];

export default function ManagerReviewPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [review, setReview] = useState<ManagerReview | null>(null);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [overall, setOverall] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cycleId, setCycleId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string>("—");

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }

        // Gestor auxiliar NÃO avalia formalmente
        if (!canEvaluateFormally(currentUser.roles)) {
          setLocation("/");
          return;
        }

        setUser(currentUser);
        const users = await getAllUsers();

        // Buscar o ciclo do gerido cujo gestor é o usuário atual
        const cycles = await getAssessmentCycles({ year: 2026 });
        const myCycle = cycles.find((c) => c.manager_id === currentUser.id);
        if (myCycle) {
          setCycleId(myCycle.id);
          const employee = users.find((u) => u.id === myCycle.employee_id);
          setEmployeeName(employee?.name || "—");

          const existing = await getManagerReview(myCycle.id);
          if (existing) {
            setReview(existing);
            const filled = QUESTIONS.map((q) => {
              const resp = existing.responses.find((r) => r.question === q);
              return resp?.answer || "";
            });
            setAnswers(filled);
            setOverall(existing.overall_assessment);
            setIsPublic(existing.visibility === "published");
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

  const handleSave = async (complete = false) => {
    if (!user || !cycleId) return;
    setSaving(true);
    try {
      const saved = await saveManagerReview({
        cycle_id: cycleId,
        manager_id: user.id,
        responses: QUESTIONS.map((q, i) => ({ question: q, answer: answers[i] })),
        overall_assessment: overall,
        visibility: isPublic ? "published" : "private",
        status: complete ? "completed" : "draft",
        published_at: isPublic ? new Date().toISOString() : undefined,
      });
      setReview(saved);
      toast.success(complete ? "Avaliação finalizada!" : "Rascunho salvo.");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const highestRole = getHighestRole(user.roles);
  const isCompleted = review?.status === "completed";
  const hasContent = answers.some((a) => a.trim()) || overall.trim();

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <ClipboardList size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Avaliação do Gestor</h1>
        <VersionBadge version="V1" />
      </div>

      <PageIntro text="Avaliação formal respondida pelo gestor. O gerido só visualiza se o gestor tornar pública. Gestor auxiliar não aparece como avaliador formal." />

      <div className="max-w-2xl">
        {/* Info sobre quem é avaliado */}
        {employeeName !== "—" && (
          <div className="mb-5 p-4 bg-secondary/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-0.5">Avaliando</p>
            <p className="font-bold text-foreground">{employeeName}</p>
          </div>
        )}

        {!cycleId && (
          <Card className="text-center py-8">
            <AlertTriangle size={24} className="mx-auto text-amber-500 mb-3" />
            <p className="text-muted-foreground text-sm">
              Nenhum gerido encontrado para avaliar. Certifique-se de que você é o gestor responsável no ciclo.
            </p>
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
                    placeholder="Sua avaliação..."
                    value={answers[idx]}
                    onChange={(e) =>
                      setAnswers((prev) => {
                        const updated = [...prev];
                        updated[idx] = e.target.value;
                        return updated;
                      })
                    }
                    className="min-h-24"
                    disabled={isCompleted}
                  />
                </div>
              ))}

              {/* Avaliação geral */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Avaliação Geral e Recomendação
                </label>
                <Textarea
                  placeholder="Síntese da avaliação e recomendação para o próximo ciclo..."
                  value={overall}
                  onChange={(e) => setOverall(e.target.value)}
                  className="min-h-28"
                  disabled={isCompleted}
                />
              </div>

              {/* Visibilidade */}
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Eye size={16} className="text-green-600" />
                    ) : (
                      <Lock size={16} className="text-slate-500" />
                    )}
                    <p className="font-semibold text-foreground text-sm">
                      {isPublic ? "Visível para o gerido" : "Privado — apenas você e o GP"}
                    </p>
                  </div>
                  {!isCompleted && (
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? "O gerido poderá visualizar esta avaliação na plataforma."
                    : "O gerido não verá esta avaliação. Apenas você e o GP têm acesso."}
                </p>
                {!isPublic && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                    <EyeOff size={12} />
                    Avaliação privada — gerido não tem acesso.
                  </div>
                )}
              </div>

              {/* Aviso: gestor auxiliar */}
              <div className="p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground">
                <strong>Nota:</strong> Gestor auxiliar não é avaliador formal. Esta tela é visível apenas para gestores com permissão de avaliação formal no ciclo.
              </div>

              {isCompleted && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Avaliação finalizada</span>
                  {isPublic && (
                    <span className="ml-auto text-xs text-green-700 flex items-center gap-1">
                      <Eye size={11} /> Publicada
                    </span>
                  )}
                </div>
              )}

              {!isCompleted && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={saving || !hasContent}
                    className="flex-1"
                  >
                    <Save size={14} className="mr-1" /> Salvar Rascunho
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving || !hasContent}
                    className="flex-1"
                  >
                    <Send size={14} className="mr-1" /> Finalizar Avaliação
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
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
          <strong>Modo MOCK:</strong> Avaliação salva localmente. Visibilidade real para o gerido controlada por Supabase/RLS na V2.
        </div>
      </div>
    </DashboardLayout>
  );
}
