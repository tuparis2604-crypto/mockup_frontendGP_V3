import React from "react";
import { Trophy, Target, Zap, Star } from "lucide-react";

export interface TrailMilestone {
  id: string;
  position: number; // 0-100 (percentual)
  title: string;
  description: string;
  type: "checkpoint" | "goal" | "achievement";
  completed: boolean;
}

export interface GameTrailProps {
  milestones: TrailMilestone[];
  currentProgress: number; // 0-100
  characterName?: string;
}

export default function GameTrail({ milestones, currentProgress, characterName = "Você" }: GameTrailProps) {
  const sortedMilestones = [...milestones].sort((a, b) => a.position - b.position);

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "checkpoint":
        return <Target size={20} className="text-blue-500" />;
      case "goal":
        return <Zap size={20} className="text-amber-500" />;
      case "achievement":
        return <Trophy size={20} className="text-yellow-500" />;
      default:
        return <Star size={20} className="text-gray-400" />;
    }
  };

  const getMilestoneColor = (type: string, completed: boolean) => {
    if (!completed) return "bg-gray-200";
    switch (type) {
      case "checkpoint":
        return "bg-blue-100 border-blue-300";
      case "goal":
        return "bg-amber-100 border-amber-300";
      case "achievement":
        return "bg-yellow-100 border-yellow-300";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="w-full">
      {/* SVG Trail */}
      <svg viewBox="0 0 1000 300" className="w-full mb-8" style={{ minHeight: "300px" }}>
        <defs>
          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.3" />
            <stop offset={`${currentProgress}%`} stopColor="#4B5563" stopOpacity="0.6" />
            <stop offset={`${currentProgress}%`} stopColor="#D1D5DB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D1D5DB" stopOpacity="0.2" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Caminho sinuoso da trilha */}
        <path
          d="M 50 150 Q 150 100, 250 150 T 450 150 T 650 150 T 850 150"
          stroke="url(#trailGradient)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          filter="url(#shadow)"
        />

        {/* Linha de progresso */}
        <path
          d="M 50 150 Q 150 100, 250 150 T 450 150 T 650 150 T 850 150"
          stroke="#4B5563"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(currentProgress / 100) * 800} 800`}
          opacity="0.8"
        />

        {/* Milestones */}
        {sortedMilestones.map((milestone, index) => {
          const x = 50 + (milestone.position / 100) * 800;
          const y = 150 + (index % 2 === 0 ? -40 : 40);
          const isCompleted = milestone.completed;
          const isCurrent = currentProgress >= milestone.position;

          return (
            <g key={milestone.id}>
              {/* Linha de conexão */}
              <line
                x1={x}
                y1={150}
                x2={x}
                y2={y}
                stroke={isCompleted ? "#4B5563" : "#D1D5DB"}
                strokeWidth="2"
                strokeDasharray="4"
                opacity={isCompleted ? 0.6 : 0.3}
              />

              {/* Milestone circle */}
              <circle
                cx={x}
                cy={y}
                r="24"
                fill={isCompleted ? "#4B5563" : "#E5E7EB"}
                stroke={isCompleted ? "#1F2937" : "#9CA3AF"}
                strokeWidth="2"
                className="transition-all"
              />

              {/* Icon inside circle */}
              <foreignObject x={x - 10} y={y - 10} width="20" height="20">
                <div className="flex items-center justify-center w-full h-full">
                  {isCompleted ? (
                    <span className="text-white font-bold text-sm">✓</span>
                  ) : (
                    <span className="text-gray-400 text-xs">•</span>
                  )}
                </div>
              </foreignObject>

              {/* Label */}
              <text
                x={x}
                y={y + (index % 2 === 0 ? -50 : 70)}
                textAnchor="middle"
                fontSize="12"
                fill={isCompleted ? "#1F2937" : "#9CA3AF"}
                fontWeight={isCompleted ? "bold" : "normal"}
                className="pointer-events-none"
              >
                {milestone.title}
              </text>
            </g>
          );
        })}

        {/* Personagem */}
        <g>
          {/* Sombra do personagem */}
          <ellipse
            cx={50 + (currentProgress / 100) * 800}
            cy={160}
            rx="20"
            ry="8"
            fill="#000"
            opacity="0.1"
          />

          {/* Corpo do personagem (círculo) */}
          <circle
            cx={50 + (currentProgress / 100) * 800}
            cy={130}
            r="16"
            fill="#4B5563"
            stroke="#1F2937"
            strokeWidth="2"
            filter="url(#shadow)"
            className="transition-all duration-500"
          />

          {/* Cabeça */}
          <circle
            cx={50 + (currentProgress / 100) * 800}
            cy={110}
            r="12"
            fill="#4B5563"
            stroke="#1F2937"
            strokeWidth="2"
          />

          {/* Olhos */}
          <circle
            cx={50 + (currentProgress / 100) * 800 - 4}
            cy={108}
            r="2"
            fill="#FFF"
          />
          <circle
            cx={50 + (currentProgress / 100) * 800 + 4}
            cy={108}
            r="2"
            fill="#FFF"
          />

          {/* Boca (sorriso) */}
          <path
            d={`M ${50 + (currentProgress / 100) * 800 - 3} 113 Q ${50 + (currentProgress / 100) * 800} 115 ${50 + (currentProgress / 100) * 800 + 3} 113`}
            stroke="#FFF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Braços */}
          <line
            x1={50 + (currentProgress / 100) * 800 - 12}
            y1={125}
            x2={50 + (currentProgress / 100) * 800 - 20}
            y2={120}
            stroke="#4B5563"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1={50 + (currentProgress / 100) * 800 + 12}
            y1={125}
            x2={50 + (currentProgress / 100) * 800 + 20}
            y2={120}
            stroke="#4B5563"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Pernas */}
          <line
            x1={50 + (currentProgress / 100) * 800 - 6}
            y1={145}
            x2={50 + (currentProgress / 100) * 800 - 8}
            y2={160}
            stroke="#4B5563"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1={50 + (currentProgress / 100) * 800 + 6}
            y1={145}
            x2={50 + (currentProgress / 100) * 800 + 8}
            y2={160}
            stroke="#4B5563"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Milestones Details */}
      <div className="space-y-3">
        {sortedMilestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`p-4 rounded-lg border-l-4 transition-all ${
              milestone.completed
                ? `border-l-${milestone.type === "achievement" ? "yellow" : milestone.type === "goal" ? "amber" : "blue"}-500 bg-${milestone.type === "achievement" ? "yellow" : milestone.type === "goal" ? "amber" : "blue"}-50`
                : "border-l-gray-300 bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getMilestoneIcon(milestone.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-sm ${milestone.completed ? "text-gray-900" : "text-gray-600"}`}>
                    {milestone.title}
                  </p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    milestone.completed
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {milestone.completed ? "Concluído" : `${milestone.position}%`}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${milestone.completed ? "text-gray-700" : "text-gray-600"}`}>
                  {milestone.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-accent">{currentProgress}%</p>
          <p className="text-xs text-muted-foreground mt-1">Progresso Geral</p>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-accent">
            {sortedMilestones.filter((m) => m.completed).length}/{sortedMilestones.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Marcos Atingidos</p>
        </div>

        <div className="p-4 bg-secondary/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-accent">
            {sortedMilestones.find((m) => !m.completed)?.position || 100}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Próximo Marco</p>
        </div>
      </div>
    </div>
  );
}
