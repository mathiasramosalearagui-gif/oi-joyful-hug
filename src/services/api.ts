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

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
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
