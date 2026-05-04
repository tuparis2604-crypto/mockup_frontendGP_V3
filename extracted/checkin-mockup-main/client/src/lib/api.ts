/**
 * API Service Layer
 * Modo MOCK com localStorage para desenvolvimento
 * Pronto para integrar com n8n/Supabase (basta trocar API_BASE_URL)
 *
 * TODO (backend real): substituir mocks por chamadas Supabase/n8n.
 * Segurança real (RLS, permissões por perfil) deve ser implementada no Supabase,
 * não apenas no frontend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""; // Vazio = modo MOCK

// ============================================================================
// HIERARQUIA DE PAPÉIS
// ============================================================================

const ROLE_HIERARCHY: Record<string, number> = {
  Admin: 6,
  Sócio: 5,
  GP: 5,
  RH: 4,
  DP: 4,
  Gestor: 3,
  GestorAuxiliar: 2,
  Colaborador: 1,
};

export function getHighestRole(roles: string[]): string {
  return roles.reduce((highest, current) => {
    const currentRank = ROLE_HIERARCHY[current] || 0;
    const highestRank = ROLE_HIERARCHY[highest] || 0;
    return currentRank > highestRank ? current : highest;
  }, "Colaborador");
}

export function getRoleDisplayName(role: string): string {
  const names: Record<string, string> = {
    Sócio: "GP",
    GP: "GP",
    RH: "DP",
    DP: "DP",
    Gestor: "Gestor",
    GestorAuxiliar: "Gestor Auxiliar",
    Colaborador: "Gerido",
    Admin: "Admin",
  };
  return names[role] || role;
}

export function isGP(roles: string[]): boolean {
  return roles.some((r) => r === "GP" || r === "Sócio");
}
export function isDP(roles: string[]): boolean {
  return roles.some((r) => r === "DP" || r === "RH");
}
export function isGestor(roles: string[]): boolean {
  return roles.some((r) => r === "Gestor");
}
export function isGestorAuxiliar(roles: string[]): boolean {
  return roles.some((r) => r === "GestorAuxiliar");
}
export function isGerido(roles: string[]): boolean {
  return roles.some((r) => r === "Colaborador");
}
export function canEvaluateFormally(roles: string[]): boolean {
  // Gestor Auxiliar NÃO avalia formalmente
  return roles.some((r) => r === "Gestor" || r === "GP" || r === "Sócio" || r === "RH");
}

// ============================================================================
// TIPOS E INTERFACES — USUÁRIO
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  roles: ("Colaborador" | "Gestor" | "GestorAuxiliar" | "RH" | "DP" | "GP" | "Sócio" | "Admin")[];
  faixa: "Ciclo I" | "Ciclo II" | "Ciclo III";
  manager_id?: string;
  aux_manager_id?: string;
  gp_id?: string;
  primary_macros: string[];
  deep_followup?: boolean; // interno GP — não exibir para o gerido
  area?: string;
  created_at: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
  uploaded_at?: string;
}

// Flag do registro
export type RecordFlag = "green" | "yellow" | "red";
// Status do registro
export type RecordStatus = "draft" | "grouped" | "published";

export interface MeetingRequest {
  id: string;
  record_id: string;
  agenda: string;
  requested_at: string;
  status: "pending" | "acknowledged";
}

export interface Checkin {
  id: string;
  created_at: string;
  subject_user_id: string;
  author_user_id: string;
  period_id?: string;
  cycle_id?: string;
  flag: RecordFlag;
  macro: string;
  text: string;
  visibility: "private" | "visible";
  status: RecordStatus;
  group_id?: string;
  attachments: Attachment[];
  meeting_request?: MeetingRequest;
  published_note?: string;
  published_at?: string;
  evaluation?: {
    status: "valid" | "invalid" | null;
    evaluated_by?: string;
    evaluated_at?: string;
    points_modifier?: number;
  };
}

export type DevelopmentRecord = Checkin;

// ============================================================================
// PERÍODO DE DESENVOLVIMENTO (legado)
// ============================================================================

export interface DevelopmentPeriod {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "paused";
  assessment_id?: string;
  kickoff_meeting_id?: string;
  created_at: string;
}

export interface AssessmentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface AssessmentRecord {
  id: string;
  period_id: string;
  employee_id: string;
  result_summary: string;
  attachment?: AssessmentAttachment;
  assessed_at: string;
  created_at: string;
}

export interface MacroGoal {
  id: string;
  period_id: string;
  macro: string;
  description: string;
  target?: string;
  status: "active" | "achieved" | "paused";
  created_at: string;
}

export interface PeriodSuggestion {
  id: string;
  period_id: string;
  text: string;
  source: "kickoff" | "intermediate" | "system";
  status: "pending" | "in_progress" | "done";
  created_at: string;
}

export interface KickoffMeeting {
  id: string;
  period_id: string;
  employee_id: string;
  meeting_date: string;
  conclusions: string;
  macros: string[];
  goals: MacroGoal[];
  suggestions: PeriodSuggestion[];
  created_at: string;
}

export interface RecordGroup {
  id: string;
  period_id: string;
  name: string;
  record_ids: string[];
  status: "draft" | "published";
  published_at?: string;
  created_at: string;
}

export interface IntermediateMeeting {
  id: string;
  period_id: string;
  employee_id: string;
  meeting_date: string;
  summary: string;
  created_at: string;
}

// ============================================================================
// TIPOS LEGADOS (mantidos para compatibilidade)
// ============================================================================

export interface CheckinEvaluation {
  checkin_id: string;
  status: "valid" | "invalid";
  evaluated_by: string;
  points_modifier: number;
}

export interface Summary {
  id: string;
  user_id: string;
  period_from: string;
  period_to: string;
  audience: "self" | "manager" | "hr" | "public";
  content: string;
  created_at: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  token?: string;
}

// ============================================================================
// NOVOS TIPOS — CICLO ANUAL DE ASSESSMENT
// ============================================================================

export type MeetingType =
  | "reuniao_1_gp_gerido"
  | "reuniao_2_gp_gerido"
  | "reuniao_gp_gestor"
  | "reuniao_principal"
  | "reuniao_avulsa"
  | "reuniao_quadrimestral"
  | "reuniao_checkin";

export type CycleStepStatus =
  | "not_started"
  | "pending"
  | "in_progress"
  | "completed"
  | "delayed"
  | "draft"
  | "private"
  | "published"
  | "awaiting_review";

export interface Meeting {
  id: string;
  type: MeetingType;
  period_id?: string;
  cycle_id?: string;
  participants: string[];
  agenda?: string;
  summary?: string;
  status: "pending" | "done" | "cancelled";
  planned_date?: string;
  actual_date?: string;
  created_by: string;
  created_at: string;
}

export interface AssessmentCycle {
  id: string;
  year: number;
  employee_id: string;
  gp_id: string;
  manager_id: string;
  aux_manager_id?: string;
  overall_status: "not_started" | "in_progress" | "completed";
  current_step: string;
  assessment_status: CycleStepStatus;
  meeting_1_status: CycleStepStatus;
  self_review_status: CycleStepStatus;
  meeting_2_status: CycleStepStatus;
  manager_review_status: CycleStepStatus;
  meeting_gp_manager_status: CycleStepStatus;
  main_meeting_status: CycleStepStatus;
  journey_status: CycleStepStatus;
  progress_form_1_status: CycleStepStatus;
  progress_form_2_status: CycleStepStatus;
  assessment_id?: string;
  self_review_id?: string;
  manager_review_id?: string;
  main_meeting_id?: string;
  created_at: string;
}

export interface SelfReview {
  id: string;
  cycle_id: string;
  employee_id: string;
  responses: { question: string; answer: string }[];
  attachments: Attachment[];
  status: "draft" | "submitted" | "reviewed";
  last_saved_at: string;
  submitted_at?: string;
  created_at: string;
}

export type ManagerReviewVisibility = "private" | "published";

export interface ManagerReview {
  id: string;
  cycle_id: string;
  manager_id: string;
  employee_id: string;
  responses: { question: string; answer: string }[];
  overall_assessment: string;
  visibility: ManagerReviewVisibility;
  status: "draft" | "completed";
  last_saved_at: string;
  published_at?: string;
  created_at: string;
}

export interface ProgressForm {
  id: string;
  cycle_id?: string;
  employee_id: string;
  quadrimestre: 1 | 2 | 3;
  responses: { question: string; answer: string }[];
  attachments: Attachment[];
  status: "not_started" | "draft" | "submitted" | "reviewed_by_gp";
  due_date: string;
  submitted_at?: string;
  reviewed_at?: string;
  meeting_id?: string;
  created_at: string;
}

export type TrainingFormat = "presencial" | "youtube" | "lg" | "video" | "link" | "pdf" | "slides";

export interface Training {
  id: string;
  title: string;
  description?: string;
  format: TrainingFormat;
  url?: string;
  duration_minutes?: number;
  suggested_for?: string[];
  status: "active" | "archived";
  created_at: string;
}

export interface DeepFollowup {
  id: string;
  employee_id: string;
  gp_id: string;
  reason: string;
  notes: string;
  start_date: string;
  status: "active" | "resolved";
  created_at: string;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  target_users: string[];
  status: "draft" | "active" | "closed";
  due_date?: string;
  response_count: number;
  created_at: string;
}

// ============================================================================
// DADOS SEED (MOCK)
// ============================================================================

const SEED_USERS: User[] = [
  {
    id: "user-1",
    name: "João",
    email: "joao@company.com",
    roles: ["RH"],
    faixa: "Ciclo III",
    gp_id: "user-2",
    primary_macros: ["Gestão de Pessoas", "Comunicação"],
    area: "Gestão de Pessoas",
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    name: "Maria",
    email: "maria@company.com",
    roles: ["Sócio"],
    faixa: "Ciclo III",
    primary_macros: ["Visão Estratégica", "Liderança"],
    area: "Societário",
    created_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "user-3",
    name: "Carlos",
    email: "carlos@company.com",
    roles: ["Gestor"],
    faixa: "Ciclo II",
    manager_id: "user-2",
    gp_id: "user-2",
    primary_macros: ["Liderança", "Comunicação"],
    area: "Tributário",
    created_at: "2025-01-05T10:00:00Z",
  },
  {
    id: "user-4",
    name: "Ana",
    email: "ana@company.com",
    roles: ["Colaborador"],
    faixa: "Ciclo II",
    manager_id: "user-3",
    aux_manager_id: "user-8",
    gp_id: "user-2",
    primary_macros: ["Comunicação", "Trabalho em Equipe"],
    area: "Tributário",
    created_at: "2024-12-01T10:00:00Z",
  },
  {
    id: "user-5",
    name: "Pedro",
    email: "pedro@company.com",
    roles: ["Colaborador"],
    faixa: "Ciclo I",
    manager_id: "user-3",
    gp_id: "user-2",
    primary_macros: ["Resolução de Problemas", "Inovação"],
    area: "Tributário",
    deep_followup: true,
    created_at: "2024-11-01T10:00:00Z",
  },
  {
    id: "user-6",
    name: "Sofia",
    email: "sofia@company.com",
    roles: ["Colaborador"],
    faixa: "Ciclo I",
    manager_id: "user-3",
    gp_id: "user-2",
    primary_macros: ["Trabalho em Equipe", "Comunicação"],
    area: "Tributário",
    created_at: "2024-11-15T10:00:00Z",
  },
  {
    id: "user-7",
    name: "Lucia",
    email: "lucia@company.com",
    roles: ["DP"],
    faixa: "Ciclo III",
    primary_macros: ["Gestão de Pessoas", "Trabalho em Equipe"],
    area: "DP / Administrativo",
    created_at: "2025-02-01T10:00:00Z",
  },
  {
    id: "user-8",
    name: "Roberto",
    email: "roberto@company.com",
    roles: ["GestorAuxiliar"],
    faixa: "Ciclo II",
    manager_id: "user-3",
    gp_id: "user-2",
    primary_macros: ["Liderança", "Foco em Resultados"],
    area: "Tributário",
    created_at: "2025-01-20T10:00:00Z",
  },
];

const SEED_MACROS = [
  "Liderança",
  "Comunicação",
  "Resolução de Problemas",
  "Trabalho em Equipe",
  "Inovação",
  "Gestão de Pessoas",
  "Visão Estratégica",
  "Foco em Resultados",
];

const SEED_MACRO_GOALS: MacroGoal[] = [
  {
    id: "goal-1",
    period_id: "period-1",
    macro: "Liderança",
    description:
      "Desenvolver liderança situacional, conduzindo reuniões e processos de forma mais estruturada.",
    target: "Conduzir ao menos 2 projetos de forma autônoma no período",
    status: "active",
    created_at: "2025-10-05T10:00:00Z",
  },
  {
    id: "goal-2",
    period_id: "period-1",
    macro: "Comunicação",
    description: "Melhorar clareza e assertividade nas comunicações escritas e orais.",
    target: "Receber feedback positivo sobre comunicação em pelo menos 3 reuniões",
    status: "active",
    created_at: "2025-10-05T10:00:00Z",
  },
  {
    id: "goal-3",
    period_id: "period-1",
    macro: "Resolução de Problemas",
    description: "Aprofundar análise de causa raiz e estruturação de soluções.",
    status: "active",
    created_at: "2025-10-05T10:00:00Z",
  },
  {
    id: "goal-4",
    period_id: "period-2",
    macro: "Comunicação",
    description: "Desenvolver comunicação clara em apresentações e reuniões de equipe.",
    status: "active",
    created_at: "2025-10-05T10:00:00Z",
  },
  {
    id: "goal-5",
    period_id: "period-2",
    macro: "Trabalho em Equipe",
    description: "Atuar de forma mais proativa na colaboração entre áreas.",
    status: "active",
    created_at: "2025-10-05T10:00:00Z",
  },
];

const SEED_SUGGESTIONS: PeriodSuggestion[] = [
  {
    id: "sug-1",
    period_id: "period-1",
    text: "Participar do curso interno de Liderança Situacional",
    source: "kickoff",
    status: "in_progress",
    created_at: "2025-10-05T10:00:00Z",
  },
  {
    id: "sug-2",
    period_id: "period-1",
    text: "Leitura: 'Comunicação Não-Violenta' de Marshall Rosenberg",
    source: "kickoff",
    status: "done",
    created_at: "2025-10-05T10:00:00Z",
  },
  {
    id: "sug-3",
    period_id: "period-1",
    text: "Mentoria quinzenal com sócio da área",
    source: "intermediate",
    status: "in_progress",
    created_at: "2026-01-10T10:00:00Z",
  },
];

const SEED_KICKOFFS: KickoffMeeting[] = [
  {
    id: "kickoff-1",
    period_id: "period-1",
    employee_id: "user-1",
    meeting_date: "2025-10-05",
    conclusions:
      "Alinhamento sobre o foco do período: desenvolvimento de liderança com ênfase em comunicação estratégica. Colaborador demonstrou clareza sobre os desafios e disposição para mudança.",
    macros: ["Liderança", "Comunicação", "Resolução de Problemas"],
    goals: SEED_MACRO_GOALS.filter((g) => g.period_id === "period-1"),
    suggestions: SEED_SUGGESTIONS.filter((s) => s.period_id === "period-1"),
    created_at: "2025-10-05T16:00:00Z",
  },
];

const SEED_PERIODS: DevelopmentPeriod[] = [
  {
    id: "period-1",
    employee_id: "user-1",
    start_date: "2025-10-01",
    end_date: "2026-04-01",
    status: "active",
    assessment_id: "assessment-1",
    kickoff_meeting_id: "kickoff-1",
    created_at: "2025-10-01T10:00:00Z",
  },
  {
    id: "period-2",
    employee_id: "user-4",
    start_date: "2025-10-01",
    end_date: "2026-04-01",
    status: "active",
    assessment_id: "assessment-2",
    created_at: "2025-10-01T10:00:00Z",
  },
];

const SEED_ASSESSMENTS: AssessmentRecord[] = [
  {
    id: "assessment-1",
    period_id: "period-1",
    employee_id: "user-1",
    result_summary:
      "Resultado acima da média nas competências de Liderança e Resolução de Problemas. Oportunidades de desenvolvimento em Comunicação estratégica. Score geral: 72/100.",
    attachment: {
      id: "attach-1",
      name: "assessment_joao_out2025.pdf",
      type: "application/pdf",
      size: 245000,
      uploaded_at: "2025-10-02T14:30:00Z",
    },
    assessed_at: "2025-09-28",
    created_at: "2025-10-02T14:30:00Z",
  },
  {
    id: "assessment-2",
    period_id: "period-2",
    employee_id: "user-4",
    result_summary:
      "Bom desempenho em Trabalho em Equipe e colaboração. Foco de desenvolvimento em Comunicação e Liderança. Score geral: 61/100.",
    assessed_at: "2025-09-28",
    created_at: "2025-10-02T14:30:00Z",
  },
];

const SEED_INTERMEDIATE_MEETINGS: IntermediateMeeting[] = [
  {
    id: "int-meeting-1",
    period_id: "period-1",
    employee_id: "user-1",
    meeting_date: "2026-01-10",
    summary:
      "Revisão de meio período. Progresso positivo em Liderança — já conduz reuniões com mais estrutura. Necessário reforçar foco em Comunicação. Sugerida mentoria adicional quinzenal.",
    created_at: "2026-01-10T17:00:00Z",
  },
];

const SEED_CHECKINS: Checkin[] = [
  {
    id: "checkin-1",
    created_at: "2026-02-20T14:30:00Z",
    subject_user_id: "user-1",
    author_user_id: "user-1",
    period_id: "period-1",
    cycle_id: "cycle-1",
    flag: "green",
    macro: "Liderança",
    text: "Liderou com sucesso a reunião de planejamento trimestral, alinhando toda a equipe com os objetivos.",
    visibility: "visible",
    status: "published",
    attachments: [],
  },
  {
    id: "checkin-2",
    created_at: "2026-02-19T10:15:00Z",
    subject_user_id: "user-1",
    author_user_id: "user-1",
    period_id: "period-1",
    cycle_id: "cycle-1",
    flag: "yellow",
    macro: "Comunicação",
    text: "Apresentação para cliente ficou confusa em pontos técnicos. Preciso preparar melhor os materiais com antecedência.",
    visibility: "private",
    status: "published",
    attachments: [],
  },
  {
    id: "checkin-3",
    created_at: "2026-02-18T16:45:00Z",
    subject_user_id: "user-1",
    author_user_id: "user-3",
    period_id: "period-1",
    cycle_id: "cycle-1",
    flag: "green",
    macro: "Resolução de Problemas",
    text: "Resolveu rapidamente o problema crítico do cliente com pensamento estratégico e boa articulação com o time.",
    visibility: "visible",
    status: "published",
    attachments: [],
  },
  {
    id: "checkin-4",
    created_at: "2026-02-17T09:00:00Z",
    subject_user_id: "user-1",
    author_user_id: "user-1",
    period_id: "period-1",
    cycle_id: "cycle-1",
    flag: "green",
    macro: "Inovação",
    text: "Propôs solução inovadora para otimizar o processo de onboarding da equipe.",
    visibility: "visible",
    status: "draft",
    attachments: [],
  },
  {
    id: "checkin-5",
    created_at: "2026-02-15T13:20:00Z",
    subject_user_id: "user-1",
    author_user_id: "user-1",
    period_id: "period-1",
    cycle_id: "cycle-1",
    flag: "red",
    macro: "Comunicação",
    text: "Situação de conflito com stakeholder externo. Comunicação falhou e precisou de intervenção do gestor para mediar.",
    visibility: "private",
    status: "draft",
    attachments: [],
    meeting_request: {
      id: "mr-1",
      record_id: "checkin-5",
      agenda: "Discutir estratégia para situações de conflito com clientes externos",
      requested_at: "2026-02-15T13:20:00Z",
      status: "pending",
    },
  },
  {
    id: "checkin-6",
    created_at: "2026-02-10T10:00:00Z",
    subject_user_id: "user-1",
    author_user_id: "user-1",
    period_id: "period-1",
    cycle_id: "cycle-1",
    flag: "green",
    macro: "Liderança",
    text: "Conduziu reunião de retrospectiva do time de forma estruturada, com plano de ação claro ao final.",
    visibility: "visible",
    status: "published",
    published_at: "2026-02-12T09:00:00Z",
    attachments: [],
  },
  {
    id: "checkin-7",
    created_at: "2026-03-01T09:30:00Z",
    subject_user_id: "user-4",
    author_user_id: "user-3",
    period_id: "period-2",
    cycle_id: "cycle-2",
    flag: "yellow",
    macro: "Comunicação",
    text: "Relatório entregue com lacunas de argumentação. Oportunidade de desenvolvimento em estrutura de texto.",
    visibility: "private",
    status: "published",
    attachments: [],
  },
  {
    id: "checkin-8",
    created_at: "2026-03-05T14:00:00Z",
    subject_user_id: "user-5",
    author_user_id: "user-8",
    period_id: undefined,
    cycle_id: "cycle-3",
    flag: "red",
    macro: "Foco em Resultados",
    text: "Prazo de entrega não cumprido sem comunicação prévia ao gestor. Requer atenção imediata.",
    visibility: "private",
    status: "published",
    attachments: [],
  },
];

// ── Novos Seed Data ──────────────────────────────────────────────────────────

const SEED_ASSESSMENT_CYCLES: AssessmentCycle[] = [
  {
    id: "cycle-1",
    year: 2026,
    employee_id: "user-1",
    gp_id: "user-2",
    manager_id: "user-3",
    overall_status: "in_progress",
    current_step: "Avaliação do Gestor",
    assessment_status: "completed",
    meeting_1_status: "completed",
    self_review_status: "completed",
    meeting_2_status: "completed",
    manager_review_status: "draft",
    meeting_gp_manager_status: "pending",
    main_meeting_status: "not_started",
    journey_status: "not_started",
    progress_form_1_status: "completed",
    progress_form_2_status: "not_started",
    assessment_id: "assessment-1",
    self_review_id: "self-review-1",
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "cycle-2",
    year: 2026,
    employee_id: "user-4",
    gp_id: "user-2",
    manager_id: "user-3",
    aux_manager_id: "user-8",
    overall_status: "in_progress",
    current_step: "Reunião 1 GP + Gerido",
    assessment_status: "completed",
    meeting_1_status: "pending",
    self_review_status: "not_started",
    meeting_2_status: "not_started",
    manager_review_status: "not_started",
    meeting_gp_manager_status: "not_started",
    main_meeting_status: "not_started",
    journey_status: "not_started",
    progress_form_1_status: "not_started",
    progress_form_2_status: "not_started",
    assessment_id: "assessment-2",
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "cycle-3",
    year: 2026,
    employee_id: "user-5",
    gp_id: "user-2",
    manager_id: "user-3",
    overall_status: "not_started",
    current_step: "Assessment",
    assessment_status: "pending",
    meeting_1_status: "not_started",
    self_review_status: "not_started",
    meeting_2_status: "not_started",
    manager_review_status: "not_started",
    meeting_gp_manager_status: "not_started",
    main_meeting_status: "not_started",
    journey_status: "not_started",
    progress_form_1_status: "not_started",
    progress_form_2_status: "not_started",
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "cycle-4",
    year: 2026,
    employee_id: "user-6",
    gp_id: "user-2",
    manager_id: "user-3",
    overall_status: "not_started",
    current_step: "Assessment",
    assessment_status: "delayed",
    meeting_1_status: "not_started",
    self_review_status: "not_started",
    meeting_2_status: "not_started",
    manager_review_status: "not_started",
    meeting_gp_manager_status: "not_started",
    main_meeting_status: "not_started",
    journey_status: "not_started",
    progress_form_1_status: "not_started",
    progress_form_2_status: "not_started",
    created_at: "2026-01-01T10:00:00Z",
  },
];

const SEED_MEETINGS: Meeting[] = [
  {
    id: "meeting-1",
    type: "reuniao_1_gp_gerido",
    cycle_id: "cycle-1",
    participants: ["user-2", "user-1"],
    agenda: "Compreensão do resultado do assessment e alinhamento do ciclo.",
    summary:
      "Resultado do assessment apresentado. Colaborador demonstrou clareza sobre pontos de desenvolvimento. Próximos passos: autoavaliação.",
    status: "done",
    planned_date: "2026-01-15",
    actual_date: "2026-01-15",
    created_by: "user-2",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "meeting-2",
    type: "reuniao_2_gp_gerido",
    cycle_id: "cycle-1",
    participants: ["user-2", "user-1"],
    agenda: "Feedback sobre autoavaliação e alinhamento de expectativas.",
    summary:
      "Autoavaliação discutida. Pontos fortes em Liderança reconhecidos. Oportunidade de Comunicação aprofundada.",
    status: "done",
    planned_date: "2026-02-20",
    actual_date: "2026-02-20",
    created_by: "user-2",
    created_at: "2026-02-15T10:00:00Z",
  },
  {
    id: "meeting-3",
    type: "reuniao_gp_gestor",
    cycle_id: "cycle-1",
    participants: ["user-2", "user-3"],
    agenda: "Alinhamento entre GP e gestor antes da reunião principal.",
    status: "pending",
    planned_date: "2026-04-10",
    created_by: "user-2",
    created_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "meeting-4",
    type: "reuniao_principal",
    cycle_id: "cycle-1",
    participants: ["user-2", "user-3", "user-1"],
    agenda: "Reunião principal: assessment, autoavaliação, avaliação gestor, definição de jornada.",
    status: "pending",
    planned_date: "2026-04-20",
    created_by: "user-2",
    created_at: "2026-03-01T10:00:00Z",
  },
];

const SEED_SELF_REVIEWS: SelfReview[] = [
  {
    id: "self-review-1",
    cycle_id: "cycle-1",
    employee_id: "user-1",
    responses: [
      {
        question: "Quais foram suas principais entregas e conquistas neste ciclo?",
        answer:
          "Conduzi com autonomia a reestruturação do processo de integração de novos colaboradores, reduzindo o tempo de onboarding. Também liderança de dois projetos internos com entrega dentro do prazo.",
      },
      {
        question: "Em quais áreas você percebeu maior crescimento?",
        answer:
          "Liderança situacional e gestão de reuniões. Recebi feedbacks positivos sobre a estruturação e condução de reuniões ao longo do período.",
      },
      {
        question: "O que você identificou como principal oportunidade de desenvolvimento?",
        answer:
          "Comunicação com stakeholders externos. Tenho dificuldade em adaptar linguagem técnica para diferentes públicos, especialmente em apresentações para clientes.",
      },
    ],
    attachments: [
      {
        name: "evidencias_joao_lideranca.pdf",
        url: "",
        type: "application/pdf",
        size: 180000,
        uploaded_at: "2026-02-05T10:00:00Z",
      },
    ],
    status: "submitted",
    last_saved_at: "2026-02-10T15:30:00Z",
    submitted_at: "2026-02-10T15:30:00Z",
    created_at: "2026-02-01T10:00:00Z",
  },
];

const SEED_MANAGER_REVIEWS: ManagerReview[] = [
  {
    id: "manager-review-1",
    cycle_id: "cycle-1",
    manager_id: "user-3",
    employee_id: "user-1",
    responses: [
      {
        question: "Como você avalia o desempenho geral deste colaborador no ciclo?",
        answer:
          "João demonstrou evolução significativa em Liderança. Conduz reuniões com muito mais estrutura e autonomia do que no ciclo anterior.",
      },
      {
        question: "Quais foram os pontos críticos de desenvolvimento?",
        answer:
          "Comunicação com clientes externos ainda precisa de atenção. Houve situação de ruído em apresentação que requereu minha intervenção.",
      },
    ],
    overall_assessment:
      "Colaborador em evolução consistente. Recomendo continuidade do desenvolvimento em Comunicação com foco em clareza para públicos externos.",
    visibility: "private",
    status: "draft",
    last_saved_at: "2026-03-15T16:00:00Z",
    created_at: "2026-03-10T10:00:00Z",
  },
];

const SEED_PROGRESS_FORMS: ProgressForm[] = [
  {
    id: "progress-form-1",
    cycle_id: "cycle-1",
    employee_id: "user-1",
    quadrimestre: 1,
    responses: [
      {
        question: "Quais ações definidas na reunião principal foram colocadas em prática?",
        answer:
          "Participei do curso de Liderança Situacional e iniciei a mentoria quinzenal. Apliquei frameworks de reunião estruturada em 4 projetos.",
      },
      {
        question: "O que avançou bem no seu desenvolvimento?",
        answer: "Liderança de projetos — me sinto mais confiante conduzindo equipes em situações de pressão.",
      },
      {
        question: "O que está mais difícil e por quê?",
        answer:
          "Comunicação com clientes. A adaptação de linguagem para diferentes perfis ainda exige muito esforço consciente.",
      },
    ],
    attachments: [],
    status: "submitted",
    due_date: "2026-02-28",
    submitted_at: "2026-02-25T14:00:00Z",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "progress-form-2",
    cycle_id: "cycle-2",
    employee_id: "user-4",
    quadrimestre: 1,
    responses: [],
    attachments: [],
    status: "not_started",
    due_date: "2026-02-28",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "progress-form-3",
    cycle_id: "cycle-3",
    employee_id: "user-5",
    quadrimestre: 1,
    responses: [],
    attachments: [],
    status: "not_started",
    due_date: "2026-02-28",
    created_at: "2026-02-01T10:00:00Z",
  },
];

const SEED_TRAININGS: Training[] = [
  {
    id: "training-1",
    title: "Liderança Situacional",
    description: "Fundamentos de liderança adaptativa para diferentes perfis e contextos.",
    format: "presencial",
    duration_minutes: 480,
    suggested_for: ["user-1", "user-3"],
    status: "active",
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "training-2",
    title: "Comunicação Não-Violenta",
    description: "Técnicas de comunicação assertiva e empática para contextos profissionais.",
    format: "youtube",
    url: "",
    duration_minutes: 120,
    suggested_for: ["user-1", "user-4"],
    status: "active",
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "training-3",
    title: "Gestão de Conflitos",
    description: "Abordagens para resolução de conflitos em contextos de alta pressão.",
    format: "lg",
    duration_minutes: 60,
    suggested_for: ["user-5"],
    status: "active",
    created_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "training-4",
    title: "Análise de Causa Raiz",
    description: "Metodologias de diagnóstico e estruturação de soluções.",
    format: "pdf",
    duration_minutes: 90,
    suggested_for: ["user-1", "user-5"],
    status: "active",
    created_at: "2026-01-01T10:00:00Z",
  },
];

const SEED_DEEP_FOLLOWUPS: DeepFollowup[] = [
  {
    id: "followup-1",
    employee_id: "user-5",
    gp_id: "user-2",
    reason: "Reincidência em problemas de entrega e comunicação com gestor. Acompanhamento aprofundado necessário.",
    notes:
      "Reunião adicional com Pedro agendada para o dia 10/04. Gestor Carlos informado do acompanhamento. Monitorar evolução dos check-ins nas próximas semanas.",
    start_date: "2026-03-05",
    status: "active",
    created_at: "2026-03-05T10:00:00Z",
  },
];

const SEED_SURVEYS: Survey[] = [
  {
    id: "survey-1",
    title: "Pesquisa de Clima — Q1 2026",
    description: "Pesquisa anual de clima organizacional. Respostas anônimas.",
    created_by: "user-7",
    target_users: ["user-1", "user-3", "user-4", "user-5", "user-6"],
    status: "draft",
    due_date: "2026-05-15",
    response_count: 0,
    created_at: "2026-04-01T10:00:00Z",
  },
];

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const getStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

const initializeStorage = () => {
  if (!getStorage("users")) setStorage("users", SEED_USERS);
  if (!getStorage("macros")) setStorage("macros", SEED_MACROS);
  if (!getStorage("checkins")) setStorage("checkins", SEED_CHECKINS);
  if (!getStorage("periods")) setStorage("periods", SEED_PERIODS);
  if (!getStorage("assessments")) setStorage("assessments", SEED_ASSESSMENTS);
  if (!getStorage("kickoffs")) setStorage("kickoffs", SEED_KICKOFFS);
  if (!getStorage("macro_goals")) setStorage("macro_goals", SEED_MACRO_GOALS);
  if (!getStorage("suggestions")) setStorage("suggestions", SEED_SUGGESTIONS);
  if (!getStorage("intermediate_meetings"))
    setStorage("intermediate_meetings", SEED_INTERMEDIATE_MEETINGS);
  if (!getStorage("record_groups")) setStorage("record_groups", []);
  // Novos
  if (!getStorage("assessment_cycles")) setStorage("assessment_cycles", SEED_ASSESSMENT_CYCLES);
  if (!getStorage("meetings")) setStorage("meetings", SEED_MEETINGS);
  if (!getStorage("self_reviews")) setStorage("self_reviews", SEED_SELF_REVIEWS);
  if (!getStorage("manager_reviews")) setStorage("manager_reviews", SEED_MANAGER_REVIEWS);
  if (!getStorage("progress_forms")) setStorage("progress_forms", SEED_PROGRESS_FORMS);
  if (!getStorage("trainings")) setStorage("trainings", SEED_TRAININGS);
  if (!getStorage("deep_followups")) setStorage("deep_followups", SEED_DEEP_FOLLOWUPS);
  if (!getStorage("surveys")) setStorage("surveys", SEED_SURVEYS);
};

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export async function requestOtp(email: string): Promise<OtpResponse> {
  if (API_BASE_URL) {
    return fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then((r) => r.json());
  }

  const users = getStorage("users", SEED_USERS);
  const userExists = users.some((u: User) => u.email === email);
  if (!userExists) return { success: false, message: "Email não encontrado" };

  setStorage(`otp_${email}`, {
    code: "123456",
    attempts: 0,
    created_at: new Date().toISOString(),
  });

  return { success: true, message: "OTP enviado (teste: 123456)" };
}

export async function verifyOtp(email: string, code: string): Promise<OtpResponse> {
  if (API_BASE_URL) {
    return fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    }).then((r) => r.json());
  }

  const otpData = getStorage(`otp_${email}`);
  if (!otpData || otpData.code !== code) return { success: false, message: "Código inválido" };

  const users = getStorage("users", SEED_USERS);
  const user = users.find((u: User) => u.email === email);
  if (!user) return { success: false, message: "Usuário não encontrado" };

  const token = btoa(`${email}:${Date.now()}`);
  setStorage("auth_token", token);
  setStorage("current_user_id", user.id);
  localStorage.removeItem(`otp_${email}`);

  return { success: true, message: "Autenticado com sucesso", token };
}

export async function getMe(): Promise<User | null> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  const userId = getStorage("current_user_id");
  if (!userId) return null;
  const users = getStorage("users", SEED_USERS);
  return users.find((u: User) => u.id === userId) || null;
}

export async function logout(): Promise<void> {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("current_user_id");
}

export async function getAllUsers(): Promise<User[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  return getStorage("users", SEED_USERS);
}

export async function searchEmployees(query: string): Promise<User[]> {
  const users: User[] = getStorage("users", SEED_USERS);
  if (!query.trim()) return users;
  return users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));
}

// ============================================================================
// MACROS ENDPOINTS
// ============================================================================

export async function getMacros(): Promise<string[]> {
  if (API_BASE_URL) return fetch(`${API_BASE_URL}/macros`).then((r) => r.json());
  return getStorage("macros", SEED_MACROS);
}

// ============================================================================
// PERÍODOS DE DESENVOLVIMENTO (legado)
// ============================================================================

export async function getActivePeriod(userId: string): Promise<DevelopmentPeriod | null> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/periods/active/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const periods: DevelopmentPeriod[] = getStorage("periods", SEED_PERIODS);
  return periods.find((p) => p.employee_id === userId && p.status === "active") || null;
}

export async function getPeriodsByEmployee(userId: string): Promise<DevelopmentPeriod[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/periods?employee_id=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const periods: DevelopmentPeriod[] = getStorage("periods", SEED_PERIODS);
  return periods.filter((p) => p.employee_id === userId);
}

export async function createPeriod(payload: Partial<DevelopmentPeriod>): Promise<DevelopmentPeriod> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/periods`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }
  const period: DevelopmentPeriod = {
    id: `period-${Date.now()}`,
    employee_id: payload.employee_id || "",
    start_date: payload.start_date || new Date().toISOString().split("T")[0],
    end_date: payload.end_date || "",
    status: "active",
    created_at: new Date().toISOString(),
  };
  const periods = getStorage("periods", SEED_PERIODS);
  periods.push(period);
  setStorage("periods", periods);
  return period;
}

// ============================================================================
// ASSESSMENT (legado)
// ============================================================================

export async function getAssessment(periodId: string): Promise<AssessmentRecord | null> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/assessments?period_id=${periodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const assessments: AssessmentRecord[] = getStorage("assessments", SEED_ASSESSMENTS);
  return assessments.find((a) => a.period_id === periodId) || null;
}

export async function saveAssessment(payload: Partial<AssessmentRecord>): Promise<AssessmentRecord> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }
  const assessments: AssessmentRecord[] = getStorage("assessments", SEED_ASSESSMENTS);
  const existing = assessments.findIndex((a) => a.period_id === payload.period_id);
  const assessment: AssessmentRecord = {
    id: existing >= 0 ? assessments[existing].id : `assessment-${Date.now()}`,
    period_id: payload.period_id || "",
    employee_id: payload.employee_id || "",
    result_summary: payload.result_summary || "",
    attachment: payload.attachment,
    assessed_at: payload.assessed_at || new Date().toISOString().split("T")[0],
    created_at: existing >= 0 ? assessments[existing].created_at : new Date().toISOString(),
  };
  if (existing >= 0) assessments[existing] = assessment;
  else assessments.push(assessment);
  setStorage("assessments", assessments);
  return assessment;
}

// ============================================================================
// KICKOFF / REUNIÃO INICIAL (legado)
// ============================================================================

export async function getKickoff(periodId: string): Promise<KickoffMeeting | null> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/kickoffs?period_id=${periodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const kickoffs: KickoffMeeting[] = getStorage("kickoffs", SEED_KICKOFFS);
  return kickoffs.find((k) => k.period_id === periodId) || null;
}

export async function saveKickoff(payload: Partial<KickoffMeeting>): Promise<KickoffMeeting> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/kickoffs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }
  const kickoffs: KickoffMeeting[] = getStorage("kickoffs", SEED_KICKOFFS);
  const existing = kickoffs.findIndex((k) => k.period_id === payload.period_id);
  const kickoff: KickoffMeeting = {
    id: existing >= 0 ? kickoffs[existing].id : `kickoff-${Date.now()}`,
    period_id: payload.period_id || "",
    employee_id: payload.employee_id || "",
    meeting_date: payload.meeting_date || new Date().toISOString().split("T")[0],
    conclusions: payload.conclusions || "",
    macros: payload.macros || [],
    goals: payload.goals || [],
    suggestions: payload.suggestions || [],
    created_at: existing >= 0 ? kickoffs[existing].created_at : new Date().toISOString(),
  };
  if (existing >= 0) kickoffs[existing] = kickoff;
  else kickoffs.push(kickoff);
  setStorage("kickoffs", kickoffs);
  return kickoff;
}

// ============================================================================
// MACRO GOALS
// ============================================================================

export async function getMacroGoals(periodId: string): Promise<MacroGoal[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/macro-goals?period_id=${periodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const goals: MacroGoal[] = getStorage("macro_goals", SEED_MACRO_GOALS);
  return goals.filter((g) => g.period_id === periodId);
}

export async function saveMacroGoal(payload: Partial<MacroGoal>): Promise<MacroGoal> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/macro-goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }
  const goals: MacroGoal[] = getStorage("macro_goals", SEED_MACRO_GOALS);
  const goal: MacroGoal = {
    id: `goal-${Date.now()}`,
    period_id: payload.period_id || "",
    macro: payload.macro || "",
    description: payload.description || "",
    target: payload.target,
    status: payload.status || "active",
    created_at: new Date().toISOString(),
  };
  goals.push(goal);
  setStorage("macro_goals", goals);
  return goal;
}

// ============================================================================
// SUGESTÕES DO PERÍODO
// ============================================================================

export async function getSuggestions(periodId: string): Promise<PeriodSuggestion[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/suggestions?period_id=${periodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const suggestions: PeriodSuggestion[] = getStorage("suggestions", SEED_SUGGESTIONS);
  return suggestions.filter((s) => s.period_id === periodId);
}

// ============================================================================
// REUNIÕES INTERMEDIÁRIAS (legado)
// ============================================================================

export async function getIntermediateMeetings(periodId: string): Promise<IntermediateMeeting[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/intermediate-meetings?period_id=${periodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const meetings: IntermediateMeeting[] = getStorage(
    "intermediate_meetings",
    SEED_INTERMEDIATE_MEETINGS
  );
  return meetings.filter((m) => m.period_id === periodId);
}

export async function createIntermediateMeeting(
  payload: Partial<IntermediateMeeting>
): Promise<IntermediateMeeting> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/intermediate-meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }
  const meeting: IntermediateMeeting = {
    id: `int-meeting-${Date.now()}`,
    period_id: payload.period_id || "",
    employee_id: payload.employee_id || "",
    meeting_date: payload.meeting_date || new Date().toISOString().split("T")[0],
    summary: payload.summary || "",
    created_at: new Date().toISOString(),
  };
  const meetings = getStorage("intermediate_meetings", SEED_INTERMEDIATE_MEETINGS);
  meetings.push(meeting);
  setStorage("intermediate_meetings", meetings);
  return meeting;
}

// ============================================================================
// CHECKIN / REGISTRO ENDPOINTS
// ============================================================================

export async function createCheckin(payload: Partial<Checkin>): Promise<Checkin> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/checkins`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }

  const currentUserId = getStorage("current_user_id");
  const checkin: Checkin = {
    id: `checkin-${Date.now()}`,
    created_at: new Date().toISOString(),
    subject_user_id: payload.subject_user_id || currentUserId,
    author_user_id: currentUserId,
    period_id: payload.period_id,
    cycle_id: payload.cycle_id,
    flag: payload.flag || "green",
    macro: payload.macro || "",
    text: payload.text || "",
    visibility: payload.visibility || "visible",
    status: payload.status || "draft",
    attachments: payload.attachments || [],
    meeting_request: payload.meeting_request,
    published_note: payload.published_note,
  };

  const checkins = getStorage("checkins", SEED_CHECKINS);
  checkins.push(checkin);
  setStorage("checkins", checkins);
  return checkin;
}

export async function saveCheckinDraft(payload: Partial<Checkin>): Promise<Checkin> {
  return createCheckin({ ...payload, status: "draft" });
}

export async function publishCheckin(id: string, note?: string): Promise<Checkin> {
  return updateCheckin(id, {
    status: "published",
    published_note: note,
    published_at: new Date().toISOString(),
  });
}

export async function updateCheckin(id: string, payload: Partial<Checkin>): Promise<Checkin> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/checkins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }

  const checkins: Checkin[] = getStorage("checkins", SEED_CHECKINS);
  const idx = checkins.findIndex((c) => c.id === id);
  if (idx >= 0) {
    checkins[idx] = { ...checkins[idx], ...payload };
    if (payload.status === "published") checkins[idx].published_at = new Date().toISOString();
    setStorage("checkins", checkins);
    return checkins[idx];
  }
  throw new Error("Registro não encontrado");
}

export async function listCheckins(filters?: {
  user_id?: string;
  period_id?: string;
  cycle_id?: string;
  macro?: string;
  flag?: RecordFlag;
  status?: RecordStatus;
  from_date?: string;
  to_date?: string;
}): Promise<Checkin[]> {
  if (API_BASE_URL) {
    const params = new URLSearchParams(filters as any);
    return fetch(`${API_BASE_URL}/checkins?${params}`).then((r) => r.json());
  }

  let checkins: Checkin[] = getStorage("checkins", SEED_CHECKINS);

  if (filters?.user_id) {
    checkins = checkins.filter(
      (c) => c.subject_user_id === filters.user_id || c.author_user_id === filters.user_id
    );
  }
  if (filters?.period_id) checkins = checkins.filter((c) => c.period_id === filters.period_id);
  if (filters?.cycle_id) checkins = checkins.filter((c) => c.cycle_id === filters.cycle_id);
  if (filters?.macro) checkins = checkins.filter((c) => c.macro === filters.macro);
  if (filters?.flag) checkins = checkins.filter((c) => c.flag === filters.flag);
  if (filters?.status) checkins = checkins.filter((c) => c.status === filters.status);

  return checkins.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// ============================================================================
// GRUPOS DE REGISTROS
// ============================================================================

export async function getRecordGroups(periodId: string): Promise<RecordGroup[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/record-groups?period_id=${periodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const groups: RecordGroup[] = getStorage("record_groups", []);
  return groups.filter((g) => g.period_id === periodId);
}

export async function createRecordGroup(payload: Partial<RecordGroup>): Promise<RecordGroup> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/record-groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }
  const group: RecordGroup = {
    id: `group-${Date.now()}`,
    period_id: payload.period_id || "",
    name: payload.name || "",
    record_ids: payload.record_ids || [],
    status: "draft",
    created_at: new Date().toISOString(),
  };
  const groups = getStorage("record_groups", []);
  groups.push(group);
  setStorage("record_groups", groups);
  return group;
}

// ============================================================================
// TEAM ENDPOINTS
// ============================================================================

export async function getTeam(): Promise<User[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/team`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const currentUser = await getMe();
  if (!currentUser) return [];
  const users: User[] = getStorage("users", SEED_USERS);
  return users.filter((u) => u.manager_id === currentUser.id);
}

export async function getSubTeam(userId: string): Promise<User[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/team/${userId}/subordinates`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const users: User[] = getStorage("users", SEED_USERS);
  return users.filter((u) => u.manager_id === userId);
}

// ============================================================================
// ASSESSMENT CYCLES (novos)
// ============================================================================

export async function getAssessmentCycles(filters?: {
  employee_id?: string;
  year?: number;
  gp_id?: string;
}): Promise<AssessmentCycle[]> {
  const cycles: AssessmentCycle[] = getStorage("assessment_cycles", SEED_ASSESSMENT_CYCLES);
  let result = cycles;
  if (filters?.employee_id) result = result.filter((c) => c.employee_id === filters.employee_id);
  if (filters?.year) result = result.filter((c) => c.year === filters.year);
  if (filters?.gp_id) result = result.filter((c) => c.gp_id === filters.gp_id);
  return result;
}

export async function getAssessmentCycle(cycleId: string): Promise<AssessmentCycle | null> {
  const cycles: AssessmentCycle[] = getStorage("assessment_cycles", SEED_ASSESSMENT_CYCLES);
  return cycles.find((c) => c.id === cycleId) || null;
}

export async function updateAssessmentCycle(
  cycleId: string,
  payload: Partial<AssessmentCycle>
): Promise<AssessmentCycle> {
  const cycles: AssessmentCycle[] = getStorage("assessment_cycles", SEED_ASSESSMENT_CYCLES);
  const idx = cycles.findIndex((c) => c.id === cycleId);
  if (idx >= 0) {
    cycles[idx] = { ...cycles[idx], ...payload };
    setStorage("assessment_cycles", cycles);
    return cycles[idx];
  }
  throw new Error("Ciclo não encontrado");
}

// ============================================================================
// REUNIÕES (novos)
// ============================================================================

export async function getMeetings(filters?: {
  cycle_id?: string;
  type?: MeetingType;
}): Promise<Meeting[]> {
  const meetings: Meeting[] = getStorage("meetings", SEED_MEETINGS);
  let result = meetings;
  if (filters?.cycle_id) result = result.filter((m) => m.cycle_id === filters.cycle_id);
  if (filters?.type) result = result.filter((m) => m.type === filters.type);
  return result;
}

export async function saveMeeting(payload: Partial<Meeting>): Promise<Meeting> {
  const currentUserId = getStorage("current_user_id");
  const meeting: Meeting = {
    id: `meeting-${Date.now()}`,
    type: payload.type || "reuniao_avulsa",
    cycle_id: payload.cycle_id,
    period_id: payload.period_id,
    participants: payload.participants || [],
    agenda: payload.agenda,
    summary: payload.summary,
    status: payload.status || "pending",
    planned_date: payload.planned_date,
    actual_date: payload.actual_date,
    created_by: currentUserId,
    created_at: new Date().toISOString(),
  };
  const meetings = getStorage("meetings", SEED_MEETINGS);
  meetings.push(meeting);
  setStorage("meetings", meetings);
  return meeting;
}

// ============================================================================
// AUTOAVALIAÇÃO (novos)
// ============================================================================

export async function getSelfReview(cycleId: string): Promise<SelfReview | null> {
  const reviews: SelfReview[] = getStorage("self_reviews", SEED_SELF_REVIEWS);
  return reviews.find((r) => r.cycle_id === cycleId) || null;
}

export async function saveSelfReview(payload: Partial<SelfReview>): Promise<SelfReview> {
  const currentUserId = getStorage("current_user_id");
  const reviews: SelfReview[] = getStorage("self_reviews", SEED_SELF_REVIEWS);
  const existing = reviews.findIndex((r) => r.cycle_id === payload.cycle_id);
  const review: SelfReview = {
    id: existing >= 0 ? reviews[existing].id : `self-review-${Date.now()}`,
    cycle_id: payload.cycle_id || "",
    employee_id: payload.employee_id || currentUserId,
    responses: payload.responses || [],
    attachments: payload.attachments || [],
    status: payload.status || "draft",
    last_saved_at: new Date().toISOString(),
    submitted_at: payload.submitted_at,
    created_at: existing >= 0 ? reviews[existing].created_at : new Date().toISOString(),
  };
  if (existing >= 0) reviews[existing] = review;
  else reviews.push(review);
  setStorage("self_reviews", reviews);
  return review;
}

// ============================================================================
// AVALIAÇÃO DO GESTOR (novos)
// ============================================================================

export async function getManagerReview(cycleId: string): Promise<ManagerReview | null> {
  const reviews: ManagerReview[] = getStorage("manager_reviews", SEED_MANAGER_REVIEWS);
  return reviews.find((r) => r.cycle_id === cycleId) || null;
}

export async function saveManagerReview(payload: Partial<ManagerReview>): Promise<ManagerReview> {
  const currentUserId = getStorage("current_user_id");
  const reviews: ManagerReview[] = getStorage("manager_reviews", SEED_MANAGER_REVIEWS);
  const existing = reviews.findIndex((r) => r.cycle_id === payload.cycle_id);
  const review: ManagerReview = {
    id: existing >= 0 ? reviews[existing].id : `manager-review-${Date.now()}`,
    cycle_id: payload.cycle_id || "",
    manager_id: payload.manager_id || currentUserId,
    employee_id: payload.employee_id || "",
    responses: payload.responses || [],
    overall_assessment: payload.overall_assessment || "",
    visibility: payload.visibility || "private",
    status: payload.status || "draft",
    last_saved_at: new Date().toISOString(),
    published_at: payload.published_at,
    created_at: existing >= 0 ? reviews[existing].created_at : new Date().toISOString(),
  };
  if (existing >= 0) reviews[existing] = review;
  else reviews.push(review);
  setStorage("manager_reviews", reviews);
  return review;
}

// ============================================================================
// FORMULÁRIO DE AVANÇO QUADRIMESTRAL (novos)
// ============================================================================

export async function getProgressForms(filters?: {
  employee_id?: string;
  cycle_id?: string;
}): Promise<ProgressForm[]> {
  const forms: ProgressForm[] = getStorage("progress_forms", SEED_PROGRESS_FORMS);
  let result = forms;
  if (filters?.employee_id) result = result.filter((f) => f.employee_id === filters.employee_id);
  if (filters?.cycle_id) result = result.filter((f) => f.cycle_id === filters.cycle_id);
  return result;
}

export async function saveProgressForm(payload: Partial<ProgressForm>): Promise<ProgressForm> {
  const currentUserId = getStorage("current_user_id");
  const forms: ProgressForm[] = getStorage("progress_forms", SEED_PROGRESS_FORMS);
  const existing = forms.findIndex(
    (f) => f.cycle_id === payload.cycle_id && f.quadrimestre === payload.quadrimestre
  );
  const form: ProgressForm = {
    id: existing >= 0 ? forms[existing].id : `progress-form-${Date.now()}`,
    cycle_id: payload.cycle_id,
    employee_id: payload.employee_id || currentUserId,
    quadrimestre: payload.quadrimestre || 1,
    responses: payload.responses || [],
    attachments: payload.attachments || [],
    status: payload.status || "draft",
    due_date: payload.due_date || "",
    submitted_at: payload.submitted_at,
    reviewed_at: payload.reviewed_at,
    meeting_id: payload.meeting_id,
    created_at: existing >= 0 ? forms[existing].created_at : new Date().toISOString(),
  };
  if (existing >= 0) forms[existing] = form;
  else forms.push(form);
  setStorage("progress_forms", forms);
  return form;
}

// ============================================================================
// TREINAMENTOS (novos)
// ============================================================================

export async function getTrainings(filters?: {
  suggested_for?: string;
}): Promise<Training[]> {
  const trainings: Training[] = getStorage("trainings", SEED_TRAININGS);
  if (filters?.suggested_for) {
    return trainings.filter(
      (t) => !t.suggested_for || t.suggested_for.includes(filters.suggested_for!)
    );
  }
  return trainings.filter((t) => t.status === "active");
}

// ============================================================================
// ACOMPANHAMENTO PROFUNDO — APENAS GP (novos)
// Não exibir para gerido. Segurança real deve ficar no Supabase/RLS.
// ============================================================================

export async function getDeepFollowups(filters?: {
  employee_id?: string;
  gp_id?: string;
}): Promise<DeepFollowup[]> {
  const followups: DeepFollowup[] = getStorage("deep_followups", SEED_DEEP_FOLLOWUPS);
  let result = followups;
  if (filters?.employee_id) result = result.filter((f) => f.employee_id === filters.employee_id);
  if (filters?.gp_id) result = result.filter((f) => f.gp_id === filters.gp_id);
  return result;
}

// ============================================================================
// PESQUISAS (novos)
// ============================================================================

export async function getSurveys(filters?: {
  created_by?: string;
}): Promise<Survey[]> {
  const surveys: Survey[] = getStorage("surveys", SEED_SURVEYS);
  if (filters?.created_by) return surveys.filter((s) => s.created_by === filters.created_by);
  return surveys;
}

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

export async function getPersonalDashboard(userId: string) {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/dashboard/personal/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  const users: User[] = getStorage("users", SEED_USERS);
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  const checkins = await listCheckins({ user_id: userId });
  const period = await getActivePeriod(userId);
  const cycles = await getAssessmentCycles({ employee_id: userId });
  const progressForms = await getProgressForms({ employee_id: userId });

  return {
    user,
    checkins,
    period,
    cycles,
    progressForms,
    stats: {
      total_checkins: checkins.length,
      green_checkins: checkins.filter((c) => c.flag === "green").length,
      yellow_checkins: checkins.filter((c) => c.flag === "yellow").length,
      red_checkins: checkins.filter((c) => c.flag === "red").length,
      draft_checkins: checkins.filter((c) => c.status === "draft").length,
      pending_meeting_requests: checkins.filter((c) => c.meeting_request?.status === "pending")
        .length,
      pending_progress_forms: progressForms.filter((f) => f.status === "not_started").length,
    },
  };
}

export async function getDashboard() {
  const users: User[] = getStorage("users", SEED_USERS);
  const checkins = await listCheckins();
  const periods: DevelopmentPeriod[] = getStorage("periods", SEED_PERIODS);
  const cycles: AssessmentCycle[] = getStorage("assessment_cycles", SEED_ASSESSMENT_CYCLES);
  const progressForms: ProgressForm[] = getStorage("progress_forms", SEED_PROGRESS_FORMS);
  const deepFollowups: DeepFollowup[] = getStorage("deep_followups", SEED_DEEP_FOLLOWUPS);

  const employees = users.filter((u) => u.roles.includes("Colaborador"));

  return {
    total_users: users.length,
    active_periods: periods.filter((p) => p.status === "active").length,
    active_cycles: cycles.filter((c) => c.overall_status === "in_progress").length,
    total_checkins: checkins.length,
    deep_followups_active: deepFollowups.filter((f) => f.status === "active").length,
    checkins_by_flag: {
      green: checkins.filter((c) => c.flag === "green").length,
      yellow: checkins.filter((c) => c.flag === "yellow").length,
      red: checkins.filter((c) => c.flag === "red").length,
    },
    pending_assessments: cycles.filter(
      (c) => c.assessment_status === "pending" || c.assessment_status === "delayed"
    ).length,
    pending_self_reviews: cycles.filter(
      (c) => c.self_review_status === "pending" || c.self_review_status === "not_started"
    ).length,
    pending_manager_reviews: cycles.filter(
      (c) => c.manager_review_status === "pending" || c.manager_review_status === "not_started"
    ).length,
    pending_progress_forms: progressForms.filter((f) => f.status === "not_started").length,
    employees_in_cycle: employees.map((emp) => {
      const cycle = cycles.find((c) => c.employee_id === emp.id);
      const manager = users.find((u) => u.id === emp.manager_id);
      return {
        employee: emp,
        cycle,
        manager,
        checkins_count: checkins.filter((c) => c.subject_user_id === emp.id).length,
        red_checkins: checkins.filter((c) => c.subject_user_id === emp.id && c.flag === "red")
          .length,
        yellow_checkins: checkins.filter(
          (c) => c.subject_user_id === emp.id && c.flag === "yellow"
        ).length,
      };
    }),
  };
}

export async function generateSummary(payload: {
  user_id: string;
  period_from: string;
  period_to: string;
  audience: "self" | "manager" | "hr" | "public";
}): Promise<Summary> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/summaries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }

  const summary: Summary = {
    id: `summary-${Date.now()}`,
    user_id: payload.user_id,
    period_from: payload.period_from,
    period_to: payload.period_to,
    audience: payload.audience,
    content: `Resumo de desenvolvimento de ${payload.period_from} a ${payload.period_to}. Progresso significativo em competências prioritárias.`,
    created_at: new Date().toISOString(),
  };

  const summaries = getStorage("summaries", []);
  summaries.push(summary);
  setStorage("summaries", summaries);
  return summary;
}

export async function getOrgDashboard(filters?: {
  from_date?: string;
  to_date?: string;
}): Promise<any> {
  if (API_BASE_URL) {
    const params = new URLSearchParams(filters as any);
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/dashboard/org?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }

  const users: User[] = getStorage("users", SEED_USERS);
  const checkins = await listCheckins();
  const periods: DevelopmentPeriod[] = getStorage("periods", SEED_PERIODS);

  return {
    total_users: users.length,
    active_periods: periods.filter((p) => p.status === "active").length,
    total_checkins: checkins.length,
    checkins_by_flag: {
      green: checkins.filter((c) => c.flag === "green").length,
      yellow: checkins.filter((c) => c.flag === "yellow").length,
      red: checkins.filter((c) => c.flag === "red").length,
    },
    checkins_by_macro: SEED_MACROS.map((macro) => ({
      macro,
      count: checkins.filter((c) => c.macro === macro).length,
    })),
    users_by_role: {
      Colaborador: users.filter((u) => u.roles.includes("Colaborador")).length,
      Gestor: users.filter((u) => u.roles.includes("Gestor")).length,
      RH: users.filter((u) => u.roles.includes("RH") || u.roles.includes("DP")).length,
      Sócio: users.filter((u) => u.roles.includes("Sócio") || u.roles.includes("GP")).length,
    },
  };
}

// ============================================================================
// AVALIAÇÃO DE REGISTROS
// ============================================================================

export async function evaluateCheckin(
  checkin_id: string,
  status: "valid" | "invalid"
): Promise<{ success: boolean; message: string; points_modifier?: number }> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/checkins/${checkin_id}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }).then((r) => r.json());
  }

  const checkins: Checkin[] = getStorage("checkins", SEED_CHECKINS);
  const checkin = checkins.find((c) => c.id === checkin_id);
  if (!checkin) return { success: false, message: "Registro não encontrado" };

  const points_modifier = status === "valid" ? 10 : -5;
  const currentUserId = getStorage("current_user_id");

  checkin.evaluation = {
    status,
    evaluated_by: currentUserId,
    evaluated_at: new Date().toISOString(),
    points_modifier,
  };

  setStorage("checkins", checkins);
  return {
    success: true,
    message: `Registro marcado como ${status === "valid" ? "válido" : "inválido"}`,
    points_modifier,
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

initializeStorage();
