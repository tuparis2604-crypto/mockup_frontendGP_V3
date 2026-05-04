import { useState } from "react";
import { useLocation } from "wouter";
import { Copy, Download, ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Summary() {
  const [, setLocation] = useLocation();
  const [userName] = useState("João Silva");
  const [summaryType] = useState<"self" | "managed">("self");

  const handleLogout = () => {
    setLocation("/login");
  };

  const handleCopyText = () => {
    const text = document.getElementById("summary-content")?.innerText || "";
    navigator.clipboard.writeText(text);
    toast.success("Resumo copiado para a área de transferência!");
  };

  const handleDownload = () => {
    toast.success("Resumo baixado com sucesso!");
  };

  return (
    <DashboardLayout
      userName={userName}
      userRole="Gestor"
      onLogout={handleLogout}
    >
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => setLocation("/progresso")}
          className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Voltar para Meu Progresso</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Resumo do Período</h1>
          <p className="text-muted-foreground">
            Síntese automática de seu desenvolvimento com base nos registros do período.
          </p>
        </div>
      </div>

      {/* Summary Type Badge */}
      <div className="mb-6">
        <span className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium">
          {summaryType === "self" ? "Resumo do Gerido" : "Resumo do Gestor"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button
          onClick={handleCopyText}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Copy size={18} />
          Copiar Texto
        </Button>
        <Button
          onClick={handleDownload}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          <Download size={18} />
          Exportar PDF
        </Button>
      </div>

      {/* Summary Content */}
      <Card id="summary-content" className="prose prose-sm max-w-none">
        {/* Visão Geral */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Visão Geral do Período</h2>
          <p className="text-foreground leading-relaxed">
            Durante o período de análise (janeiro a junho de 2026), você demonstrou um desenvolvimento
            consistente e progressivo em diversas áreas de competência. Foram registrados 12 eventos
            significativos, dos quais 9 representam pontos fortes e 3 indicam oportunidades de
            desenvolvimento. A consistência de registros (100%) reflete um engajamento ativo no processo
            de desenvolvimento contínuo.
          </p>
        </div>

        {/* Pontos Fortes */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Pontos Fortes</h3>
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-900 mb-1">Liderança e Coordenação</p>
              <p className="text-sm text-green-800">
                Demonstrou excelente capacidade de coordenação ao liderar a reunião de planejamento
                trimestral, alinhando expectativas entre diferentes áreas e garantindo entrega de
                resultados.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-900 mb-1">Resolução de Problemas</p>
              <p className="text-sm text-green-800">
                Implementou solução inovadora para otimizar processos internos, resultando em
                eficiência operacional e reconhecimento da equipe.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-900 mb-1">Colaboração em Equipe</p>
              <p className="text-sm text-green-800">
                Colaboração excepcional no projeto X com o time de design, demonstrando abertura para
                diferentes perspectivas e contribuindo para resultado coletivo.
              </p>
            </div>
          </div>
        </div>

        {/* Oportunidades de Desenvolvimento */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Oportunidades de Desenvolvimento</h3>
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-medium text-amber-900 mb-1">Comunicação Técnica</p>
              <p className="text-sm text-amber-800">
                Recomenda-se trabalhar na clareza das apresentações técnicas, especialmente ao
                comunicar conceitos complexos para públicos não-técnicos. Considere participar de
                workshops de comunicação executiva.
              </p>
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Recomendações para Próximo Período</h3>
          <ul className="space-y-2 text-foreground">
            <li className="flex gap-3">
              <span className="font-bold text-accent">1.</span>
              <span>Continuar registrando fatos regularmente para manter consistência</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent">2.</span>
              <span>Focar em desenvolver habilidades de comunicação técnica</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent">3.</span>
              <span>Buscar oportunidades de mentoria em áreas de interesse</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-accent">4.</span>
              <span>Participar de projetos desafiadores para expandir competências</span>
            </li>
          </ul>
        </div>

        {/* Conclusão */}
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">Conclusão</h3>
          <p className="text-sm text-blue-800">
            Você está em uma trajetória positiva de desenvolvimento. A combinação de pontos fortes em
            liderança e colaboração com foco em melhorias contínuas posiciona você bem para crescimento
            profissional. Recomenda-se manter o engajamento no processo e buscar ativamente
            oportunidades de aprendizado.
          </p>
        </div>
      </Card>

      {/* Metadata */}
      <Card className="mt-8 bg-secondary/50 border-0">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-accent">12</p>
            <p className="text-xs text-muted-foreground">Registros</p>
          </div>
          <div>
            <p className="text-lg font-bold text-accent">9</p>
            <p className="text-xs text-muted-foreground">Positivos</p>
          </div>
          <div>
            <p className="text-lg font-bold text-accent">3</p>
            <p className="text-xs text-muted-foreground">Melhorias</p>
          </div>
          <div>
            <p className="text-lg font-bold text-accent">100%</p>
            <p className="text-xs text-muted-foreground">Consistência</p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
