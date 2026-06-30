import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel Admin — Estação Infinita" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [loading, isAuthenticated, isAdmin, navigate]);

  if (loading || !isAdmin) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Painel</p>
          <h1 className="mt-1 font-display text-2xl font-semibold">Administração</h1>
        </div>
        <nav className="flex gap-1 text-sm">
          <AdminLink to="/admin">Visão geral</AdminLink>
          <AdminLink to="/admin/produtos">Produtos</AdminLink>
        </nav>
      </header>
      <div className="mt-6">
        <Outlet />
      </div>
    </main>
  );
}

function AdminLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      activeProps={{ className: "bg-primary text-primary-foreground" }}
      className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
    >
      {children}
    </Link>
  );
}
