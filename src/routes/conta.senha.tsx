import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { changePassword } from "@/lib/api";

export const Route = createFileRoute("/conta/senha")({
  head: () => ({
    meta: [{ title: "Alterar senha — Estação Infinita" }],
  }),
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirm) {
      setError("A confirmação não bate com a nova senha.");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao alterar senha");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Link
        to="/conta"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Minha conta
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <h1 className="font-display text-2xl font-semibold">Alterar senha</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Informe sua senha atual e defina uma nova.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Senha atual" value={oldPassword} onChange={setOldPassword} />
        <Field label="Nova senha" value={newPassword} onChange={setNewPassword} />
        <Field label="Confirmar nova senha" value={confirm} onChange={setConfirm} />

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
            Senha alterada com sucesso.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="password"
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
