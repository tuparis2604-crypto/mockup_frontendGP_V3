import { useMemo, useRef, useState } from "react";
import { AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";

interface JornadaProps {
  currentPoints: number;
  maxPoints: number;
  validCheckins: number;
  alerts: string[];
  trend: "positive" | "neutral" | "negative";
}

export default function JornadaDeEvolucao({
  currentPoints,
  maxPoints,
  validCheckins,
  alerts,
  trend,
}: JornadaProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const rawProgress = maxPoints > 0 ? currentPoints / maxPoints : 0;
  const progress = Math.max(0, Math.min(1, rawProgress));
  const percentage = progress * 100;

  const journeyHeight = 1800;
  const pathD = `
    M 180 1710
    C 130 1560, 235 1465, 195 1325
    C 165 1210, 110 1110, 150 980
    C 188 855, 248 755, 210 615
    C 178 495, 132 400, 165 260
    C 192 150, 172 85, 186 36
  `;

  const pathId = "jornada-path";
  const fillId = "jornada-fill";
  const glowId = "jornada-glow";
  const cloudId = "jornada-cloud";

  const milestones = useMemo(
    () => [0.12, 0.24, 0.38, 0.52, 0.68, 0.82, 0.94],
    []
  );

  const birds = [
    { left: "12%", bottom: "12%", size: 20, opacity: 0.75 },
    { left: "22%", bottom: "16%", size: 18, opacity: 0.70 },
    { left: "76%", bottom: "18%", size: 19, opacity: 0.72 },
    { left: "70%", bottom: "12%", size: 17, opacity: 0.68 },
    { left: "35%", bottom: "14%", size: 16, opacity: 0.65 },
    { left: "55%", bottom: "20%", size: 18, opacity: 0.70 },
  ];

  const clouds = [
    { left: "8%", bottom: "18%", scale: 1.4 },
    { left: "56%", bottom: "24%", scale: 1.3 },
    { left: "18%", bottom: "32%", scale: 1.1 },
    { left: "64%", bottom: "40%", scale: 0.95 },
    { left: "2%", bottom: "28%", scale: 1.2 },
    { left: "72%", bottom: "35%", scale: 1.0 },
    { left: "35%", bottom: "45%", scale: 0.85 },
    { left: "50%", bottom: "50%", scale: 0.90 },
  ];

  const stars = [
    { left: "14%", top: "7%", size: 2.2, opacity: 0.85 },
    { left: "28%", top: "14%", size: 1.5, opacity: 0.65 },
    { left: "73%", top: "11%", size: 1.8, opacity: 0.78 },
    { left: "82%", top: "20%", size: 2, opacity: 0.72 },
    { left: "18%", top: "24%", size: 1.3, opacity: 0.5 },
    { left: "61%", top: "28%", size: 1.2, opacity: 0.46 },
    { left: "40%", top: "5%", size: 1.2, opacity: 0.58 },
    { left: "52%", top: "17%", size: 1.4, opacity: 0.62 },
    { left: "90%", top: "8%", size: 1.4, opacity: 0.48 },
    { left: "8%", top: "18%", size: 1.1, opacity: 0.44 },
  ];

  const trendColor =
    trend === "positive"
      ? "text-green-700"
      : trend === "negative"
      ? "text-red-700"
      : "text-slate-600";

  const nextMilestone = Math.min(maxPoints, Math.ceil((currentPoints + 1) / 25) * 25);

  return (
    <div className="w-full space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-black shadow-2xl">
        <div
          ref={containerRef}
          className="relative h-[760px] overflow-y-auto overflow-x-hidden"
        >
          <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/55 via-black/25 to-transparent backdrop-blur-[2px] text-white pointer-events-none">
            <div>
              <div className="text-lg font-semibold tracking-tight">Jornada</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">Terra → Espaço</div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold">
              {percentage.toFixed(0)}%
            </div>
          </div>

          <div
            className="relative w-full"
            style={{
              height: `${journeyHeight}px`,
              background:
                "linear-gradient(to top, #2D1115 0%, #5C1A2C 8%, #7A2E52 16%, #7E25B8 24%, #5281E7 36%, #315EAF 50%, #162E60 62%, #081221 76%, #03050C 88%, #010208 100%)",
            }}
          >
            <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-black via-black/80 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-t from-black/20 to-transparent" />

            <svg className="absolute inset-x-0 bottom-0 h-[14%]" viewBox="0 0 360 100" preserveAspectRatio="none">
              <path d="M 0 100 Q 30 60 60 35 Q 90 60 140 100 Z" fill="#0a0a0a" />
              <path d="M 110 100 Q 140 50 190 15 Q 240 50 270 100 Z" fill="#050505" />
              <path d="M 240 100 Q 270 65 310 40 Q 335 65 360 100 Z" fill="#0a0a0a" />
              <polygon points="80,100 150,25 220,100" fill="#141414" opacity="0.85" />
              <rect x="0" y="95" width="360" height="5" fill="#000000" opacity="0.9" />
            </svg>

            {birds.map((bird, index) => (
              <svg
                key={index}
                className="absolute"
                style={{
                  left: bird.left,
                  bottom: bird.bottom,
                  opacity: bird.opacity,
                  width: `${bird.size * 2}px`,
                  height: `${bird.size}px`,
                }}
                viewBox="0 0 40 20"
                fill="none"
              >
                {/* Asa esquerda */}
                <path d="M 8 8 L 14 11" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                {/* Asa direita */}
                <path d="M 20 8 L 14 11" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                {/* Corpo */}
                <circle cx="14" cy="11.5" r="1.3" fill="white" />
              </svg>
            ))}

            {clouds.map((cloud, index) => (
              <svg
                key={index}
                className="absolute"
                style={{
                  left: cloud.left,
                  bottom: cloud.bottom,
                  transform: `scale(${cloud.scale})`,
                  opacity: 0.45 + (0.25 * (1 - index / clouds.length)),
                  width: "100px",
                  height: "50px",
                }}
                viewBox="0 0 100 50"
                fill="none"
              >
                <path
                  d="M 15 35 Q 8 35 8 28 Q 8 18 16 18 Q 20 8 32 8 Q 48 8 52 18 Q 62 18 62 28 Q 62 35 55 35 Z"
                  stroke="white"
                  strokeWidth="1.2"
                  fill="rgba(255,255,255,0.08)"
                />
              </svg>
            ))}

            {stars.map((star, index) => (
              <div
                key={index}
                className="absolute rounded-full bg-white"
                style={{
                  left: star.left,
                  top: star.top,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  boxShadow: `0 0 8px rgba(255,255,255,${star.opacity * 0.7})`,
                }}
              />
            ))}

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 360 1800"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="1800" x2="0" y2="0">
                  <stop offset="0%" stopColor="#FF3B47" />
                  <stop offset="18%" stopColor="#FF6B9D" />
                  <stop offset="42%" stopColor="#B84FFF" />
                  <stop offset="72%" stopColor="#6BA3FF" />
                  <stop offset="100%" stopColor="#4A7FFF" />
                </linearGradient>
                <filter id={glowId}>
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id={cloudId}>
                  <feGaussianBlur stdDeviation="4" />
                </filter>
              </defs>

              <path
                id={pathId}
                d={pathD}
                fill="none"
                stroke="rgba(7,10,18,0.2)"
                strokeWidth="26"
                strokeLinecap="round"
                filter={`url(#${glowId})`}
              />

              <path
                d={pathD}
                fill="none"
                stroke={`url(#${fillId})`}
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="1"
                pathLength="1"
                strokeDashoffset={1 - progress}
                filter={`url(#${glowId})`}
              />

              <path
                d={pathD}
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1"
                pathLength="1"
                strokeDashoffset={1 - progress}
                opacity="0.35"
              />

              {milestones.map((stop, index) => (
                <g key={index}>
                  <circle r="4" fill="rgba(255,255,255,0.18)">
                    <animateMotion dur="0.01s" fill="freeze" path={pathD} keyPoints={stop} keyTimes="0;1" calcMode="linear" />
                  </circle>
                </g>
              ))}

              <g>
                <circle r="24" fill="rgba(255,220,70,0.2)">
                  <animateMotion dur="0.01s" fill="freeze" path={pathD} keyPoints={progress} keyTimes="0;1" calcMode="linear" />
                </circle>
                <circle r="18" fill="rgba(255,220,70,0.14)">
                  <animateMotion dur="0.01s" fill="freeze" path={pathD} keyPoints={progress} keyTimes="0;1" calcMode="linear" />
                </circle>
                <circle r="11" fill="#F7D21F" stroke="white" strokeWidth="2">
                  <animateMotion dur="0.01s" fill="freeze" path={pathD} keyPoints={progress} keyTimes="0;1" calcMode="linear" />
                </circle>
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight="700"
                  fill="#141414"
                >
                  ✦
                  <animateMotion dur="0.01s" fill="freeze" path={pathD} keyPoints={progress} keyTimes="0;1" calcMode="linear" />
                </text>
                <line x1="0" y1="-22" x2="0" y2="22" stroke="rgba(255,220,70,0.6)" strokeWidth="2">
                  <animateMotion dur="0.01s" fill="freeze" path={pathD} keyPoints={progress} keyTimes="0;1" calcMode="linear" />
                </line>
              </g>
              
              {/* Marcador no final do preenchimento */}
              <g>
                <circle r="8" fill="rgba(100,200,255,0.3)">
                  <animateMotion dur="0.01s" fill="freeze" path={pathD} keyPoints={progress} keyTimes="0;1" calcMode="linear" />
                </circle>
                <circle r="5" fill="none" stroke="#64C8FF" strokeWidth="1.5">
                  <animateMotion dur="0.01s" fill="freeze" path={pathD} keyPoints={progress} keyTimes="0;1" calcMode="linear" />
                </circle>
              </g>
            </svg>


          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-3 shadow-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Nível</div>
          <div className="text-2xl font-bold text-purple-700">{currentPoints}</div>
          <div className="mt-1 text-xs text-slate-500">{percentage.toFixed(0)}%</div>
        </div>

        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-3 shadow-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Check-ins</div>
          <div className="text-2xl font-bold text-green-700">{validCheckins}</div>
          <div className="mt-1 text-xs text-slate-500">Positivos</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-3 shadow-sm">
          <div className="mb-1 text-xs font-semibold text-slate-500">Próximo</div>
          <div className="text-2xl font-bold text-blue-700">{nextMilestone}</div>
          <div className="mt-1 text-xs text-slate-500">Pontos</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowTooltip((v) => !v)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Sinal de Atenção</div>
            {alerts.length > 0 && (
              <div className="mt-1 text-xs text-slate-600">{alerts[0]}</div>
            )}
          </div>
          {showTooltip ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          )}
        </div>
      </button>

      {showTooltip && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${trendColor}`} />
            <span className={`text-sm font-semibold ${trendColor}`}>
              Tendência: {trend === "positive" ? "Positiva ↑" : trend === "negative" ? "Negativa ↓" : "Neutra →"}
            </span>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            {alerts.map((alert, i) => (
              <div key={i}>• {alert}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
