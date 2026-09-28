import { apiRequest, API_BASE_URL, getAuthToken } from "@/services/api";
import { authService } from "@/services/auth.service";

/**
 * MongoDB / REST API Compatibility Layer
 * Replaces the Supabase client seamlessly so all existing TanStack Query
 * and dashboard components interact directly with our Express + MongoDB backend.
 */

class QueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: any }> {
  private table: string;
  private op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: any = null;
  private filters: Record<string, any> = {};
  private orderBy?: { column: string; ascending: boolean };
  private limitCount?: number;
  private isSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns = "*") {
    // Columns selection can be handled backend side or pass-through
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  insert(values: any) {
    this.op = "insert";
    this.payload = values;
    return this;
  }

  update(values: any) {
    this.op = "update";
    this.payload = values;
    return this;
  }

  upsert(values: any) {
    this.op = "upsert";
    this.payload = values;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  private async execute(): Promise<{ data: T | null; error: any }> {
    try {
      const table = this.table;
      const op = this.op;

      // 1. PROFILES
      if (table === "profiles") {
        if (op === "select") {
          try {
            const profile = await apiRequest<any>("/api/profile");
            if (profile && typeof profile === "object") {
              localStorage.setItem("placementpilot_user", JSON.stringify(profile));
              return { data: profile as T, error: null };
            }
          } catch (err) {
            console.warn("[Profiles Fetch Notice]:", err);
          }
          const localUser = authService.getLocalUser();
          return { data: (localUser || null) as T, error: null };
        }
        if (op === "update" || op === "upsert") {
          try {
            const updated = await apiRequest<any>("/api/profile", {
              method: "PUT",
              body: JSON.stringify(this.payload),
            });
            if (updated && typeof updated === "object") {
              localStorage.setItem("placementpilot_user", JSON.stringify(updated));
              return { data: updated as T, error: null };
            }
          } catch (err: any) {
            console.error("[Profile Save Error]:", err);
          }
          const currentLocal = authService.getLocalUser() || {};
          const merged = { ...currentLocal, ...this.payload };
          localStorage.setItem("placementpilot_user", JSON.stringify(merged));
          return { data: merged as T, error: null };
        }
      }

      // 2. COMPANIES
      if (table === "companies") {
        if (op === "select") {
          if (this.filters.slug) {
            const c = await apiRequest(`/api/companies/${this.filters.slug}`);
            return { data: c as T, error: null };
          }
          let list = (await apiRequest<any[]>("/api/companies")) || [];
          if (this.orderBy?.column === "name") {
            list = list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          }
          return { data: list as T, error: null };
        }
        if (op === "insert") {
          const created = await apiRequest("/api/companies", {
            method: "POST",
            body: JSON.stringify(this.payload),
          });
          return { data: created as T, error: null };
        }
        if (op === "update") {
          const id = this.filters.id;
          const updated = await apiRequest(`/api/companies/${id}`, {
            method: "PUT",
            body: JSON.stringify(this.payload),
          });
          return { data: updated as T, error: null };
        }
        if (op === "delete") {
          const id = this.filters.id;
          await apiRequest(`/api/companies/${id}`, { method: "DELETE" });
          return { data: null, error: null };
        }
      }

      // 3. APPLICATIONS
      if (table === "applications") {
        if (op === "select") {
          const list = await apiRequest("/api/applications");
          return { data: list as T, error: null };
        }
        if (op === "insert") {
          const created = await apiRequest("/api/applications", {
            method: "POST",
            body: JSON.stringify(this.payload),
          });
          return { data: created as T, error: null };
        }
        if (op === "update") {
          const id = this.filters.id;
          const updated = await apiRequest(`/api/applications/${id}`, {
            method: "PUT",
            body: JSON.stringify(this.payload),
          });
          return { data: updated as T, error: null };
        }
        if (op === "delete") {
          const id = this.filters.id;
          await apiRequest(`/api/applications/${id}`, { method: "DELETE" });
          return { data: null, error: null };
        }
      }

      // 4. SEMESTERS
      if (table === "semesters") {
        if (op === "select") {
          const list = await apiRequest("/api/academics/semesters");
          return { data: list as T, error: null };
        }
        if (op === "insert" || op === "upsert") {
          const res = await apiRequest("/api/academics/semesters", {
            method: "POST",
            body: JSON.stringify(this.payload),
          });
          return { data: res as T, error: null };
        }
        if (op === "delete") {
          const id = this.filters.id;
          await apiRequest(`/api/academics/semesters/${id}`, { method: "DELETE" });
          return { data: null, error: null };
        }
      }

      // 5. SUBJECTS
      if (table === "subjects") {
        if (op === "select") {
          const list = await apiRequest("/api/academics/subjects");
          return { data: list as T, error: null };
        }
        if (op === "insert") {
          const res = await apiRequest("/api/academics/subjects", {
            method: "POST",
            body: JSON.stringify(this.payload),
          });
          return { data: res as T, error: null };
        }
        if (op === "update") {
          const id = this.filters.id;
          const res = await apiRequest(`/api/academics/subjects/${id}`, {
            method: "PUT",
            body: JSON.stringify(this.payload),
          });
          return { data: res as T, error: null };
        }
        if (op === "delete") {
          const id = this.filters.id;
          await apiRequest(`/api/academics/subjects/${id}`, { method: "DELETE" });
          return { data: null, error: null };
        }
      }

      // 6. RESUMES
      if (table === "resumes") {
        if (op === "select") {
          const list = await apiRequest("/api/resumes");
          return { data: list as T, error: null };
        }
        if (op === "insert") {
          const res = await apiRequest("/api/resumes", {
            method: "POST",
            body: JSON.stringify(this.payload),
          });
          return { data: res as T, error: null };
        }
        if (op === "update") {
          const id = this.filters.id;
          if (id && this.payload?.is_primary) {
            const res = await apiRequest(`/api/resumes/${id}/primary`, { method: "PATCH" });
            return { data: res as T, error: null };
          }
          return { data: null, error: null };
        }
        if (op === "delete") {
          const id = this.filters.id;
          await apiRequest(`/api/resumes/${id}`, { method: "DELETE" });
          return { data: null, error: null };
        }
      }

      // 7. RESUME VERSIONS
      if (table === "resume_versions") {
        if (op === "select") {
          const list = await apiRequest("/api/resumes/versions");
          return { data: list as T, error: null };
        }
        if (op === "insert") {
          const res = await apiRequest("/api/resumes/versions", {
            method: "POST",
            body: JSON.stringify(this.payload),
          });
          return { data: res as T, error: null };
        }
        if (op === "update") {
          const id = this.filters.id;
          const res = await apiRequest(`/api/resumes/versions/${id}`, {
            method: "PUT",
            body: JSON.stringify(this.payload),
          });
          return { data: res as T, error: null };
        }
        if (op === "delete") {
          const id = this.filters.id;
          await apiRequest(`/api/resumes/versions/${id}`, { method: "DELETE" });
          return { data: null, error: null };
        }
      }

      // 8. OPPORTUNITIES & SAVED
      if (table === "opportunities") {
        if (op === "select") {
          const list = await apiRequest("/api/opportunities");
          return { data: list as T, error: null };
        }
      }

      if (table === "saved_opportunities") {
        if (op === "select") {
          const list = await apiRequest("/api/opportunities/saved");
          return { data: list as T, error: null };
        }
        if (op === "insert") {
          const res = await apiRequest("/api/opportunities/saved", {
            method: "POST",
            body: JSON.stringify(this.payload),
          });
          return { data: res as T, error: null };
        }
        if (op === "delete") {
          const id = this.filters.id;
          await apiRequest(`/api/opportunities/saved/${id}`, { method: "DELETE" });
          return { data: null, error: null };
        }
      }

      // 9. ROADMAP PROGRESS
      if (table === "roadmap_progress") {
        if (op === "select") {
          const list = await apiRequest("/api/roadmap");
          return { data: list as T, error: null };
        }
        if (op === "insert" || op === "update" || op === "upsert") {
          const res = await apiRequest("/api/roadmap", {
            method: "POST",
            body: JSON.stringify(this.payload),
          });
          return { data: res as T, error: null };
        }
      }

      return { data: null, error: null };
    } catch (err: any) {
      console.error(`[API Adapter Error on ${this.table}]:`, err);
      return { data: null, error: { message: err?.message || String(err) } };
    }
  }

  then<TResult1 = { data: T | null; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  auth: {
    async getUser() {
      try {
        const profile = await apiRequest<any>("/api/profile");
        if (profile && typeof profile === "object") {
          localStorage.setItem("placementpilot_user", JSON.stringify(profile));
          return { data: { user: profile }, error: null };
        }
      } catch {}
      try {
        const user = await authService.getMe();
        if (user) return { data: { user }, error: null };
      } catch {}
      const localUser = authService.getLocalUser();
      return { data: { user: localUser }, error: null };
    },
    async getSession() {
      const token = getAuthToken();
      const user = authService.getLocalUser();
      if (!token || !user) {
        return { data: { session: null }, error: null };
      }
      return {
        data: {
          session: {
            access_token: token,
            user,
          },
        },
        error: null,
      };
    },
    async signInWithPassword(creds: { email: string; password?: string }) {
      try {
        const res = await authService.login(creds);
        return { data: res, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message || "Failed to sign in" } };
      }
    },
    async signUp(params: { email: string; password?: string; options?: { data?: { full_name?: string } } }) {
      try {
        const res = await authService.register({
          email: params.email,
          password: params.password,
          fullName: params.options?.data?.full_name,
        });
        return { data: res, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message || "Failed to register" } };
      }
    },
    async signOut() {
      authService.logout();
      return { error: null };
    },
  },

  storage: {
    from(_bucket: string) {
      return {
        async upload(path: string, file: File, _options?: Record<string, unknown>) {
          try {
            const formData = new FormData();
            formData.append("resume", file, file.name);
            formData.append("fileName", file.name);
            formData.append("label", file.name.replace(/\.pdf$/i, ""));
            formData.append("filePath", path);
            formData.append("sizeBytes", String(file.size));

            const res = await apiRequest<{ resume: any; extractedData: any }>("/api/resumes/upload", {
              method: "POST",
              body: formData,
            });

            return { data: { path, ...res }, error: null };
          } catch (err: any) {
            return { data: null, error: { message: err?.message || "Resume upload failed" } };
          }
        },
        async createSignedUrl(path: string, _expiresIn?: number) {
          const base = API_BASE_URL;
          const filename = encodeURIComponent(path.split("/").pop() || path);
          return {
            data: { signedUrl: `${base}/api/resumes/file/${filename}` },
            error: null,
          };
        },
        async remove(paths: string[]) {
          return { data: paths, error: null };
        },
        getPublicUrl(path: string) {
          const base = API_BASE_URL;
          const filename = encodeURIComponent(path.split("/").pop() || path);
          return {
            data: { publicUrl: `${base}/api/resumes/file/${filename}` },
          };
        },
      };
    },
  },

  from(table: string) {
    return new QueryBuilder(table);
  },
};
