import { apiRequest } from "./api";

// ----------------------------------------------------
// Profile Service
// ----------------------------------------------------
export const profileService = {
  getProfile: async () => apiRequest<Record<string, any>>("/api/profile"),
  updateProfile: async (payload: Record<string, any>) =>
    apiRequest<Record<string, any>>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

// ----------------------------------------------------
// Company Service
// ----------------------------------------------------
export const companyService = {
  getCompanies: async () => apiRequest<Record<string, any>[]>("/api/companies"),
  getCompanyBySlug: async (slug: string) =>
    apiRequest<Record<string, any>>(`/api/companies/${slug}`),
  createCompany: async (payload: Record<string, any>) =>
    apiRequest<Record<string, any>>("/api/companies", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCompany: async (id: string, payload: Record<string, any>) =>
    apiRequest<Record<string, any>>(`/api/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCompany: async (id: string) =>
    apiRequest<void>(`/api/companies/${id}`, {
      method: "DELETE",
    }),
};

// ----------------------------------------------------
// Application Service
// ----------------------------------------------------
export const applicationService = {
  getApplications: async () => apiRequest<Record<string, any>[]>("/api/applications"),
  createApplication: async (payload: Record<string, any>) =>
    apiRequest<Record<string, any>>("/api/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateApplication: async (id: string, payload: Record<string, any>) =>
    apiRequest<Record<string, any>>(`/api/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteApplication: async (id: string) =>
    apiRequest<void>(`/api/applications/${id}`, {
      method: "DELETE",
    }),
};

// ----------------------------------------------------
// Academic Service
// ----------------------------------------------------
export const academicService = {
  getSemesters: async () => apiRequest<Record<string, any>[]>("/api/academics/semesters"),
  upsertSemester: async (payload: Record<string, any>) =>
    apiRequest<Record<string, any>>("/api/academics/semesters", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteSemester: async (id: string) =>
    apiRequest<void>(`/api/academics/semesters/${id}`, {
      method: "DELETE",
    }),
  getSubjects: async () => apiRequest<Record<string, any>[]>("/api/academics/subjects"),
  createSubject: async (payload: Record<string, any>) =>
    apiRequest<Record<string, any>>("/api/academics/subjects", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSubject: async (id: string, payload: Record<string, any>) =>
    apiRequest<Record<string, any>>(`/api/academics/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSubject: async (id: string) =>
    apiRequest<void>(`/api/academics/subjects/${id}`, {
      method: "DELETE",
    }),
};

// ----------------------------------------------------
// Resume Service
// ----------------------------------------------------
export const resumeService = {
  getResumes: async () => apiRequest<Record<string, any>[]>("/api/resumes"),
  createResume: async (payload: Record<string, any>) =>
    apiRequest<Record<string, any>>("/api/resumes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  setPrimary: async (id: string) =>
    apiRequest<Record<string, any>>(`/api/resumes/${id}/primary`, {
      method: "PATCH",
    }),
  deleteResume: async (id: string) =>
    apiRequest<void>(`/api/resumes/${id}`, {
      method: "DELETE",
    }),
  getVersions: async () => apiRequest<Record<string, any>[]>("/api/resumes/versions"),
  createVersion: async (payload: Record<string, any>) =>
    apiRequest<Record<string, any>>("/api/resumes/versions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateVersion: async (id: string, payload: Record<string, any>) =>
    apiRequest<Record<string, any>>(`/api/resumes/versions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteVersion: async (id: string) =>
    apiRequest<void>(`/api/resumes/versions/${id}`, {
      method: "DELETE",
    }),
};

// ----------------------------------------------------
// Opportunity Service
// ----------------------------------------------------
export const opportunityService = {
  getOpportunities: async (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return apiRequest<Record<string, any>[]>(`/api/opportunities${qs ? `?${qs}` : ""}`);
  },
  getSavedOpportunities: async () =>
    apiRequest<Record<string, any>[]>("/api/opportunities/saved"),
  saveOpportunity: async (opportunity_id: string) =>
    apiRequest<Record<string, any>>("/api/opportunities/saved", {
      method: "POST",
      body: JSON.stringify({ opportunity_id }),
    }),
  deleteSavedOpportunity: async (id: string) =>
    apiRequest<void>(`/api/opportunities/saved/${id}`, {
      method: "DELETE",
    }),
};

// ----------------------------------------------------
// Roadmap Service
// ----------------------------------------------------
export const roadmapService = {
  getProgress: async () => apiRequest<Record<string, any>[]>("/api/roadmap"),
  upsertProgress: async (payload: Record<string, any>) =>
    apiRequest<Record<string, any>>("/api/roadmap", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
