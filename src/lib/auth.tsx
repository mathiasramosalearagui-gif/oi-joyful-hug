import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  apiLogin,
  apiRegister,
  decodeJwt,
  getToken,
  setToken,
  type AuthUser,
  type RegisterPayload,
} from "./api";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);
const USER_KEY = "ei.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const raw = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
    if (token && raw) {
      try {
        const parsed = JSON.parse(raw) as AuthUser;
        const claims = decodeJwt(token);
        if (claims?.exp && claims.exp * 1000 < Date.now()) {
          setToken(null);
          localStorage.removeItem(USER_KEY);
        } else {
          setUser({ ...parsed, role: claims?.role ?? parsed.role });
        }
      } catch {
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: u } = await apiLogin(email, password);
    setToken(token);
    const claims = decodeJwt(token);
    const merged: AuthUser = { ...u, role: claims?.role ?? u.role ?? "user" };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    setUser(merged);
    return merged;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await apiRegister(payload);
    await login(payload.email, payload.password);
  }, [login]);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
    login,
    register,
    logout,
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
