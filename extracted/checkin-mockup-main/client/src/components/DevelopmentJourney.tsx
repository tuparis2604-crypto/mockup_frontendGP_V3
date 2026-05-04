import React, { useState, useMemo } from "react";
import { ChevronRight, Zap, BookOpen, Target, CheckCircle2 } from "lucide-react";

export interface JourneyMilestone {
  id: string;
  position: number; // 0-100
  type: "suggestion" | "achievement";
  title: string;
  description: string;
  isPriority: boolean;
  completed: boolean;
}

export interface DevelopmentJourneyProps {
  currentProgress: number; // 0-100
  milestones: JourneyMilestone[];
  userRole?: "Colaborador" | "Gestor";
  onMilestoneClick?: (milestoneId: string) => void;
}

export default function DevelopmentJourney({
  currentProgress,
  milestones,
  userRole = "Colaborador",
  onMilestoneClick,
}: DevelopmentJourneyProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  // Sort milestones by position
  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => a.position - b.position),
    [milestones]
  );

  // Calculate character position with smooth easing
  const characterX = Math.min(currentProgress, 100);

  // Generate smooth curve path for trail
  const generateTrailPath = () => {
    const points = [];
    const amplitude = 30; // Wave amplitude
    const frequency = 0.015; // Wave frequency

    for (let i = 0; i <= 100; i += 2) {
      const y = 150 + Math.sin(i * frequency) * amplitude;
      points.push(`${i * 8},${y}`);
    }

    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="w-full space-y-8">
      {/* Main Trail Visualization */}
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-xl p-8 border border-border shadow-sm overflow-hidden">
        {/* Background gradient accent */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-accent via-transparent to-accent" />

        {/* SVG Trail */}
        <svg viewBox="0 0 800 300" className="w-full mb-12" style={{ minHeight: "280px" }}>
          <defs>
            {/* Gradient for completed trail */}
            <linearGradient id="completedTrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4B5563" stopOpacity="0.2" />
              <stop offset={`${characterX}%`} stopColor="#4B5563" stopOpacity="0.6" />
              <stop offset={`${characterX}%`} stopColor="#E5E7EB" stopOpacity="0.2" />
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

          {/* Trail background (unfilled) */}
          <path
            d={generateTrailPath()}
            stroke="#E5E7EB"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            filter="url(#shadow)"
            opacity="0.5"
          />

          {/* Trail progress (filled) */}
          <path
            d={generateTrailPath()}
            stroke="url(#completedTrail)"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(characterX / 100) * 800} 800`}
            filter="url(#shadow)"
          />

          {/* Milestones */}
          {sortedMilestones.map((milestone) => {
            const x = (milestone.position / 100) * 800;
            const y = 150 + Math.sin(milestone.position * 0.015) * 30;
            const isCompleted = milestone.completed;
            const isPassed = characterX >= milestone.position;

            return (
              <g key={milestone.id}>
                {/* Milestone glow (only for completed or passed) */}
                {(isCompleted || isPassed) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="28"
                    fill={milestone.isPriority ? "#FCD34D" : "#4B5563"}
                    opacity="0.15"
                    filter="url(#glow)"
                  />
                )}

                {/* Milestone circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill={
                    isCompleted
                      ? milestone.isPriority
                        ? "#FBBF24"
                        : "#4B5563"
                      : isPassed
                        ? "#D1D5DB"
                        : "#F3F4F6"
                  }
                  stroke={
                    isCompleted
                      ? milestone.isPriority
                        ? "#F59E0B"
                        : "#1F2937"
                      : "#9CA3AF"
                  }
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Milestone icon/indicator */}
                <foreignObject x={x - 8} y={y - 8} width="16" height="16">
                  <div className="flex items-center justify-center w-full h-full">
                    {isCompleted ? (
                      <span className="text-white font-bold text-xs">✓</span>
                    ) : isPassed ? (
                      <span className="text-gray-600 text-xs">•</span>
                    ) : (
                      <span className="text-gray-400 text-xs">○</span>
                    )}
                  </div>
                </foreignObject>

                {/* Milestone label */}
                <text
                  x={x}
                  y={y - 32}
                  textAnchor="middle"
                  fontSize="12"
                  fill={isCompleted || isPassed ? "#1F2937" : "#9CA3AF"}
                  fontWeight={isCompleted ? "600" : "400"}
                  className="pointer-events-none select-none"
                >
                  {milestone.title}
                </text>
              </g>
            );
          })}

          {/* Character (elegant marker) */}
          <g className="transition-all duration-500">
            {/* Character shadow */}
            <ellipse
              cx={(characterX / 100) * 800}
              cy={150 + Math.sin(characterX * 0.015) * 30 + 24}
              rx="16"
              ry="6"
              fill="#000"
              opacity="0.08"
            />

            {/* Character body (elegant circle with gradient) */}
            <defs>
              <radialGradient id="charGradient" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#4B5563" stopOpacity="0.8" />
              </radialGradient>
            </defs>

            <circle
              cx={(characterX / 100) * 800}
              cy={150 + Math.sin(characterX * 0.015) * 30}
              r="14"
              fill="url(#charGradient)"
              stroke="#FFF"
              strokeWidth="2"
              filter="url(#shadow)"
              className="transition-all duration-500"
            />

            {/* Character highlight */}
            <circle
              cx={(characterX / 100) * 800 - 4}
              cy={150 + Math.sin(characterX * 0.015) * 30 - 4}
              r="4"
              fill="#FFF"
              opacity="0.6"
            />

            {/* Progress indicator */}
            {characterX > 0 && characterX < 100 && (
              <text
                x={(characterX / 100) * 800}
                y={150 + Math.sin(characterX * 0.015) * 30 - 28}
                textAnchor="middle"
                fontSize="11"
                fill="#7C3AED"
                fontWeight="600"
                className="pointer-events-none select-none"
              >
                {Math.round(characterX)}%
              </text>
            )}
          </g>
        </svg>

        {/* Progress stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{Math.round(currentProgress)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Progresso Geral</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {sortedMilestones.filter((m) => m.completed).length}/{sortedMilestones.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Marcos Atingidos</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {sortedMilestones.find((m) => !m.completed && characterX >= m.position)?.position || 100}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Próximo Marco</p>
          </div>
        </div>
      </div>

      {/* Milestones Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Sugestões e Marcos</h3>

        {sortedMilestones.map((milestone) => {
          const isExpanded = expandedMilestone === milestone.id;
          const isPassed = currentProgress >= milestone.position;

          return (
            <div
              key={milestone.id}
              className={`rounded-lg border transition-all cursor-pointer ${
                milestone.completed
                  ? "border-green-200 bg-green-50"
                  : isPassed
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-background hover:border-border/80"
              }`}
              onClick={() => {
                setExpandedMilestone(isExpanded ? null : milestone.id);
                onMilestoneClick?.(milestone.id);
              }}
            >
              <div className="p-4 flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {milestone.completed ? (
                    <CheckCircle2 size={18} className="text-green-600" />
                  ) : milestone.type === "suggestion" ? (
                    <Zap size={18} className={milestone.isPriority ? "text-amber-500" : "text-accent"} />
                  ) : (
                    <Target size={18} className="text-accent" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold text-sm ${milestone.completed ? "text-green-900" : "text-foreground"}`}>
                      {milestone.title}
                    </p>
                    {milestone.isPriority && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                        Prioritária
                      </span>
                    )}
                    {milestone.completed && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Concluído
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${milestone.completed ? "text-green-800" : "text-muted-foreground"}`}>
                    {milestone.description}
                  </p>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-10 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        <strong>Progresso:</strong> {milestone.position}% da jornada
                      </p>
                      {milestone.isPriority && (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                          Esta sugestão está alinhada com suas competências prioritárias e terá maior impacto no seu desenvolvimento.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Expand icon */}
                <ChevronRight
                  size={18}
                  className={`flex-shrink-0 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span>Marcos Gerais</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Competências Prioritárias</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span>Concluído</span>
        </div>
      </div>
    </div>
  );
}
