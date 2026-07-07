import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { UserCog, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { updateMe, type AuthUser } from "@/lib/api";

export const Route = createFileRoute("/conta/editar")({
  head: () => ({
    meta: [{ title: "Editar dados — Estação Infinita" }],
  }),
  component: EditAccountPage,
});

function EditAccountPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [cpf, setCpf] = useState("");
  const [age, setAge] = useState<string>("");
  const [address, setAddress] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setTelephone(user.telephone ?? "");
    setCpf(user.cpf ?? "");
    setAge(user.age ? String(user.age) : "");
    const addr = Array.isArray(user.address)
      ? (user.address as unknown[]).map((a) => String(a)).join(", ")
      : "";
    setAddress(addr);
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const payload: Partial<AuthUser> = {
        name,
        email,
        telephone,
        cpf,
      };
      if (age) (payload as any).age = Number(age);
      if (address.trim()) {
        (payload as any).address = address.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const updated = await updateMe(payload);
      // Atualiza cache local do usuário para refletir no header/conta
      try {
        const raw = localStorage.getItem("ei.user");
        const prev = raw ? (JSON.parse(raw) as AuthUser) : ({} as AuthUser);
        localStorage.setItem("ei.user", JSON.stringify({ ...prev, ...updated }));
      } catch {
        /* noop */
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar dados");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/conta"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Minha conta
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <UserCog className="h-5 w-5 text-primary" />
        <h1 className="font-display text-2xl font-semibold">Editar meus dados</h1>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="Nome" value={name} onChange={setName} className="sm:col-span-2" />
        <Field label="E-mail" type="email" value={email} onChange={setEmail} className="sm:col-span-2" />
        <Field label="Telefone" value={telephone} onChange={setTelephone} />
        <Field label="CPF" value={cpf} onChange={setCpf} />
        <Field label="Idade" type="number" value={age} onChange={setAge} />
        <Field
          label="Endereço (separe por vírgula)"
          value={address}
          onChange={setAddress}
          className="sm:col-span-2"
        />

        {error && (
          <p className="sm:col-span-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {success && (
          <p className="sm:col-span-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
            Dados atualizados com sucesso.
          </p>
        )}

        <div className="sm:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Salvando…" : "Salvar alterações"}
          </button>
          <Link
            to="/conta"
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface/70"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
