import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Estação Infinita" },
      { name: "description", content: "Crie sua conta para comprar na Estação Infinita." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    telephone: "",
    age: "",
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        cpf: form.cpf,
        telephone: form.telephone,
        age: Number(form.age),
        address: [form.address],
      });
      navigate({ to: "/conta" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cadastrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold">Criar conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Preencha seus dados para começar a comprar.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nome completo" value={form.name} onChange={(v) => set("name", v)} required full />
        <Input label="E-mail" type="email" value={form.email} onChange={(v) => set("email", v)} required />
        <Input label="Senha" type="password" value={form.password} onChange={(v) => set("password", v)} required />
        <Input label="CPF" value={form.cpf} onChange={(v) => set("cpf", v)} required />
        <Input label="Telefone" value={form.telephone} onChange={(v) => set("telephone", v)} required />
        <Input label="Idade" type="number" value={form.age} onChange={(v) => set("age", v)} required />
        <Input label="Endereço" value={form.address} onChange={(v) => set("address", v)} required full />

        {error && (
          <p className="sm:col-span-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 inline-flex h-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Cadastrando…" : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  required,
  full,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={"block " + (full ? "sm:col-span-2" : "")}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
