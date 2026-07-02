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
    const msg =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      "Erro de rede";
    return Promise.reject(new Error(msg));
  },
);

export default api;
