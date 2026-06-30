/**
 * API client — Estação Infinita
 *
 * Backend (Express + JWT): https://github.com/mathiasramosalearagui-gif/apiExpressJWTEstacaoInfinita
 * Endpoints públicos:
 *   GET /product/featured        -> { message, products: Product[] }
 *   GET /product/list            -> { message, allProducts: Product[] }
 *   GET /product?category=...    -> { message, product: Product[] }
 *
 * Para apontar para a API real, defina VITE_API_BASE_URL no .env
 * (ex: VITE_API_BASE_URL=https://api.estacaoinfinita.com).
 * Sem essa variável, o client usa os dados mock em `mock-products.ts`.
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
  // campo opcional: a API ainda não retorna imagem, então usamos um placeholder
  image?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const USE_MOCK = !API_BASE_URL;

async function http<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// pequena latência simulada para mostrar estados de loading
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

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
  // A API atual não expõe GET /product/:id — buscamos da lista e filtramos.
  const all = await fetchAllProducts();
  return all.find((p) => p._id === id);
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
