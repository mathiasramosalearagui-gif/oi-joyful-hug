import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Search, Shield, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

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
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              activeProps={{ className: "bg-surface text-foreground" }}
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
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
          </button>
          <button
            type="button"
            aria-label="Carrinho"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/conta"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors hover:bg-surface/70"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[8rem] truncate">{user?.name}</span>
              </Link>
              <button
                type="button"
                aria-label="Sair"
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
