import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Search, Sparkles, X } from "lucide-react";

import {
  fetchAllProducts,
  fetchFeaturedProducts,
  formatBRL,
  type Product,
} from "@/lib/api";
import { ProductCard } from "@/components/product-card";

const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: fetchAllProducts,
});

const featuredQuery = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: fetchFeaturedProducts,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estação Infinita — Loja Nerd: games, HQs, colecionáveis" },
      {
        name: "description",
        content:
          "Catálogo oficial da Estação Infinita. Video games, HQs, jogos de tabuleiro, colecionáveis e roupas temáticas com entrega para todo o Brasil.",
      },
      { property: "og:title", content: "Estação Infinita — Loja Nerd" },
      {
        property: "og:description",
        content: "Games, HQs, colecionáveis e roupas temáticas em um só lugar.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(allProductsQuery),
      context.queryClient.ensureQueryData(featuredQuery),
    ]),
  component: HomePage,
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Carregando catálogo…
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="font-display text-xl font-semibold">Não foi possível carregar o catálogo</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
});

function HomePage() {
  const { data: products } = useSuspenseQuery(allProductsQuery);
  const { data: featured } = useSuspenseQuery(featuredQuery);

  const categories = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.category))).sort(),
    [products],
  );

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<"relevance" | "price-asc" | "price-desc" | "name">(
    "relevance",
  );

  const filtered = useMemo(() => {
    let list: Product[] = products;
    if (activeCategory) {
      list = list.filter((p) =>
        p.category.some((c) => c.toLowerCase() === activeCategory.toLowerCase()),
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.nameOfProduct.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.some((c) => c.toLowerCase().includes(q)),
      );
    }
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.priceOfProduct - b.priceOfProduct);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.priceOfProduct - a.priceOfProduct);
        break;
      case "name":
        list = [...list].sort((a, b) => a.nameOfProduct.localeCompare(b.nameOfProduct));
        break;
    }
    return list;
  }, [products, activeCategory, query, sort]);

  return (
    <main>
      <HeroFeatured featured={featured} />

      <section id="colecoes" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Navegar
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Coleções</h2>
          </div>
          <span className="text-sm text-muted-foreground">{categories.length} categorias</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <CategoryChip
            label="Todos"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c}
              label={c}
              active={activeCategory === c}
              onClick={() => setActiveCategory(c)}
            />
          ))}
        </div>
      </section>

      <section
        id="destaques"
        className="mx-auto mt-10 max-w-7xl px-4 sm:px-6"
        aria-label="Catálogo"
      >
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-surface/40 p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="busca-produto"
              type="search"
              placeholder="Buscar por nome, categoria ou descrição…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Ordenar"
          >
            <option value="relevance">Mais relevantes</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="name">A–Z</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}
            {activeCategory && (
              <>
                {" "}em{" "}
                <span className="font-medium text-foreground">{activeCategory}</span>
              </>
            )}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-surface/30 p-12 text-center">
            <p className="font-display text-lg font-semibold">Nada encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente outra palavra-chave ou remova os filtros.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory(null);
              }}
              className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}

function HeroFeatured({ featured }: { featured: Product[] }) {
  const hero = featured[0];
  const side = featured.slice(1, 4);

  if (!hero) return null;

  return (
    <section className="bg-radial-spotlight">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Em destaque agora
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Link
            to="/produto/$id"
            params={{ id: hero._id }}
            className="group relative col-span-2 overflow-hidden rounded-xl border border-border/60 bg-surface"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              {hero.image && (
                <img
                  src={hero.image}
                  alt={hero.nameOfProduct}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="flex flex-wrap gap-1.5">
                {hero.category.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <h1 className="mt-3 max-w-xl font-display text-2xl font-semibold sm:text-3xl">
                {hero.nameOfProduct}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground line-clamp-2">
                {hero.description}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <span className="font-display text-2xl font-semibold text-primary">
                  {formatBRL(hero.priceOfProduct)}
                </span>
                <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
                  Ver detalhes
                </span>
              </div>
            </div>
          </Link>

          <div className="flex flex-col gap-4">
            {side.map((p) => (
              <Link
                key={p._id}
                to="/produto/$id"
                params={{ id: p._id }}
                className="group relative flex flex-1 overflow-hidden rounded-xl border border-border/60 bg-surface transition-colors hover:border-primary/60"
              >
                {p.image && (
                  <div className="relative aspect-square w-32 shrink-0 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.nameOfProduct}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-center p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {p.category[0]}
                  </span>
                  <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold">
                    {p.nameOfProduct}
                  </h3>
                  <span className="mt-2 font-display text-base font-semibold text-foreground">
                    {formatBRL(p.priceOfProduct)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
