/**
 * Cliente HTTP central — Estação Infinita
 *
 * Base URL: VITE_API_BASE_URL ou http://localhost:3000 por padrão.
 * Interceptor de request injeta o JWT do localStorage no header
 *   Authorization: Bearer <token>
 * quando existente.
 */
import axios, { type AxiosInstance } from "axios";

export const TOKEN_KEY = "ei.token";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Rotas públicas do catálogo — NÃO enviar Authorization mesmo se houver token.
// Alguns middlewares do backend rejeitam/validam tokens em rotas públicas e
// acabam devolvendo 401/403, quebrando a home para usuários logados.
const PUBLIC_PATHS = [/^\/product(\/|$|\?)/];

function isPublicPath(url?: string): boolean {
  if (!url) return false;
  const path = url.startsWith("http") ? new URL(url).pathname : url.split("?")[0];
  return PUBLIC_PATHS.some((re) => re.test(path));
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token && !isPublicPath(config.url)) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const cfg = error?.config ?? {};
    const url = `${cfg.baseURL ?? ""}${cfg.url ?? ""}`;
    const status = error?.response?.status;
    const serverMsg =
      error?.response?.data?.message ?? error?.response?.data?.error;
    const base =
      serverMsg ??
      (status
        ? `HTTP ${status} em ${cfg.method?.toUpperCase() ?? "GET"} ${url}`
        : `Sem resposta do servidor em ${cfg.method?.toUpperCase() ?? "GET"} ${url} (${error?.code ?? error?.message ?? "network"}). Verifique se o backend está no ar, CORS liberado e se a rota existe.`);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[api] falha:", { url, method: cfg.method, status, code: error?.code, message: error?.message, data: error?.response?.data });
    }
    return Promise.reject(new Error(base));
  },
);

export default api;
