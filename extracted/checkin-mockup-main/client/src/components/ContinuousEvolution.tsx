import React, { useMemo } from "react";
import { ChevronRight, Zap, BookOpen, TrendingUp, TrendingDown } from "lucide-react";

export interface EvolutionSuggestion {
  id: string;
  title: string;
  description: string;
  type: "course" | "action" | "book" | "mentoring";
  isPriority: boolean;
  completed: boolean;
  impactBoost?: number; // Percentual de aceleração se completada
}

export interface ContinuousEvolutionProps {
  currentLevel: number; // 0-100+ (sem limite superior)
  trend: "up" | "down" | "stable"; // Tendência recente
  suggestions: EvolutionSuggestion[];
  lastUpdate?: string;
  onSuggestionClick?: (suggestionId: string) => void;
}

export default function ContinuousEvolution({
  currentLevel,
  trend,
  suggestions,
  lastUpdate,
  onSuggestionClick,
}: ContinuousEvolutionProps) {
  // Calculate visual position (clamped for display, but can exceed 100)
  const displayLevel = Math.min(currentLevel, 100);
  const exceedsMax = currentLevel > 100;

  // Get trend color and icon
  const getTrendVisuals = () => {
    switch (trend) {
      case "up":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          icon: TrendingUp,
          label: "Evoluindo",
        };
      case "down":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          icon: TrendingDown,
          label: "Regressão",
        };
      default:
        return {
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          icon: TrendingUp,
          label: "Estável",
        };
    }
  };

  const trendVisuals = getTrendVisuals();
  const TrendIcon = trendVisuals.icon;

  // Completed suggestions
  const completedSuggestions = useMemo(
    () => suggestions.filter((s) => s.completed),
    [suggestions]
  );

  // Calculate potential boost if all suggestions completed
  const potentialBoost = useMemo(
    () =>
      suggestions.reduce((sum, s) => sum + (s.impactBoost || 0), 0),
    [suggestions]
  );

  return (
    <div className="w-full space-y-8">
      {/* Main Evolution Visualization */}
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-xl p-8 border border-border shadow-sm overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-accent via-transparent to-accent" />

        {/* SVG Trail - Infinite upward path */}
        <svg viewBox="0 0 800 500" className="w-full mb-8" style={{ minHeight: "400px" }}>
          <defs>
            {/* Gradient for trail */}
            <linearGradient id="evolutionGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0.3" />
              <stop offset={`${displayLevel}%`} stopColor="#4B5563" stopOpacity="0.6" />
              <stop offset={`${displayLevel}%`} stopColor="#E5E7EB" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0.1" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Shadow filter */}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background grid for infinite feel */}
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#grid)" />

          {/* Wavy trail path - continuous upward */}
          <path
            d="M 400 500 Q 300 450 400 400 T 400 300 T 400 200 T 400 100 T 400 0"
            stroke="#E5E7EB"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            filter="url(#shadow)"
            opacity="0.4"
          />

          {/* Progress trail - filled */}
          <path
            d="M 400 500 Q 300 450 400 400 T 400 300 T 400 200 T 400 100 T 400 0"
            stroke="url(#evolutionGradient)"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(displayLevel / 100) * 500} 500`}
            filter="url(#shadow)"
          />

          {/* Current position marker */}
          <g>
            {/* Glow around character */}
            <circle
              cx="400"
              cy={500 - (displayLevel / 100) * 500}
              r="28"
              fill="#7C3AED"
              opacity="0.15"
              filter="url(#glow)"
            />

            {/* Character circle */}
            <circle
              cx="400"
              cy={500 - (displayLevel / 100) * 500}
              r="16"
              fill="#7C3AED"
              stroke="#FFF"
              strokeWidth="2.5"
              filter="url(#shadow)"
              className="transition-all duration-700"
            />

            {/* Character highlight */}
            <circle
              cx="396"
              cy={500 - (displayLevel / 100) * 500 - 4}
              r="5"
              fill="#FFF"
              opacity="0.7"
            />

            {/* Level indicator above character */}
            <text
              x="400"
              y={500 - (displayLevel / 100) * 500 - 32}
              textAnchor="middle"
              fontSize="14"
              fill="#7C3AED"
              fontWeight="700"
              className="pointer-events-none select-none"
            >
              {Math.round(currentLevel)}
            </text>

            {/* "+" if exceeds 100 */}
            {exceedsMax && (
              <text
                x="420"
                y={500 - (displayLevel / 100) * 500 - 32}
                fontSize="12"
                fill="#7C3AED"
                fontWeight="700"
                className="pointer-events-none select-none"
              >
                +
              </text>
            )}
          </g>

          {/* Milestone markers at intervals */}
          {[0, 25, 50, 75, 100].map((level) => (
            <g key={level}>
              <circle
                cx="400"
                cy={500 - (level / 100) * 500}
                r="4"
                fill="#D1D5DB"
                opacity="0.5"
              />
              <text
                x="370"
                y={500 - (level / 100) * 500 + 4}
                fontSize="11"
                fill="#9CA3AF"
                className="pointer-events-none select-none"
              >
                {level}
              </text>
            </g>
          ))}

          {/* Infinity symbol at top */}
          <text
            x="400"
            y="30"
            textAnchor="middle"
            fontSize="20"
            fill="#D1D5DB"
            opacity="0.4"
            className="pointer-events-none select-none"
          >
            ∞
          </text>
        </svg>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
          {/* Current Level */}
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">{Math.round(currentLevel)}</p>
            <p className="text-xs text-muted-foreground mt-1">Nível Atual</p>
          </div>

          {/* Trend */}
          <div className={`text-center p-3 rounded-lg ${trendVisuals.bgColor}`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendIcon size={18} className={trendVisuals.color} />
              <p className={`font-bold text-sm ${trendVisuals.color}`}>{trendVisuals.label}</p>
            </div>
            <p className="text-xs text-muted-foreground">Tendência Recente</p>
          </div>

          {/* Potential */}
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">+{potentialBoost}%</p>
            <p className="text-xs text-muted-foreground mt-1">Potencial com Sugestões</p>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Caminhos Opcionais</h3>
          <span className="text-xs text-muted-foreground">
            {completedSuggestions.length}/{suggestions.length} completadas
          </span>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion) => {
            const Icon =
              suggestion.type === "course"
                ? BookOpen
                : suggestion.type === "mentoring"
                  ? Zap
                  : suggestion.type === "book"
                    ? BookOpen
                    : Zap;

            return (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  suggestion.completed
                    ? "border-green-200 bg-green-50"
                    : "border-border bg-background hover:border-accent/50 hover:bg-accent/5"
                }`}
                onClick={() => onSuggestionClick?.(suggestion.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <Icon
                      size={18}
                      className={
                        suggestion.completed
                          ? "text-green-600"
                          : suggestion.isPriority
                            ? "text-amber-500"
                            : "text-accent"
                      }
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm ${suggestion.completed ? "text-green-900" : "text-foreground"}`}>
                        {suggestion.title}
                      </p>
                      {suggestion.isPriority && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          Prioritária
                        </span>
                      )}
                      {suggestion.completed && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          ✓ Concluído
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${suggestion.completed ? "text-green-800" : "text-muted-foreground"}`}>
                      {suggestion.description}
                    </p>
                    {suggestion.impactBoost && !suggestion.completed && (
                      <p className="text-xs mt-2 text-accent font-medium">
                        Acelera evolução em +{suggestion.impactBoost}% ao completar
                      </p>
                    )}
                  </div>

                  {/* Boost indicator */}
                  {suggestion.impactBoost && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs font-bold text-accent">+{suggestion.impactBoost}%</p>
                      <p className="text-xs text-muted-foreground">boost</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
        <p>
          <strong>Como funciona:</strong> Sua evolução é contínua. Registros bons fazem você subir, registros em competências prioritárias aceleram ainda mais. Sugestões são caminhos opcionais que potencializam seu crescimento. Sem registros, você volta um pouco, mas sempre pode evoluir novamente.
        </p>
      </div>

      {lastUpdate && (
        <p className="text-xs text-muted-foreground text-center">
          Última atualização: {lastUpdate}
        </p>
      )}
    </div>
  );
}
