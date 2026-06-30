import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";
import type { Product } from "@/lib/api";
import { formatBRL } from "@/lib/api";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = !product.available || product.amount === 0;

  return (
    <Link
      to="/produto/$id"
      params={{ id: product._id }}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border/60 bg-surface transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_8px_30px_-12px_oklch(0.78_0.13_230/0.45)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-background">
        {product.image ? (
          <img
            src={product.image}
            alt={product.nameOfProduct}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12" />
          </div>
        )}
        {product.main && (
          <span className="absolute left-2 top-2 rounded bg-primary/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            Destaque
          </span>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="rounded border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-2 flex flex-wrap gap-1">
          {product.category.slice(0, 2).map((c) => (
            <span
              key={c}
              className="rounded bg-accent/60 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground">
          {product.nameOfProduct}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-display text-base font-semibold text-primary">
            {formatBRL(product.priceOfProduct)}
          </span>
          {product.amount > 0 && product.amount <= 10 && (
            <span className="text-[10px] font-medium text-highlight">
              {product.amount} em estoque
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
