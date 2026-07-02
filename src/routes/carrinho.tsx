import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Trash2, ShoppingBag, CreditCard } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { fetchMyCart, removeFromCart, checkout, formatBRL, type CartItem } from "@/lib/api";
import { LAST_PURCHASE_KEY, type LastPurchase } from "@/routes/compra.sucesso";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — Estação Infinita" },
      { name: "description", content: "Revise os itens e finalize sua compra." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["me", "cart"],
    queryFn: fetchMyCart,
    enabled: isAuthenticated,
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => removeFromCart(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me", "cart"] }),
  });

  const checkoutMut = useMutation({
    mutationFn: (id: string) => checkout(id),
    onSuccess: () => {
      setMessage("Compra realizada com sucesso!");
      qc.invalidateQueries({ queryKey: ["me", "cart"] });
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const total = items.reduce(
    (s, i: CartItem) => s + (i.product?.priceOfProduct ?? 0) * (i.quantity ?? 1),
    0,
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Carrinho</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Seus itens</h1>

      {message && (
        <p className="mt-4 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          {message}
        </p>
      )}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>
      ) : error ? (
        <p className="mt-8 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {(error as Error).message}
        </p>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-surface/40 p-10 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          <Link
            to="/"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-3">
            {items.map((it, idx) => {
              const p = it.product;
              if (!p) return null;
              return (
                <li
                  key={p._id ?? idx}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface/40 p-3"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background">
                    {p.image ? (
                      <img src={p.image} alt={p.nameOfProduct} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.nameOfProduct}</p>
                    <p className="text-xs text-muted-foreground">
                      Qtd: {it.quantity ?? 1} · {formatBRL(p.priceOfProduct)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={checkoutMut.isPending}
                      onClick={() => checkoutMut.mutate(p._id)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      <CreditCard className="h-4 w-4" /> Comprar
                    </button>
                    <button
                      type="button"
                      aria-label="Remover"
                      disabled={removeMut.isPending}
                      onClick={() => removeMut.mutate(p._id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit rounded-xl border border-border/60 bg-surface/40 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Resumo</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-semibold text-primary">
                {formatBRL(total)}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              O checkout é feito por item. Clique em <strong>Comprar</strong> ao lado de cada
              produto para finalizar.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
