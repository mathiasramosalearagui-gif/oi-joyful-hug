import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, User } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-bold">
            EI
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Estação<span className="text-primary">Infinita</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-surface text-foreground" }}
          >
            Catálogo
          </Link>
          <a
            href="#destaques"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            Destaques
          </a>
          <a
            href="#colecoes"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            Coleções
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Buscar"
            className="hidden sm:inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => {
              document.getElementById("busca-produto")?.focus();
              document.getElementById("busca-produto")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <Search className="h-4 w-4" />
            <span>Buscar produtos…</span>
            <kbd className="ml-6 rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              /
            </kbd>
          </button>
          <button
            type="button"
            aria-label="Carrinho"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Conta"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Entrar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
