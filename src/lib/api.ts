/**
 * API — Estação Infinita
 * Backend Express montado com:
 *   app.use("/auth",    authRoutes)
 *   app.use("/product", productRoutes)   // GET /featured, GET /list, GET / (filtro)
 *   app.use("/users",   userRoutes)      // /me, /me/history, /me/cart[/:product], /sales/checkout/:product
 *   app.use("/admin",   adminRoutes)     // /products*, /users, /relatory, /sales
 */
import { api, TOKEN_KEY } from "@/services/api";

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

/* -------------------------- Token helpers -------------------------- */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

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

/* --------------------------- Utils ---------------------------- */

// Alguns backends Express respondem { data: ... } — normalizamos.
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function extractProducts(payload: unknown): Product[] {
  const p = payload as Record<string, unknown> | undefined;
  if (Array.isArray(payload)) return payload as Product[];
  if (!p) return [];
  return (
    (p.products as Product[]) ??
    (p.allProducts as Product[]) ??
    (p.product as Product[]) ??
    (p.data as Product[]) ??
    []
  );
}

/* --------------------------- Catálogo ---------------------------- */

export async function fetchAllProducts(): Promise<Product[]> {
  const { data } = await api.get("/product/list");
  return extractProducts(data);
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const { data } = await api.get("/product/featured");
    const list = extractProducts(data);
    if (list.length) return list;
  } catch {
    // fallback abaixo
  }
  const all = await fetchAllProducts();
  return all.filter((p) => p.main && p.available);
}

export async function filterProducts(query: Record<string, string>): Promise<Product[]> {
  const { data } = await api.get("/product", { params: query });
  return extractProducts(data);
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  try {
    return await filterProducts({ category });
  } catch {
    const all = await fetchAllProducts();
    return all.filter((p) =>
      p.category.some((c) => c.toLowerCase() === category.toLowerCase()),
    );
  }
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  // Backend público não expõe GET /product/:id — buscamos na lista.
  const all = await fetchAllProducts();
  return all.find((p) => p._id === id);
}

/* ------------------------------ Auth ---------------------------- */

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
  const { data } = await api.post("/auth/register", payload);
  return unwrap<AuthUser>(data);
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post("/auth/login", { email, password });
  return unwrap<LoginResponse>(data);
}

/* ------------------------------ Admin ---------------------------- */

export type ProductInput = Omit<Product, "_id">;

export async function adminListProducts(): Promise<Product[]> {
  const { data } = await api.get("/admin/products");
  return extractProducts(data);
}

export async function adminCreateProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post("/admin/products/new", input);
  const created = unwrap<{ product?: Product } | Product>(data);
  return ((created as { product?: Product }).product ?? (created as Product));
}

export async function adminUpdateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  await api.put(`/admin/products/${id}`, input);
}

export async function adminToggleProduct(id: string, active: boolean): Promise<void> {
  await api.patch(`/admin/products/${id}/${active ? "active" : "desactive"}`);
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}/deleted`);
}

/* ------------------------------ Util ---------------------------- */

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
