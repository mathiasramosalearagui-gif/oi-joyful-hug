import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Package, ArrowLeft, Receipt } from "lucide-react";
import { formatBRL, type Product } from "@/lib/api";

export interface LastPurchase {
  product: Product;
  quantity: number;
  total: number;
  saleId?: string;
  date: string; // ISO
  buyerName?: string;
  buyerEmail?: string;
}

export const LAST_PURCHASE_KEY = "ei.lastPurchase";

export const Route = createFileRoute("/compra/sucesso")({
  head: () => ({
    meta: [
      { title: "Compra confirmada — Estação Infinita" },
      { name: "description", content: "Detalhes da sua compra." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PurchaseSuccess,
});

function PurchaseSuccess() {
  const [data, setData] = useState<LastPurchase | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_PURCHASE_KEY);
      if (raw) setData(JSON.parse(raw) as LastPurchase);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!data) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <Receipt className="h-10 w-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">Nenhuma compra recente</h1>
        <p className="text-sm text-muted-foreground">
          Não encontramos os detalhes de uma compra recente nesta sessão.
        </p>
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Voltar ao catálogo
        </Link>
      </main>
    );
  }

  const { product: p, quantity, total, saleId, date, buyerName, buyerEmail } = data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao catálogo
      </Link>

      <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/5 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Compra confirmada
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold">Obrigado pela sua compra!</h1>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[120px_1fr]">
          <div className="flex h-30 w-30 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background">
            {p.image ? (
              <img src={p.image} alt={p.nameOfProduct} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold">{p.nameOfProduct}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {p.category?.map((c) => (
                <span
                  key={c}
                  className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
                >
                  {c}
                </span>
              ))}
            </div>
            {p.description && (
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Panel title="Resumo do pedido">
          <Row label="Produto" value={p.nameOfProduct} />
          <Row label="Quantidade" value={String(quantity)} />
          <Row label="Preço unitário" value={formatBRL(p.priceOfProduct)} />
          <Divider />
          <Row label="Total" value={formatBRL(total)} strong />
        </Panel>

        <Panel title="Detalhes da compra">
          {saleId && <Row label="Pedido" value={`#${String(saleId).slice(-8).toUpperCase()}`} />}
          <Row label="Data" value={new Date(date).toLocaleString("pt-BR")} />
          {buyerName && <Row label="Cliente" value={buyerName} />}
          {buyerEmail && <Row label="E-mail" value={buyerEmail} />}
          <Row label="Status" value="Pago" strong />
        </Panel>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Continuar comprando
        </Link>
        <Link
          to="/conta"
          className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-5 text-sm font-medium hover:border-primary/60"
        >
          Ver minha conta
        </Link>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/40 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <dl className="mt-3 space-y-2 text-sm">{children}</dl>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-display text-lg font-semibold text-primary" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}

function Divider() {
  return <div className="my-2 h-px bg-border/60" />;
}
