import { useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, TrendingUp, BookOpen, Users, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";

interface Alert {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  description: string;
  timestamp: string;
}

interface Recommendation {
  id: string;
  category: "course" | "action" | "book";
  title: string;
  description: string;
  competency: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Baixo Registro em Comunicação",
    description: "Você não registrou nada sobre Comunicação nas últimas 2 semanas. Esta é uma competência prioritária.",
    timestamp: "Hoje",
  },
  {
    id: "2",
    type: "success",
    title: "Marco Atingido: Liderança +10 pontos",
    description: "Parabéns! Você evoluiu significativamente em Liderança este mês.",
    timestamp: "Ontem",
  },
  {
    id: "3",
    type: "info",
    title: "Sugestão: Aprofundar em Resolução de Problemas",
    description: "Com base em seus registros, você tem potencial para crescer ainda mais nesta área.",
    timestamp: "2 dias atrás",
  },
];

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    category: "course",
    title: "Liderança Estratégica para Gestores",
    description: "Desenvolva habilidades avançadas de liderança e visão estratégica",
    competency: "Liderança",
  },
  {
    id: "2",
    category: "action",
    title: "Facilitar Reunião de Retrospectiva",
    description: "Pratique comunicação efetiva em grupo",
    competency: "Comunicação",
  },
  {
    id: "3",
    category: "book",
    title: "Crucial Conversations",
    description: "Melhorar comunicação em situações difíceis",
    competency: "Comunicação",
  },
  {
    id: "4",
    category: "action",
    title: "Mentoria com Sênior",
    description: "Sessões mensais para aprofundar conhecimentos",
    competency: "Liderança",
  },
];

export default function Alerts() {
  const [, setLocation] = useLocation();
  const [userName] = useState("João Silva");
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const handleLogout = () => {
    setLocation("/login");
  };

  const handleDismiss = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const visibleAlerts = mockAlerts.filter((alert) => !dismissedAlerts.includes(alert.id));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "course":
        return "🎓";
      case "action":
        return "⚡";
      case "book":
        return "📚";
      default:
        return "•";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "course":
        return "Curso";
      case "action":
        return "Ação Prática";
      case "book":
        return "Leitura";
      default:
        return "Recomendação";
    }
  };

  return (
    <DashboardLayout
      userName={userName}
      userRole="Gestor"
      onLogout={handleLogout}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Avisos e Recomendações</h1>
        <p className="text-muted-foreground">
          Acompanhe alertas sobre seu desenvolvimento e receba sugestões personalizadas.
        </p>
      </div>

      {/* Alerts Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">Alertas Recentes</h2>
        {visibleAlerts.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-muted-foreground">Nenhum alerta no momento. Você está em dia!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.type === "warning"
                    ? "border-l-amber-500 bg-amber-50"
                    : alert.type === "success"
                      ? "border-l-green-500 bg-green-50"
                      : "border-l-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`mt-1 ${
                        alert.type === "warning"
                          ? "text-amber-600"
                          : alert.type === "success"
                            ? "text-green-600"
                            : "text-blue-600"
                      }`}
                    >
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-bold ${
                          alert.type === "warning"
                            ? "text-amber-900"
                            : alert.type === "success"
                              ? "text-green-900"
                              : "text-blue-900"
                        }`}
                      >
                        {alert.title}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${
                          alert.type === "warning"
                            ? "text-amber-800"
                            : alert.type === "success"
                              ? "text-green-800"
                              : "text-blue-800"
                        }`}
                      >
                        {alert.description}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          alert.type === "warning"
                            ? "text-amber-700"
                            : alert.type === "success"
                              ? "text-green-700"
                              : "text-blue-700"
                        }`}
                      >
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-4"
                  >
                    <X size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Sugestões de Desenvolvimento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {mockRecommendations.map((rec) => {
            const categoryColor =
              rec.category === "course"
                ? "bg-blue-50 border-blue-200"
                : rec.category === "action"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-purple-50 border-purple-200";

            const categoryTextColor =
              rec.category === "course"
                ? "text-blue-900"
                : rec.category === "action"
                  ? "text-amber-900"
                  : "text-purple-900";

            return (
              <Card key={rec.id} className={`${categoryColor} border`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${categoryTextColor}`}>
                    {getCategoryLabel(rec.category)}
                  </span>
                </div>
                <h3 className={`font-bold ${categoryTextColor} mb-2`}>{rec.title}</h3>
                <p className={`text-sm ${categoryTextColor} mb-3`}>{rec.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryTextColor} bg-white`}>
                    {rec.competency}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
