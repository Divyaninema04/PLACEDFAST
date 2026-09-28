import { apiRequest } from "./api";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  careers_url: string | null;
  hq_location: string | null;
  min_cgpa: number | null;
  allowed_branches: string[] | null;
  tech_stack: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  hiring_season: string | null;
  process_steps: string[] | null;
  dsa_topics: string[] | null;
  cs_subjects: string[] | null;
  [key: string]: unknown;
};

export type ResumeSectionsResult = {
  summary: string;
  skills: string[];
  project_bullets: string[];
  achievement_bullets: string[];
  notes: string[];
};

/**
 * Add a company using live web scraping and AI placement analysis
 */
export async function fetchAndAddCompany(params: { data: { name: string } } | { name: string }): Promise<CompanyRow> {
  const payload = "data" in params ? params.data : params;
  return apiRequest<CompanyRow>("/api/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Chat with PlacementPilot AI Career Mentor
 */
export async function chatMentor(
  params: { data: { messages: ChatMessage[] } } | { messages: ChatMessage[] },
): Promise<{ reply: string }> {
  const payload = "data" in params ? params.data : params;
  return apiRequest<{ reply: string }>("/api/mentor/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Generate resume bullet points and summary tailored to a target role
 */
export async function suggestResumeSections(
  params: { data: { targetRole?: string } } | { targetRole?: string },
): Promise<ResumeSectionsResult> {
  const payload = "data" in params ? params.data : params;
  return apiRequest<ResumeSectionsResult>("/api/resume/suggest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Search and ingest verified opportunities from official live web sources
 */
export async function fetchVerifiedOpportunities(
  params: { data: { category: string; query?: string } } | { category: string; query?: string },
): Promise<{ added: number }> {
  const payload = "data" in params ? params.data : params;
  return apiRequest<{ added: number }>("/api/opportunities/fetch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
