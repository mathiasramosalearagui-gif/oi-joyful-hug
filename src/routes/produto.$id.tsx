import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Check, Package, ShoppingCart } from "lucide-react";

import { addToCart, buyNow, fetchProductById, formatBRL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LAST_PURCHASE_KEY, type LastPurchase } from "@/routes/compra.sucesso";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: async () => {
      const p = await fetchProductById(id);
      if (!p) throw notFound();
      return p;
    },
  });

import type { Product } from "@/lib/api";

export const Route = createFileRoute("/produto/$id")({
  head: ({ loaderData }) => {
    const p = loaderData as Product | undefined;
    return {
      meta: [
        {
          title: p ? `${p.nameOfProduct} — Estação Infinita` : "Produto — Estação Infinita",
        },
        {
          name: "description",
          content: p?.description ?? "Detalhes do produto",
        },
        ...(p?.image
          ? [
              { property: "og:image", content: p.image },
              { name: "twitter:image", content: p.image },
            ]
          : []),
      ],
    };
  },
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
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const addMut = useMutation({
    mutationFn: () => addToCart(p._id),
    onSuccess: () => navigate({ to: "/carrinho" }),
  });
  const buyMut = useMutation({
    mutationFn: async () => {
      const res = (await buyNow(p._id)) as any;
      const saleId = res?._id ?? res?.sale?._id ?? res?.id;
      const payload: LastPurchase = {
        product: p,
        quantity: 1,
        total: p.priceOfProduct,
        saleId,
        date: new Date().toISOString(),
        buyerName: user?.name,
        buyerEmail: user?.email,
      };
      sessionStorage.setItem(LAST_PURCHASE_KEY, JSON.stringify(payload));
    },
    onSuccess: () => navigate({ to: "/compra/sucesso" }),
  });

  function requireAuth(fn: () => void) {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    fn();
  }


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
              disabled={soldOut || addMut.isPending}
              onClick={() => requireAuth(() => addMut.mutate())}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {addMut.isPending ? "Adicionando…" : "Adicionar ao carrinho"}
            </button>
            <button
              type="button"
              disabled={soldOut || buyMut.isPending}
              onClick={() => requireAuth(() => buyMut.mutate())}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-4 font-medium text-foreground transition-colors hover:border-primary/60 disabled:opacity-50"
            >
              {buyMut.isPending ? "Processando…" : "Comprar agora"}
            </button>
          </div>
          {(addMut.error || buyMut.error) && (
            <p className="mt-2 text-sm text-destructive">
              {(addMut.error as Error)?.message || (buyMut.error as Error)?.message}
            </p>
          )}

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
