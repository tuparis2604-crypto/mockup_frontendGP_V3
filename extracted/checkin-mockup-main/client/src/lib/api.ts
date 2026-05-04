/**
 * API Service Layer
 * Modo MOCK com localStorage para desenvolvimento
 * Pronto para integrar com n8n (basta trocar API_BASE_URL)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""; // Vazio = modo MOCK

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

const ROLE_HIERARCHY: Record<string, number> = {
  "Sócio": 4,
  "RH": 3,
  "Gestor": 2,
  "Colaborador": 1,
};

export function getHighestRole(roles: string[]): string {
  return roles.reduce((highest, current) => {
    const currentRank = ROLE_HIERARCHY[current] || 0;
    const highestRank = ROLE_HIERARCHY[highest] || 0;
    return currentRank > highestRank ? current : highest;
  }, "Colaborador");
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: ("Colaborador" | "Gestor" | "RH" | "Sócio")[];
  faixa: "Ciclo I" | "Ciclo II" | "Ciclo III";
  manager_id?: string;
  primary_macros: string[];
  created_at: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

// Flag do registro: verde = positivo, amarelo = atenção, vermelho = crítico
export type RecordFlag = "green" | "yellow" | "red";

// Status do registro: rascunho, agrupado aguardando publicação, publicado
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

// Alias para uso semântico nos novos contextos
export type DevelopmentRecord = Checkin;

// ============================================================================
// PERÍODO DE DESENVOLVIMENTO
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
// DADOS SEED (MOCK)
// ============================================================================

const SEED_USERS: User[] = [
  {
    id: "user-1",
    name: "João",
    email: "joao@company.com",
    roles: ["RH"],
    faixa: "Ciclo III",
    primary_macros: ["Gestão de Pessoas", "Comunicação"],
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    name: "Maria",
    email: "maria@company.com",
    roles: ["Sócio"],
    faixa: "Ciclo III",
    primary_macros: ["Visão Estratégica", "Liderança"],
    created_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "user-3",
    name: "Carlos",
    email: "carlos@company.com",
    roles: ["Gestor"],
    faixa: "Ciclo II",
    manager_id: "user-2",
    primary_macros: ["Liderança", "Comunicação"],
    created_at: "2025-01-05T10:00:00Z",
  },
  {
    id: "user-4",
    name: "Ana",
    email: "ana@company.com",
    roles: ["Colaborador"],
    faixa: "Ciclo II",
    manager_id: "user-3",
    primary_macros: ["Comunicação", "Trabalho em Equipe"],
    created_at: "2024-12-01T10:00:00Z",
  },
  {
    id: "user-5",
    name: "Pedro",
    email: "pedro@company.com",
    roles: ["Colaborador"],
    faixa: "Ciclo I",
    manager_id: "user-3",
    primary_macros: ["Resolução de Problemas", "Inovação"],
    created_at: "2024-11-01T10:00:00Z",
  },
  {
    id: "user-6",
    name: "Sofia",
    email: "sofia@company.com",
    roles: ["Colaborador"],
    faixa: "Ciclo I",
    manager_id: "user-3",
    primary_macros: ["Trabalho em Equipe", "Comunicação"],
    created_at: "2024-11-15T10:00:00Z",
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

// Macro-goals do período
const SEED_MACRO_GOALS: MacroGoal[] = [
  {
    id: "goal-1",
    period_id: "period-1",
    macro: "Liderança",
    description: "Desenvolver liderança situacional, conduzindo reuniões e processos de forma mais estruturada.",
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
    conclusions: "Alinhamento sobre o foco do período: desenvolvimento de liderança com ênfase em comunicação estratégica. Colaborador demonstrou clareza sobre os desafios e disposição para mudança.",
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
    flag: "green",
    macro: "Liderança",
    text: "Conduziu reunião de retrospectiva do time de forma estruturada, com plano de ação claro ao final.",
    visibility: "visible",
    status: "published",
    published_at: "2026-02-12T09:00:00Z",
    attachments: [],
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
  if (!getStorage("intermediate_meetings")) setStorage("intermediate_meetings", SEED_INTERMEDIATE_MEETINGS);
  if (!getStorage("record_groups")) setStorage("record_groups", []);
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

// ============================================================================
// MACROS ENDPOINTS
// ============================================================================

export async function getMacros(): Promise<string[]> {
  if (API_BASE_URL) return fetch(`${API_BASE_URL}/macros`).then((r) => r.json());
  return getStorage("macros", SEED_MACROS);
}

// ============================================================================
// PERÍODOS DE DESENVOLVIMENTO
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
// ASSESSMENT
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
// KICKOFF / REUNIÃO INICIAL
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
// REUNIÕES INTERMEDIÁRIAS
// ============================================================================

export async function getIntermediateMeetings(periodId: string): Promise<IntermediateMeeting[]> {
  if (API_BASE_URL) {
    const token = getStorage("auth_token");
    return fetch(`${API_BASE_URL}/intermediate-meetings?period_id=${periodId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
  }
  const meetings: IntermediateMeeting[] = getStorage("intermediate_meetings", SEED_INTERMEDIATE_MEETINGS);
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

  return {
    user,
    checkins,
    period,
    stats: {
      total_checkins: checkins.length,
      green_checkins: checkins.filter((c) => c.flag === "green").length,
      yellow_checkins: checkins.filter((c) => c.flag === "yellow").length,
      red_checkins: checkins.filter((c) => c.flag === "red").length,
      draft_checkins: checkins.filter((c) => c.status === "draft").length,
      pending_meeting_requests: checkins.filter((c) => c.meeting_request?.status === "pending").length,
    },
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

export async function getOrgDashboard(filters?: { from_date?: string; to_date?: string }): Promise<any> {
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
      RH: users.filter((u) => u.roles.includes("RH")).length,
      Sócio: users.filter((u) => u.roles.includes("Sócio")).length,
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
