import React from "react";

export interface TrailPoint {
  date: string;
  value: number;
  isPriority: boolean;
  label?: string;
}

interface SinuousTrailProps {
  points: TrailPoint[];
  height?: number;
}

export default function SinuousTrail({ points, height = 400 }: SinuousTrailProps) {
  if (points.length === 0) return null;

  const padding = 60;
  const width = Math.max(800, points.length * 80);
  const viewBoxHeight = height;
  const viewBoxWidth = width;

  // Calcular escala
  const maxValue = Math.max(...points.map((p) => p.value), 100);
  const minValue = Math.min(...points.map((p) => p.value), 0);
  const valueRange = maxValue - minValue || 1;

  // Gerar pontos da trilha sinuosa
  const xStep = (viewBoxWidth - padding * 2) / (points.length - 1 || 1);
  const yScale = (viewBoxHeight - padding * 2) / valueRange;

  const pathPoints = points.map((point, index) => {
    const x = padding + index * xStep;
    const y = viewBoxHeight - padding - (point.value - minValue) * yScale;
    return { x, y, point, index };
  });

  // Criar SVG path com curva suave (Catmull-Rom spline)
  let pathData = "";
  for (let i = 0; i < pathPoints.length; i++) {
    const current = pathPoints[i];

    if (i === 0) {
      pathData += `M ${current.x} ${current.y}`;
    } else {
      const prev = pathPoints[i - 1];
      const next = pathPoints[i + 1];
      const nextNext = pathPoints[i + 2];

      // Controle de curvatura
      const cp1x = prev.x + (current.x - (i > 1 ? pathPoints[i - 2].x : prev.x)) / 6;
      const cp1y = prev.y + (current.y - (i > 1 ? pathPoints[i - 2].y : prev.y)) / 6;
      const cp2x = current.x - (next ? (next.x - prev.x) / 6 : 0);
      const cp2y = current.y - (next ? (next.y - prev.y) / 6 : 0);

      pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full min-w-max"
        style={{ height: `${height}px` }}
      >
        {/* Grid horizontal sutil */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = viewBoxHeight - padding - (viewBoxHeight - padding * 2) * ratio;
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={viewBoxWidth - padding}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="0.5"
              strokeDasharray="4"
            />
          );
        })}

        {/* Trilha principal */}
        <path
          d={pathData}
          stroke="#4B5563"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Preenchimento gradual sob a trilha */}
        <defs>
          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4B5563" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4B5563" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={pathData + ` L ${viewBoxWidth - padding} ${viewBoxHeight - padding} L ${padding} ${viewBoxHeight - padding} Z`}
          fill="url(#trailGradient)"
        />

        {/* Pontos e marcadores */}
        {pathPoints.map(({ x, y, point, index }) => (
          <g key={`point-${index}`}>
            {/* Ponto de prioridade (maior e destacado) */}
            {point.isPriority && (
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="#F59E0B"
                opacity="0.3"
                className="transition-all"
              />
            )}

            {/* Ponto principal */}
            <circle
              cx={x}
              cy={y}
              r={point.isPriority ? "6" : "4"}
              fill={point.isPriority ? "#F59E0B" : "#4B5563"}
              stroke="white"
              strokeWidth="2"
              className="transition-all hover:r-6"
            />

            {/* Label de data */}
            <text
              x={x}
              y={viewBoxHeight - padding + 25}
              textAnchor="middle"
              fontSize="12"
              fill="#6B7280"
              className="pointer-events-none"
            >
              {point.date}
            </text>

            {/* Tooltip ao hover */}
            <title>{`${point.date}: ${point.value} pontos${point.isPriority ? " (Prioridade)" : ""}`}</title>
          </g>
        ))}

        {/* Eixo X */}
        <line
          x1={padding}
          y1={viewBoxHeight - padding}
          x2={viewBoxWidth - padding}
          y2={viewBoxHeight - padding}
          stroke="#D1D5DB"
          strokeWidth="1"
        />

        {/* Eixo Y */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={viewBoxHeight - padding}
          stroke="#D1D5DB"
          strokeWidth="1"
        />

        {/* Labels do eixo Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = minValue + valueRange * ratio;
          const y = viewBoxHeight - padding - (viewBoxHeight - padding * 2) * ratio;
          return (
            <text
              key={`y-label-${i}`}
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#9CA3AF"
              className="pointer-events-none"
            >
              {Math.round(value)}
            </text>
          );
        })}
      </svg>

      {/* Legenda */}
      <div className="flex items-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span className="text-muted-foreground">Competência Prioritária</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-600"></div>
          <span className="text-muted-foreground">Registro Regular</span>
        </div>
      </div>
    </div>
  );
}
