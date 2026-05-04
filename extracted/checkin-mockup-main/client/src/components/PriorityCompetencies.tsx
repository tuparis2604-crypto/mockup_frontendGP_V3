import { Star } from "lucide-react";

export interface PriorityCompetency {
  name: string;
  priority: number; // 1-3, onde 1 é mais prioritário
  evolution: number; // -10 a +10, progresso
  lastUpdate: string;
}

interface PriorityCompetenciesProps {
  competencies: PriorityCompetency[];
  compact?: boolean;
}

export default function PriorityCompetencies({
  competencies,
  compact = false,
}: PriorityCompetenciesProps) {
  if (competencies.length === 0) return null;

  const sorted = [...competencies].sort((a, b) => a.priority - b.priority);

  if (compact) {
    return (
      <div className="space-y-2">
        {sorted.map((comp) => (
          <div key={comp.name} className="flex items-center gap-2">
            <Star size={14} className="text-amber-500 flex-shrink-0" />
            <span className="text-sm font-medium text-foreground flex-1">{comp.name}</span>
            <span
              className={`text-xs font-semibold ${
                comp.evolution > 0
                  ? "text-green-600"
                  : comp.evolution < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {comp.evolution > 0 ? "+" : ""}{comp.evolution}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((comp) => (
        <div
          key={comp.name}
          className="p-4 bg-gradient-to-r from-amber-50 to-transparent border border-amber-200 rounded-lg"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              <h4 className="font-semibold text-foreground">{comp.name}</h4>
            </div>
            <span className="text-xs text-muted-foreground">Prioridade {comp.priority}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    comp.evolution > 0
                      ? "bg-green-500"
                      : comp.evolution < 0
                        ? "bg-red-500"
                        : "bg-amber-500"
                  }`}
                  style={{ width: `${50 + comp.evolution * 5}%` }}
                />
              </div>
            </div>
            <span
              className={`ml-3 text-sm font-bold ${
                comp.evolution > 0
                  ? "text-green-600"
                  : comp.evolution < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
              }`}
            >
              {comp.evolution > 0 ? "+" : ""}{comp.evolution}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-2">Atualizado: {comp.lastUpdate}</p>
        </div>
      ))}
    </div>
  );
}
