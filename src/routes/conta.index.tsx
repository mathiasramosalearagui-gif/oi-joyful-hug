import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/conta/")({
  head: () => ({
    meta: [{ title: "Minha conta — Estação Infinita" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, isAuthenticated, loading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  if (!user) return null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Minha conta</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Olá, {user.name}</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Info label="E-mail" value={user.email} />
        <Info label="Perfil" value={user.role === "admin" ? "Administrador" : "Cliente"} />
        {user.telephone && <Info label="Telefone" value={user.telephone} />}
        {user.cpf && <Info label="CPF" value={user.cpf} />}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/conta/editar"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Editar meus dados
        </Link>
        <Link
          to="/conta/senha"
          className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface/70"
        >
          Alterar senha
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface/70"
          >
            Ir para painel Admin
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface/70"
        >
          Sair
        </button>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
