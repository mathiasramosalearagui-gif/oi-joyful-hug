/**
 * API client — Estação Infinita
 *
 * Backend (Express + JWT) base: definida em VITE_API_BASE_URL (.env).
 * Sem essa variável, usamos mocks locais (src/lib/mock-products.ts) para
 * permitir desenvolver o front sem o backend rodando.
 *
 * Mapa de rotas usadas (todas em relação a VITE_API_BASE_URL):
 *
 *   Públicas
 *     GET  /product/featured              -> { products: Product[] }
 *     GET  /product/list                  -> { allProducts: Product[] }
 *     GET  /product?category=...          -> { product: Product[] }
 *
 *   Auth
 *     POST /auth/register                 -> { data: User }
 *     POST /auth/login                    -> { data: { user, token } }
 *
 *   Usuário (Bearer token)
 *     GET    /users/me                    -> dados do usuário logado
 *     GET    /users/me/cart               -> carrinho
 *     PATCH  /users/me/cart/:productId    -> adicionar item
 *     DELETE /users/me/cart/:productId    -> remover item
 *     GET    /users/me/history            -> histórico de pedidos
 *     POST   /users/sales/checkout/:productId -> checkout do item
 *
 *   Admin (Bearer token + role=admin)
 *     GET    /admin/products
 *     POST   /admin/products/new
 *     PUT    /admin/products/:productId
 *     PATCH  /admin/products/:productId/active
 *     PATCH  /admin/products/:productId/desactive
 *     DELETE /admin/products/:productId/deleted
 *     GET    /admin/users
 *     GET    /admin/sales
 *     GET    /admin/relatory
 */

import { mockProducts } from "./mock-products";

export interface Product {
  _id: string;
  nameOfProduct: string;
  priceOfProduct: number;
  amount: number;
  description: string;
  available: boolean;
  category: string[];
  observations: string;
  main: boolean;
  image?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  telephone?: string;
  address?: unknown[];
  cpf?: string;
  age?: number;
  role?: "user" | "admin";
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
export const USE_MOCK = !API_BASE_URL;

const TOKEN_KEY = "ei.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

interface HttpOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function http<T>(path: string, opts: HttpOptions = {}): Promise<T> {
  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL não configurada");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string; error?: string })?.message
      ?? (data as { error?: string })?.error
      ?? `API ${res.status}: ${path}`;
    throw new Error(msg);
  }
  return data as T;
}

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------- Catálogo público ---------------------------- */

export async function fetchFeaturedProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await delay();
    return mockProducts.filter((p) => p.main && p.available);
  }
  const data = await http<{ products: Product[] }>("/product/featured");
  return data.products;
}

export async function fetchAllProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await delay();
    return mockProducts;
  }
  const data = await http<{ allProducts: Product[] }>("/product/list");
  return data.allProducts;
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  if (USE_MOCK) {
    await delay();
    return mockProducts.filter((p) =>
      p.category.some((c) => c.toLowerCase() === category.toLowerCase()),
    );
  }
  const data = await http<{ product: Product[] }>(
    `/product?category=${encodeURIComponent(category)}`,
  );
  return data.product;
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const all = await fetchAllProducts();
  return all.find((p) => p._id === id);
}

/* --------------------------------- Auth ----------------------------------- */

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  cpf: string;
  telephone: string;
  age: number;
  address: string[];
}

export async function apiRegister(payload: RegisterPayload): Promise<AuthUser> {
  if (USE_MOCK) {
    await delay();
    return { _id: "mock", name: payload.name, email: payload.email, role: "user" };
  }
  const data = await http<{ data: AuthUser }>("/auth/register", {
    method: "POST",
    body: payload,
  });
  return data.data;
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    await delay();
    const isAdmin = email.toLowerCase().includes("admin");
    return {
      token: "mock.token." + btoa(JSON.stringify({ _id: "mock", role: isAdmin ? "admin" : "user" })),
      user: {
        _id: "mock",
        name: isAdmin ? "Admin Demo" : "Cliente Demo",
        email,
        role: isAdmin ? "admin" : "user",
      },
    };
  }
  const data = await http<{ data: LoginResponse }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return data.data;
}

/* --------------------------- Decodificar JWT ------------------------------ */

export interface JwtPayload {
  _id: string;
  role: "user" | "admin";
  exp?: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/* ------------------------------- Admin ------------------------------------ */

export async function adminListProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    await delay();
    return mockProducts;
  }
  const data = await http<{ products: Product[] }>("/admin/products", { auth: true });
  return data.products;
}

export type ProductInput = Omit<Product, "_id">;

export async function adminCreateProduct(input: ProductInput): Promise<Product> {
  if (USE_MOCK) {
    await delay();
    return { ...input, _id: crypto.randomUUID() };
  }
  const data = await http<{ product: Product }>("/admin/products/new", {
    method: "POST",
    auth: true,
    body: input,
  });
  return data.product;
}

export async function adminUpdateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  if (USE_MOCK) { await delay(); return; }
  await http(`/admin/products/${id}`, { method: "PUT", auth: true, body: input });
}

export async function adminToggleProduct(id: string, active: boolean): Promise<void> {
  if (USE_MOCK) { await delay(); return; }
  await http(`/admin/products/${id}/${active ? "active" : "desactive"}`, {
    method: "PATCH",
    auth: true,
  });
}

export async function adminDeleteProduct(id: string): Promise<void> {
  if (USE_MOCK) { await delay(); return; }
  await http(`/admin/products/${id}/deleted`, { method: "DELETE", auth: true });
}

/* --------------------------------- Util ----------------------------------- */

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
