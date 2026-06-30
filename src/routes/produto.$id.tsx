import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Check, Package, ShoppingCart } from "lucide-react";

import { fetchProductById, formatBRL } from "@/lib/api";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const p = await fetchProductById(id);
      if (!p) throw notFound();
      return p;
    },
  });

export const Route = createFileRoute("/produto/$id")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.nameOfProduct} — Estação Infinita`
          : "Produto — Estação Infinita",
      },
      {
        name: "description",
        content: loaderData?.description ?? "Detalhes do produto",
      },
      ...(loaderData?.image
        ? [
            { property: "og:image", content: loaderData.image },
            { name: "twitter:image", content: loaderData.image },
          ]
        : []),
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQuery(params.id)),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Package className="h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 font-display text-xl font-semibold">Produto não encontrado</h1>
      <Link
        to="/"
        className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Voltar ao catálogo
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      {error.message}
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(id));
  const soldOut = !p.available || p.amount === 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao catálogo
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface">
          <div className="relative aspect-square">
            {p.image ? (
              <img
                src={p.image}
                alt={p.nameOfProduct}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-1.5">
            {p.category.map((c) => (
              <span
                key={c}
                className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
              >
                {c}
              </span>
            ))}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold">{p.nameOfProduct}</h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {p.description}
          </p>

          {p.observations && (
            <p className="mt-3 rounded-md border border-border/60 bg-surface/50 p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Observações: </span>
              {p.observations}
            </p>
          )}

          <div className="mt-6 flex items-end justify-between rounded-xl border border-border/60 bg-surface p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Preço</p>
              <p className="mt-1 font-display text-3xl font-semibold text-primary">
                {formatBRL(p.priceOfProduct)}
              </p>
            </div>
            <div className="text-right">
              {soldOut ? (
                <span className="rounded border border-border bg-background px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                  Esgotado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-highlight">
                  <Check className="h-3.5 w-3.5" />
                  {p.amount} em estoque
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={soldOut}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Adicionar ao carrinho
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-4 font-medium text-foreground transition-colors hover:border-primary/60"
            >
              Comprar agora
            </button>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border/60 bg-surface/50 p-3">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Disponibilidade</dt>
              <dd className="mt-1 font-medium">{p.available ? "Em linha" : "Indisponível"}</dd>
            </div>
            <div className="rounded-lg border border-border/60 bg-surface/50 p-3">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Código</dt>
              <dd className="mt-1 font-mono text-xs">{p._id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
