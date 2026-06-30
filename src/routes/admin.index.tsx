import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminListProducts, formatBRL } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminListProducts,
  });

  const total = products.length;
  const active = products.filter((p) => p.available).length;
  const featured = products.filter((p) => p.main).length;
  const value = products.reduce((s, p) => s + p.priceOfProduct * p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Produtos" value={isLoading ? "…" : String(total)} />
        <Stat label="Ativos" value={isLoading ? "…" : String(active)} />
        <Stat label="Em destaque" value={isLoading ? "…" : String(featured)} />
        <Stat label="Valor em estoque" value={isLoading ? "…" : formatBRL(value)} />
      </div>

      <div className="rounded-xl border border-border/60 bg-surface/40 p-6">
        <h2 className="font-display text-lg font-semibold">Atalhos</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/produtos"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Gerenciar produtos
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
