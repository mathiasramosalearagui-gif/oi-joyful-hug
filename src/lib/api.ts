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

// Busca recursiva pelo primeiro array dentro do payload — cobre qualquer
// aninhamento como { data: { products: [...] } } ou { result: { list: [...] } }.
function findFirstArray(payload: unknown, depth = 0): unknown[] | null {
  if (depth > 4) return null;
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return null;
  for (const v of Object.values(payload as Record<string, unknown>)) {
    const found = findFirstArray(v, depth + 1);
    if (found) return found;
  }
  return null;
}

function extractProducts(payload: unknown): Product[] {
  if (import.meta.env.DEV) console.log("[api] extractProducts payload:", payload);
  const arr = findFirstArray(payload);
  return (arr as Product[]) ?? [];
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

export async function adminListUsers(): Promise<AuthUser[]> {
  const { data } = await api.get("/admin/users");
  if (import.meta.env.DEV) console.log("[api] /admin/users payload:", data);
  return (findFirstArray(data) as AuthUser[]) ?? [];
}

export async function adminGetSales(): Promise<unknown[]> {
  const { data } = await api.get("/admin/sales");
  if (import.meta.env.DEV) console.log("[api] /admin/sales payload:", data);
  return findFirstArray(data) ?? [];
}

export async function adminGetRelatory(): Promise<unknown> {
  const { data } = await api.get("/admin/relatory");
  return unwrap<unknown>(data);
}

/* ------------------------------ Usuário logado ---------------------------- */

export interface CartItem {
  product: Product;
  quantity?: number;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get("/users/me");
  return unwrap<AuthUser>(data);
}

export async function updateMe(payload: Partial<AuthUser>): Promise<AuthUser> {
  const { data } = await api.put("/users/me", payload);
  return unwrap<AuthUser>(data);
}

export async function fetchMyHistory(): Promise<unknown[]> {
  const { data } = await api.get("/users/me/history");
  return (Array.isArray(data) ? data : (data as { history?: unknown[] })?.history) ?? [];
}

export async function fetchMyCart(): Promise<CartItem[]> {
  const { data } = await api.get("/users/me/cart");
  if (import.meta.env.DEV) console.log("[cart] /users/me/cart response:", data);

  // Localiza o array do carrinho em qualquer formato conhecido
  const d = data as Record<string, unknown> | unknown[];
  const raw: unknown[] = Array.isArray(d)
    ? d
    : ((d as any)?.cart ??
       (d as any)?.data ??
       (d as any)?.items ??
       (d as any)?.user?.cart ??
       (d as any)?.me?.cart ??
       []);

  // Sempre buscamos o catálogo para resolver preço/nome — o backend guarda
  // apenas { id, nameOfProduct, amount } no carrinho, sem priceOfProduct.
  let catalog: Product[] = [];
  try {
    catalog = await fetchAllProducts();
  } catch {
    catalog = [];
  }

  const findById = (id: string) => catalog.find((p) => p._id === id);

  return raw
    .map<CartItem | null>((it) => {
      // Caso 1: string com _id
      if (typeof it === "string") {
        const p = findById(it);
        return p ? { product: p, quantity: 1 } : null;
      }
      if (!it || typeof it !== "object") return null;
      const o = it as Record<string, any>;

      // Caso 2: { product: {...}, quantity }
      if (o.product && typeof o.product === "object") {
        return { product: o.product as Product, quantity: o.quantity ?? 1 };
      }
      // Caso 3: { product: "<id>", quantity }
      if (typeof o.product === "string") {
        const p = findById(o.product);
        return p ? { product: p, quantity: o.quantity ?? 1 } : null;
      }
      // Caso 4: { productId | _idProduct | id, quantity/amount }
      const id = o.productId ?? o._idProduct ?? o.idProduct ?? o.product_id ?? o.id ?? o._id;
      const qty = o.quantity ?? o.amount ?? 1;
      if (typeof id === "string") {
        // Se veio catálogo, prefira o produto completo; senão, monta um objeto
        // mínimo com _id garantido (o backend usa `id`, o front usa `_id`).
        const p = findById(id);
        if (p) return { product: p, quantity: qty };
        if (o.nameOfProduct) {
          return {
            product: {
              priceOfProduct: 0,
              available: true,
              category: [],
              description: "",
              observations: "",
              main: false,
              ...(o as any),
              _id: id,
              amount: 1,
              nameOfProduct: o.nameOfProduct,
            } as Product,
            quantity: qty,
          };
        }
      }
      // Caso 5: o próprio objeto já é um Product completo
      if (o.nameOfProduct && typeof o._id === "string") {
        return { product: o as unknown as Product, quantity: qty };
      }
      return null;
    })
    .filter((x): x is CartItem => !!x);
}

export async function addToCart(productId: string): Promise<void> {
  await api.patch(`/users/me/cart/${productId}`);
}

export async function removeFromCart(productId: string): Promise<void> {
  await api.delete(`/users/me/cart/${productId}`);
}

export interface CheckoutOptions {
  paymentMethod?: string;
  coupon?: string;
}

export async function checkout(
  productId: string,
  options: string | CheckoutOptions = {},
): Promise<unknown> {
  const opts: CheckoutOptions =
    typeof options === "string" ? { paymentMethod: options } : options;
  const body: Record<string, unknown> = {
    paymentMethod: opts.paymentMethod ?? "credit_card",
  };
  if (opts.coupon && opts.coupon.trim()) body.coupon = opts.coupon.trim();
  const { data } = await api.post(`/users/sales/checkout/${productId}`, body);
  return unwrap<unknown>(data);
}

/** Compra direta: adiciona no carrinho e em seguida faz o checkout. */
export async function buyNow(
  productId: string,
  options: string | CheckoutOptions = {},
): Promise<unknown> {
  try {
    await addToCart(productId);
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[buyNow] addToCart falhou, seguindo para checkout:", e);
  }
  return checkout(productId, options);
}

/* ------------------------------ Cupons (admin) ---------------------------- */

export type CouponStatus = "percentage" | "fixed";

export interface CouponInput {
  name: string;
  value: number;
  status: CouponStatus;
  active?: boolean;
}

export async function adminCreateCoupon(input: CouponInput): Promise<unknown> {
  const { data } = await api.post("/coupon/create", input);
  return unwrap<unknown>(data);
}

export async function adminUpdateCoupon(
  couponName: string,
  input: Partial<CouponInput>,
): Promise<unknown> {
  const { data } = await api.put(`/coupon/update/${encodeURIComponent(couponName)}`, input);
  return unwrap<unknown>(data);
}

export async function adminDesactiveCoupon(couponName: string): Promise<unknown> {
  const { data } = await api.patch(`/coupon/desactive/${encodeURIComponent(couponName)}`);
  return unwrap<unknown>(data);
}

export async function adminDeleteCoupon(couponName: string): Promise<unknown> {
  const { data } = await api.delete(`/coupon/delete/${encodeURIComponent(couponName)}`);
  return unwrap<unknown>(data);
}

/** Atualiza a senha do usuário logado. */
export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  await api.patch("/users/me/new/password", { oldPassword, newPassword });
}

/** Envia/atualiza a imagem de um produto (admin). */
export async function adminUploadProductImage(
  productId: string,
  file: File,
): Promise<unknown> {
  const fd = new FormData();
  fd.append("image", file);
  const { data } = await api.patch(`/image/${productId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap<unknown>(data);
}

export function formatBRL(value: number | string | null | undefined): string {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safe);
}
