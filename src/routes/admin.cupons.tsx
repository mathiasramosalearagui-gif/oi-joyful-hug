import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Ticket, Plus, Pencil, PowerOff, Trash2 } from "lucide-react";

import {
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDesactiveCoupon,
  adminDeleteCoupon,
  type CouponInput,
  type CouponStatus,
} from "@/lib/api";

export const Route = createFileRoute("/admin/cupons")({
  head: () => ({ meta: [{ title: "Cupons — Admin — Estação Infinita" }] }),
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CreateCard />
      <ManageCard />
    </div>
  );
}

function CreateCard() {
  const [form, setForm] = useState<CouponInput>({
    name: "",
    value: 10,
    status: "percentage",
    active: true,
  });
  const [msg, setMsg] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => adminCreateCoupon(form),
    onSuccess: () => {
      setMsg(`Cupom "${form.name}" criado.`);
      setForm({ name: "", value: 10, status: "percentage", active: true });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  return (
    <section className="rounded-xl border border-border/60 bg-surface/40 p-5">
      <header className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Novo cupom</h2>
      </header>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setMsg(null);
          mut.mutate();
        }}
      >
        <Field label="Nome / código">
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as CouponStatus }))
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="percentage">Porcentagem (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </Field>
          <Field label="Valor">
            <input
              type="number"
              min={0}
              step="0.01"
              required
              value={form.value}
              onChange={(e) =>
                setForm((f) => ({ ...f, value: Number(e.target.value) }))
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={form.active ?? true}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          Ativo ao criar
        </label>

        <button
          type="submit"
          disabled={mut.isPending}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {mut.isPending ? "Criando…" : "Criar cupom"}
        </button>

        {msg && (
          <p className="text-sm text-muted-foreground">{msg}</p>
        )}
      </form>
    </section>
  );
}

function ManageCard() {
  const [name, setName] = useState("");
  const [value, setValue] = useState<number | "">("");
  const [status, setStatus] = useState<CouponStatus | "">("");
  const [msg, setMsg] = useState<string | null>(null);

  const updateMut = useMutation({
    mutationFn: () => {
      const payload: Partial<CouponInput> = {};
      if (value !== "") payload.value = Number(value);
      if (status !== "") payload.status = status;
      return adminUpdateCoupon(name, payload);
    },
    onSuccess: () => setMsg(`Cupom "${name}" atualizado.`),
    onError: (e: Error) => setMsg(e.message),
  });

  const desactiveMut = useMutation({
    mutationFn: () => adminDesactiveCoupon(name),
    onSuccess: () => setMsg(`Cupom "${name}" desativado.`),
    onError: (e: Error) => setMsg(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => adminDeleteCoupon(name),
    onSuccess: () => {
      setMsg(`Cupom "${name}" removido.`);
      setName("");
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const disabled = !name.trim();

  return (
    <section className="rounded-xl border border-border/60 bg-surface/40 p-5">
      <header className="flex items-center gap-2">
        <Pencil className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold">Gerenciar cupom</h2>
      </header>
      <p className="mt-1 text-xs text-muted-foreground">
        O backend não expõe listagem — informe o nome do cupom que deseja editar.
      </p>

      <div className="mt-4 space-y-3">
        <Field label="Nome do cupom">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Novo tipo (opcional)">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CouponStatus | "")}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">— manter —</option>
              <option value="percentage">Porcentagem</option>
              <option value="fixed">Valor fixo</option>
            </select>
          </Field>
          <Field label="Novo valor (opcional)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={value}
              onChange={(e) =>
                setValue(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || updateMut.isPending}
            onClick={() => {
              setMsg(null);
              updateMut.mutate();
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Pencil className="h-4 w-4" /> Atualizar
          </button>
          <button
            type="button"
            disabled={disabled || desactiveMut.isPending}
            onClick={() => {
              setMsg(null);
              desactiveMut.mutate();
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:border-primary/60 disabled:opacity-60"
          >
            <PowerOff className="h-4 w-4" /> Desativar
          </button>
          <button
            type="button"
            disabled={disabled || deleteMut.isPending}
            onClick={() => {
              if (!confirm(`Excluir o cupom "${name}"?`)) return;
              setMsg(null);
              deleteMut.mutate();
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-destructive/60 bg-destructive/10 px-3 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </button>
        </div>

        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
