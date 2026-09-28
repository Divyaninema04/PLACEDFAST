import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  name?: string;
  full_name?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  college?: string;
  branch?: string;
  degree?: string;
  course?: string;
  year_of_study?: number;
  cgpa?: number;
  skills?: string[];
  achievements?: string[];
  dream_companies?: string[];
  preferred_roles?: string[];
  career_interests?: string[];
  current_semester?: number;
  state?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const USER_STORAGE_KEY = "placementpilot_user";

export const authService = {
  async register(data: {
    email: string;
    password?: string;
    name?: string;
    fullName?: string;
    role?: string;
    college?: string;
    branch?: string;
  }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res?.token) {
      setAuthToken(res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    }
    return res;
  },

  async login(credentials: { email: string; password?: string }): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res?.token) {
      setAuthToken(res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    }
    return res;
  },

  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
    if (res?.token) {
      setAuthToken(res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    }
    return res;
  },

  async getMe(): Promise<AuthUser | null> {
    const token = getAuthToken();
    if (!token) {
      return this.getLocalUser();
    }
    try {
      const user = await apiRequest<AuthUser>("/api/auth/me");
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return user;
      }
    } catch {
      // Fall through to cached local user
    }
    return this.getLocalUser();
  },

  getLocalUser(): AuthUser | null {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return null;
  },

  logout(): void {
    removeAuthToken();
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(getAuthToken());
  },
};
