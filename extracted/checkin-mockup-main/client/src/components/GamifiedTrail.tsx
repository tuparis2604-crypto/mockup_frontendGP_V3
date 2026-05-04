import React from "react";

export interface GamifiedTrailPoint {
  week: string;
  score: number;
  isPriority: boolean;
}

interface GamifiedTrailProps {
  points: GamifiedTrailPoint[];
}

export default function GamifiedTrail({ points }: GamifiedTrailProps) {
  if (points.length === 0) return null;

  const maxScore = Math.max(...points.map((p) => p.score), 100);
  const containerHeight = 400;
  const pointSize = 60;
  const spacing = 80;

  return (
    <div className="w-full">
      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${points.length * spacing + 100} ${containerHeight}`}
        className="w-full"
        style={{ minHeight: `${containerHeight}px` }}
      >
        {/* Background grid */}
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#4B5563" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
          </linearGradient>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#E5E7EB" />
          </pattern>
        </defs>

        {/* Caminho ondulado da trilha */}
        <path
          d={`M 50 ${containerHeight - 80} ${points
            .map((p, i) => {
              const x = 50 + i * spacing;
              const y = containerHeight - 80 - (p.score / maxScore) * 200;
              return `${i === 0 ? "L" : "Q"} ${x} ${y} ${x + spacing / 2} ${y}`;
            })
            .join(" ")}`}
          stroke="url(#pathGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />

        {/* Pontos interativos */}
        {points.map((point, index) => {
          const x = 50 + index * spacing;
          const y = containerHeight - 80 - (point.score / maxScore) * 200;
          const isHighScore = point.score > maxScore * 0.7;
          const isPriority = point.isPriority;

          return (
            <g key={`point-${index}`}>
              {/* Aura de prioridade */}
              {isPriority && (
                <circle
                  cx={x}
                  cy={y}
                  r={pointSize / 2 + 10}
                  fill="#F59E0B"
                  opacity="0.15"
                  className="animate-pulse"
                />
              )}

              {/* Ponto principal com gradiente */}
              <defs>
                <radialGradient id={`pointGrad-${index}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor={isPriority ? "#FBBF24" : "#60A5FA"} />
                  <stop offset="100%" stopColor={isPriority ? "#F59E0B" : "#3B82F6"} />
                </radialGradient>
              </defs>

              <circle
                cx={x}
                cy={y}
                r={pointSize / 2}
                fill={`url(#pointGrad-${index})`}
                stroke="white"
                strokeWidth="3"
                className="transition-all hover:r-8 cursor-pointer"
              />

              {/* Estrela para pontos altos */}
              {isHighScore && (
                <g transform={`translate(${x}, ${y - pointSize / 2 - 15})`}>
                  <polygon
                    points="0,-8 2.4,-2.4 8,-0.8 3.2,3.2 4.8,9.6 0,6.4 -4.8,9.6 -3.2,3.2 -8,-0.8 -2.4,-2.4"
                    fill="#FBBF24"
                    className="drop-shadow-lg"
                  />
                </g>
              )}

              {/* Trilha de conexão */}
              {index < points.length - 1 && (
                <line
                  x1={x}
                  y1={y}
                  x2={50 + (index + 1) * spacing}
                  y2={containerHeight - 80 - (points[index + 1].score / maxScore) * 200}
                  stroke={isPriority ? "#F59E0B" : "#D1D5DB"}
                  strokeWidth="2"
                  strokeDasharray="4"
                  opacity="0.5"
                />
              )}

              {/* Label da semana */}
              <text
                x={x}
                y={containerHeight - 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6B7280"
                fontWeight="500"
                className="pointer-events-none"
              >
                {point.week}
              </text>

              {/* Score tooltip */}
              <title>{`${point.week}: ${point.score} pontos${isPriority ? " (Prioridade)" : ""}`}</title>
            </g>
          );
        })}

        {/* Linha base */}
        <line
          x1="30"
          y1={containerHeight - 80}
          x2={points.length * spacing + 50}
          y2={containerHeight - 80}
          stroke="#E5E7EB"
          strokeWidth="2"
          strokeDasharray="4"
        />
      </svg>

      {/* Legenda e informações */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
          <div>
            <p className="text-xs font-medium text-blue-900">Registro Regular</p>
            <p className="text-xs text-blue-700">Desenvolvimento contínuo</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600"></div>
          <div>
            <p className="text-xs font-medium text-amber-900">Competência Prioritária</p>
            <p className="text-xs text-amber-700">Impacto maior</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center w-4 h-4">
            <span className="text-lg">⭐</span>
          </div>
          <div>
            <p className="text-xs font-medium text-green-900">Pico de Desempenho</p>
            <p className="text-xs text-green-700">Semana excepcional</p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-accent">
            {Math.round(points.reduce((sum, p) => sum + p.score, 0) / points.length)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Pontuação Média</p>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-accent">
            {Math.max(...points.map((p) => p.score))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Pontuação Máxima</p>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-accent">
            {points.filter((p) => p.isPriority).length}/{points.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Semanas Prioritárias</p>
        </div>
      </div>
    </div>
  );
}
