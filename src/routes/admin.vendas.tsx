import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Receipt, TrendingUp } from "lucide-react";
import { adminGetSales, adminGetRelatory, formatBRL } from "@/lib/api";

export const Route = createFileRoute("/admin/vendas")({
  component: AdminSales,
});

function AdminSales() {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["admin", "sales"],
    queryFn: adminGetSales,
  });
  const { data: relatory } = useQuery({
    queryKey: ["admin", "relatory"],
    queryFn: adminGetRelatory,
  });

  const rows = (sales as any[]).map((s) => {
    const o = s ?? {};
    const products: any[] = Array.isArray(o.products) ? o.products.filter(Boolean) : [];
    const productName =
      products.map((p) => p?.nameOfProduct).filter(Boolean).join(", ") ||
      o.product?.nameOfProduct ||
      o.productName ||
      (typeof o.product === "string" ? o.product : "") ||
      "—";
    const price = Number(
      o.totalPrice ?? o.price ?? o.product?.priceOfProduct ?? 0,
    );
    return {
      id: o._id ?? o.id ?? "—",
      product: productName,
      user: o.user?.name ?? o.user?.email ?? o.userName ?? o.idUser ?? "—",
      price: Number.isFinite(price) ? price : 0,
      date: o.createdAt ?? o.date ?? null,
    };
  });

  const total = rows.reduce((s, r) => s + (r.price || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Vendas" value={isLoading ? "…" : String(rows.length)} icon={<Receipt className="h-4 w-4" />} />
        <Stat label="Faturamento" value={isLoading ? "…" : formatBRL(total)} icon={<TrendingUp className="h-4 w-4" />} />
        <Stat
          label="Relatório"
          value={relatory ? "Disponível" : "—"}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-surface/40">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma venda registrada.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id + i} className="border-t border-border/40">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{String(r.id).slice(-8)}</td>
                <td className="px-4 py-3 font-medium">{r.product}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.user}</td>
                <td className="px-4 py-3">{formatBRL(r.price)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.date ? new Date(r.date).toLocaleString("pt-BR") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/40 p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
