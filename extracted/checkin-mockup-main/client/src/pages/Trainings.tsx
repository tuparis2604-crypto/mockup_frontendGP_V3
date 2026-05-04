import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  GraduationCap,
  Construction,
  Youtube,
  FileText,
  Link,
  Monitor,
  Users,
  BookOpen,
  Presentation,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Card from "@/components/Card";
import PageIntro from "@/components/PageIntro";
import VersionBadge from "@/components/VersionBadge";
import { Button } from "@/components/ui/button";
import { getMe, logout, getHighestRole, getTrainings } from "@/lib/api";
import type { User, Training } from "@/lib/api";

const FORMAT_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  presencial: {
    label: "Presencial",
    icon: <Users size={14} />,
    color: "bg-blue-50 text-blue-700",
  },
  youtube: {
    label: "YouTube",
    icon: <Youtube size={14} />,
    color: "bg-red-50 text-red-700",
  },
  lg: {
    label: "LG",
    icon: <Monitor size={14} />,
    color: "bg-purple-50 text-purple-700",
  },
  video: {
    label: "Vídeo",
    icon: <Monitor size={14} />,
    color: "bg-indigo-50 text-indigo-700",
  },
  link: {
    label: "Link externo",
    icon: <Link size={14} />,
    color: "bg-sky-50 text-sky-700",
  },
  pdf: {
    label: "PDF",
    icon: <FileText size={14} />,
    color: "bg-amber-50 text-amber-700",
  },
  slides: {
    label: "Slides / PPT",
    icon: <Presentation size={14} />,
    color: "bg-emerald-50 text-emerald-700",
  },
};

const futureFeaturesV3 = [
  {
    title: "Trilhas de Aprendizagem",
    description:
      "Sequências de treinamentos organizados por macrocompetência ou perfil de desenvolvimento.",
    icon: BookOpen,
  },
  {
    title: "Evidências de Participação",
    description:
      "Registrar participação em treinamento como evidência de check-in ou avanço da jornada.",
    icon: GraduationCap,
  },
  {
    title: "Integração com LG",
    description: "Importar treinamentos diretamente do sistema LG, com status de conclusão.",
    icon: Monitor,
  },
  {
    title: "Quiz e Avaliação",
    description: "Quizzes e autoavaliações ao final de treinamentos como validação opcional.",
    icon: FileText,
  },
];

export default function Trainings() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getMe();
        if (!currentUser) { setLocation("/login"); return; }
        setUser(currentUser);
        const t = await getTrainings();
        setTrainings(t);
      } catch {
        setLocation("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setLocation]);

  const handleLogout = async () => { await logout(); setLocation("/login"); };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const highestRole = getHighestRole(user.roles);

  return (
    <DashboardLayout userName={user.name} userRole={highestRole} onLogout={handleLogout}>
      <div className="mb-2 flex items-center gap-3">
        <GraduationCap size={22} className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Treinamentos e Trilhas</h1>
        <VersionBadge version="V3" />
      </div>

      <PageIntro text="Área destinada à organização de conteúdos, treinamentos internos, cursos externos, trilhas e evidências de aprendizagem. Módulo em expansão — algumas funcionalidades chegam na V3." />

      {/* Status banner */}
      <div className="mb-6 p-5 rounded-xl border border-dashed border-amber-300 bg-amber-50 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Construction size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="font-semibold text-amber-900">Módulo em Expansão — V3</p>
          <p className="text-sm text-amber-800 mt-0.5">
            O catálogo inicial de treinamentos já está disponível abaixo. Trilhas completas,
            integração com LG e evidências de participação chegarão na V3.
          </p>
        </div>
      </div>

      {/* Catálogo atual */}
      {trainings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-foreground mb-4">Catálogo Atual</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trainings.map((t) => {
              const formatCfg = FORMAT_CONFIG[t.format] || FORMAT_CONFIG.link;
              return (
                <Card key={t.id} className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={18} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm leading-tight">{t.title}</p>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${formatCfg.color}`}>
                      {formatCfg.icon} {formatCfg.label}
                    </span>
                    {t.duration_minutes && (
                      <span className="text-xs text-muted-foreground">
                        {t.duration_minutes >= 60
                          ? `${Math.round(t.duration_minutes / 60)}h`
                          : `${t.duration_minutes}min`}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Futuras funcionalidades V3 */}
      <section>
        <h2 className="text-base font-bold text-foreground mb-2">Em desenvolvimento — V3</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Funcionalidades planejadas para a próxima versão de expansão modular.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {futureFeaturesV3.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="opacity-70 relative overflow-hidden border-dashed">
                <div className="absolute top-3 right-3">
                  <VersionBadge version="V3" />
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-amber-600" />
                  </div>
                  <div className="pr-10">
                    <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <strong>Modo MOCK:</strong> Catálogo simulado. Em V3, treinamentos serão gerenciados e vinculados à jornada de cada colaborador.
      </div>
    </DashboardLayout>
  );
}
