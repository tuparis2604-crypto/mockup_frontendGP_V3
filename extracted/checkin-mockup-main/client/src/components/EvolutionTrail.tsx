import { TrendingUp, TrendingDown } from "lucide-react";

export interface EvolutionPoint {
  date: string;
  value: number; // 0-100
  label?: string;
  isPriority?: boolean;
}

interface EvolutionTrailProps {
  points: EvolutionPoint[];
  title?: string;
  compact?: boolean;
}

export default function EvolutionTrail({
  points,
  title = "Trilha de Evolução",
  compact = false,
}: EvolutionTrailProps) {
  if (points.length === 0) return null;

  const minValue = Math.min(...points.map((p) => p.value));
  const maxValue = Math.max(...points.map((p) => p.value));
  const range = maxValue - minValue || 1;

  const normalizeValue = (val: number) => ((val - minValue) / range) * 100;

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <div className="flex items-end gap-1 h-16">
          {points.slice(-12).map((point, idx) => {
            const normalized = normalizeValue(point.value);
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    point.isPriority
                      ? "bg-gradient-to-t from-amber-500 to-amber-400"
                      : "bg-gradient-to-t from-accent/60 to-accent/40"
                  }`}
                  style={{ height: `${Math.max(normalized, 10)}%` }}
                  title={`${point.date}: ${point.value}`}
                />
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {point.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Versão expandida
  const trend =
    points.length > 1
      ? points[points.length - 1].value - points[0].value
      : 0;

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-white border border-border rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Progresso contínuo ao longo do tempo
          </p>
        </div>
        <div className="flex items-center gap-2">
          {trend > 0 ? (
            <TrendingUp size={20} className="text-green-600" />
          ) : trend < 0 ? (
            <TrendingDown size={20} className="text-red-600" />
          ) : null}
          <span
            className={`text-lg font-bold ${
              trend > 0
                ? "text-green-600"
                : trend < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
            }`}
          >
            {trend > 0 ? "+" : ""}{trend}
          </span>
        </div>
      </div>

      {/* Trail visualization */}
      <div className="space-y-4">
        {/* Bar chart */}
        <div className="flex items-end gap-2 h-40">
          {points.map((point, idx) => {
            const normalized = normalizeValue(point.value);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div
                  className={`w-full rounded-t-lg transition-all hover:shadow-lg ${
                    point.isPriority
                      ? "bg-gradient-to-t from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500"
                      : "bg-gradient-to-t from-accent/70 to-accent/50 hover:from-accent hover:to-accent/70"
                  }`}
                  style={{ height: `${Math.max(normalized, 5)}%` }}
                  title={`${point.date}: ${point.value}`}
                />
                <span className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {point.label || point.date}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-t from-accent/70 to-accent/50" />
            <span className="text-muted-foreground">Registros Gerais</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-t from-amber-500 to-amber-400" />
            <span className="text-muted-foreground">Competências Prioritárias</span>
          </div>
        </div>
      </div>
    </div>
  );
}
