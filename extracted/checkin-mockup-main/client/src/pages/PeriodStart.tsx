import { useState, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  CalendarDays,
  Target,
  Lightbulb,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAssessment, saveKickoff, createPeriod } from "@/lib/api";
import type { MacroGoal, PeriodSuggestion, AssessmentAttachment } from "@/lib/api";

const MACROS_LIST = [
  "Liderança",
  "Comunicação",
  "Resolução de Problemas",
  "Trabalho em Equipe",
  "Inovação",
  "Gestão de Pessoas",
  "Visão Estratégica",
  "Foco em Resultados",
];

interface GoalForm {
  macro: string;
  description: string;
  target: string;
}

interface SuggestionForm {
  text: string;
}

export default function PeriodStart() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/inicio-periodo/:userId");
  const userId = params?.userId || "";

  const [step, setStep] = useState<"assessment" | "kickoff" | "goals" | "done">("assessment");
  const [saving, setSaving] = useState(false);
  const [periodId] = useState(`period-${Date.now()}`);

  // Assessment state
  const [assessmentSummary, setAssessmentSummary] = useState("");
  const [assessedAt, setAssessedAt] = useState("");
  const [attachedFile, setAttachedFile] = useState<AssessmentAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kickoff state
  const [kickoffDate, setKickoffDate] = useState("");
  const [kickoffConclusions, setKickoffConclusions] = useState("");
  const [selectedMacros, setSelectedMacros] = useState<string[]>([]);

  // Goals state
  const [goals, setGoals] = useState<GoalForm[]>([
    { macro: "", description: "", target: "" },
  ]);
  const [suggestions, setSuggestions] = useState<SuggestionForm[]>([
    { text: "" },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }
    setAttachedFile({
      id: `attach-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString(),
    });
  };

  const toggleMacro = (macro: string) => {
    setSelectedMacros((prev) =>
      prev.includes(macro) ? prev.filter((m) => m !== macro) : [...prev, macro]
    );
  };

  const addGoal = () => setGoals([...goals, { macro: "", description: "", target: "" }]);
  const removeGoal = (idx: number) => setGoals(goals.filter((_, i) => i !== idx));
  const updateGoal = (idx: number, field: keyof GoalForm, value: string) => {
    setGoals(goals.map((g, i) => (i === idx ? { ...g, [field]: value } : g)));
  };

  const addSuggestion = () => setSuggestions([...suggestions, { text: "" }]);
  const removeSuggestion = (idx: number) => setSuggestions(suggestions.filter((_, i) => i !== idx));
  const updateSuggestion = (idx: number, value: string) => {
    setSuggestions(suggestions.map((s, i) => (i === idx ? { text: value } : s)));
  };

  const handleSaveAssessment = async () => {
    if (!assessmentSummary.trim() || !assessedAt) return;
    setSaving(true);
    try {
      await createPeriod({
        id: periodId,
        employee_id: userId,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "active",
      });
      await saveAssessment({
        period_id: periodId,
        employee_id: userId,
        result_summary: assessmentSummary,
        attachment: attachedFile || undefined,
        assessed_at: assessedAt,
      });
      setStep("kickoff");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKickoff = async () => {
    if (!kickoffDate || !kickoffConclusions.trim()) return;
    setSaving(true);
    try {
      await saveKickoff({
        period_id: periodId,
        employee_id: userId,
        meeting_date: kickoffDate,
        conclusions: kickoffConclusions,
        macros: selectedMacros,
        goals: [],
        suggestions: [],
      });
      setStep("goals");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoalsAndSuggestions = async () => {
    setSaving(true);
    try {
      const mappedGoals: MacroGoal[] = goals
        .filter((g) => g.macro && g.description)
        .map((g, i) => ({
          id: `goal-${Date.now()}-${i}`,
          period_id: periodId,
          macro: g.macro,
          description: g.description,
          target: g.target || undefined,
          status: "active" as const,
          created_at: new Date().toISOString(),
        }));
      const mappedSuggestions: PeriodSuggestion[] = suggestions
        .filter((s) => s.text.trim())
        .map((s, i) => ({
          id: `sug-${Date.now()}-${i}`,
          period_id: periodId,
          text: s.text,
          source: "kickoff" as const,
          status: "pending" as const,
          created_at: new Date().toISOString(),
        }));
      await saveKickoff({
        period_id: periodId,
        employee_id: userId,
        meeting_date: kickoffDate,
        conclusions: kickoffConclusions,
        macros: selectedMacros,
        goals: mappedGoals,
        suggestions: mappedSuggestions,
      });
      setStep("done");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: "assessment", label: "Assessment", icon: FileText },
    { id: "kickoff", label: "Reunião Inicial", icon: Users },
    { id: "goals", label: "Macros e Metas", icon: Target },
  ];

  const currentStepIdx = steps.findIndex((s) => s.id === step);

  if (step === "done") {
    return (
      <DashboardLayout userName="João" userRole="Gestor" onLogout={() => setLocation("/login")}>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Período iniciado!</h1>
          <p className="text-muted-foreground mb-8">
            O período de desenvolvimento foi registrado com sucesso. Os dados já estão disponíveis
            na página de acompanhamento.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setLocation(`/gerido/${userId}`)} className="bg-primary text-primary-foreground">
              Ver Acompanhamento
            </Button>
            <Button variant="outline" onClick={() => setLocation("/meu-time")}>
              Voltar ao Time
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="João" userRole="Gestor" onLogout={() => setLocation("/login")}>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => setLocation("/meu-time")}
          className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Voltar para Meu Time</span>
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Início do Período</h1>
        <p className="text-muted-foreground">
          Registre o assessment, reunião inicial e direcionadores do período de desenvolvimento de 6 meses.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const done = idx < currentStepIdx;
          const active = s.id === step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                    ? "bg-green-100 text-green-800"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle size={16} /> : <Icon size={16} />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 w-6 ${done ? "bg-green-400" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: ASSESSMENT ── */}
      {step === "assessment" && (
        <div className="max-w-2xl">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Resultado do Assessment</h2>
                <p className="text-sm text-muted-foreground">
                  O assessment é realizado fora da plataforma. Registre aqui o resultado.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data do Assessment *
                </label>
                <Input
                  type="date"
                  value={assessedAt}
                  onChange={(e) => setAssessedAt(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resumo do Resultado *
                </label>
                <Textarea
                  placeholder="Descreva os principais resultados, pontos fortes e áreas de desenvolvimento identificados no assessment..."
                  value={assessmentSummary}
                  onChange={(e) => setAssessmentSummary(e.target.value)}
                  className="min-h-32"
                />
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Anexo do Assessment (PDF)
                </label>
                {!attachedFile ? (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Clique para selecionar o PDF do assessment
                    </p>
                    <p className="text-xs text-muted-foreground">Somente arquivos PDF</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText size={20} className="text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900 truncate">
                        {attachedFile.name}
                      </p>
                      <p className="text-xs text-green-700">
                        PDF · {(attachedFile.size / 1024).toFixed(0)} KB ·{" "}
                        {new Date(attachedFile.uploaded_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAttachedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="text-green-600 hover:text-red-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSaveAssessment}
                  disabled={!assessmentSummary.trim() || !assessedAt || saving}
                  className="bg-primary text-primary-foreground"
                >
                  {saving ? "Salvando..." : "Salvar e Continuar"}
                </Button>
                <Button variant="outline" onClick={() => setLocation("/meu-time")}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── STEP 2: KICKOFF ── */}
      {step === "kickoff" && (
        <div className="max-w-2xl">
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Reunião Inicial de Alinhamento</h2>
                <p className="text-sm text-muted-foreground">
                  Registre as conclusões e os focos definidos na primeira reunião do período.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data da Reunião *
                </label>
                <Input
                  type="date"
                  value={kickoffDate}
                  onChange={(e) => setKickoffDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Conclusões da Reunião *
                </label>
                <Textarea
                  placeholder="Descreva o que foi alinhado: contexto do colaborador, desafios do período, direcionamentos principais..."
                  value={kickoffConclusions}
                  onChange={(e) => setKickoffConclusions(e.target.value)}
                  className="min-h-32"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Macrocompetências do Período
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Selecione as competências que serão o foco deste período.
                </p>
                <div className="flex flex-wrap gap-2">
                  {MACROS_LIST.map((macro) => (
                    <button
                      key={macro}
                      type="button"
                      onClick={() => toggleMacro(macro)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedMacros.includes(macro)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {macro}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSaveKickoff}
                  disabled={!kickoffDate || !kickoffConclusions.trim() || saving}
                  className="bg-primary text-primary-foreground"
                >
                  {saving ? "Salvando..." : "Salvar e Continuar"}
                </Button>
                <Button variant="outline" onClick={() => setStep("assessment")}>
                  Voltar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── STEP 3: GOALS & SUGGESTIONS ── */}
      {step === "goals" && (
        <div className="max-w-2xl space-y-6">
          {/* Metas */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Target size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Metas do Período</h2>
                <p className="text-sm text-muted-foreground">
                  Defina metas concretas para cada macrocompetência foco.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {goals.map((goal, idx) => (
                <div key={idx} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Meta {idx + 1}</span>
                    {goals.length > 1 && (
                      <button onClick={() => removeGoal(idx)} className="text-muted-foreground hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <Select value={goal.macro} onValueChange={(v) => updateGoal(idx, "macro", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Macrocompetência" />
                    </SelectTrigger>
                    <SelectContent>
                      {MACROS_LIST.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Descrição da meta de desenvolvimento..."
                    value={goal.description}
                    onChange={(e) => updateGoal(idx, "description", e.target.value)}
                    className="min-h-20"
                  />
                  <Input
                    placeholder="Critério de sucesso (opcional)"
                    value={goal.target}
                    onChange={(e) => updateGoal(idx, "target", e.target.value)}
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addGoal} className="w-full">
                <Plus size={16} className="mr-2" />
                Adicionar Meta
              </Button>
            </div>
          </Card>

          {/* Sugestões */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Lightbulb size={20} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Sugestões Iniciais</h2>
                <p className="text-sm text-muted-foreground">
                  Ações, leituras, cursos ou comportamentos sugeridos para o período.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {suggestions.map((sug, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder={`Sugestão ${idx + 1} (ex: Curso de Liderança, Leitura X...)`}
                    value={sug.text}
                    onChange={(e) => updateSuggestion(idx, e.target.value)}
                    className="flex-1"
                  />
                  {suggestions.length > 1 && (
                    <button onClick={() => removeSuggestion(idx)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSuggestion} className="w-full">
                <Plus size={16} className="mr-2" />
                Adicionar Sugestão
              </Button>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveGoalsAndSuggestions}
              disabled={saving}
              className="bg-primary text-primary-foreground"
            >
              {saving ? "Finalizando..." : "Concluir Início do Período"}
            </Button>
            <Button variant="outline" onClick={() => setStep("kickoff")}>
              Voltar
            </Button>
          </div>

          <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={14} className="text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Período de 6 meses</p>
            </div>
            <p className="text-xs text-muted-foreground">
              O período terá duração de 6 meses a partir da data de início. Durante esse
              tempo acontecerão os check-ins contínuos e eventuais reuniões intermediárias.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
