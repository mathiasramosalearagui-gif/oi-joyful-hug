import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ImageIcon, Pencil, Plus, Power, Trash2, Upload } from "lucide-react";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminListProducts,
  adminToggleProduct,
  adminUpdateProduct,
  adminUploadProductImage,
  formatBRL,
  type Product,
  type ProductInput,
} from "@/lib/api";

export const Route = createFileRoute("/admin/produtos")({
  component: AdminProducts,
});

const empty: ProductInput = {
  nameOfProduct: "",
  priceOfProduct: 0,
  amount: 0,
  description: "",
  available: true,
  category: [],
  observations: "",
  main: false,
  image: "",
};

function AdminProducts() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminListProducts,
  });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [imaging, setImaging] = useState<Product | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "products"] });

  const createMut = useMutation({
    mutationFn: adminCreateProduct,
    onSuccess: () => {
      invalidate();
      setCreating(false);
    },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      adminUpdateProduct(id, input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
    },
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminToggleProduct(id, active),
    onSuccess: invalidate,
  });
  const deleteMut = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Produtos</h2>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-surface/40">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p._id} className="border-t border-border/40">
                <td className="px-4 py-3 font-medium">{p.nameOfProduct}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.category.join(", ")}</td>
                <td className="px-4 py-3">{formatBRL(p.priceOfProduct)}</td>
                <td className="px-4 py-3">{p.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-semibold " +
                      (p.available
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-muted/40 text-muted-foreground")
                    }
                  >
                    {p.available ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconBtn label="Editar" onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn label="Imagem" onClick={() => setImaging(p)}>
                      <ImageIcon className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label={p.available ? "Desativar" : "Ativar"}
                      onClick={() => toggleMut.mutate({ id: p._id, active: !p.available })}
                    >
                      <Power className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Excluir"
                      onClick={() => {
                        if (confirm(`Excluir "${p.nameOfProduct}"?`)) deleteMut.mutate(p._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductForm
          initial={editing ?? empty}
          submitting={createMut.isPending || updateMut.isPending}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={(input) => {
            if (editing) updateMut.mutate({ id: editing._id, input });
            else createMut.mutate(input);
          }}
        />
      )}

      {imaging && (
        <ImageUploadDialog
          product={imaging}
          onClose={() => setImaging(null)}
          onUploaded={() => {
            invalidate();
            setImaging(null);
          }}
        />
      )}
    </div>
  );
}

function ImageUploadDialog({
  product,
  onClose,
  onUploaded,
}: {
  product: Product;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Selecione uma imagem.");
      return adminUploadProductImage(product._id, file);
    },
    onSuccess: onUploaded,
  });

  function onPick(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6">
        <h3 className="font-display text-lg font-semibold">Imagem do produto</h3>
        <p className="mt-1 text-sm text-muted-foreground">{product.nameOfProduct}</p>

        <div className="mt-4 flex items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background aspect-square">
          {preview ? (
            <img src={preview} alt="Prévia" className="h-full w-full object-cover" />
          ) : product.image ? (
            <img src={product.image} alt={product.nameOfProduct} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        <label className="mt-4 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background text-sm text-muted-foreground hover:text-foreground">
          <Upload className="h-4 w-4" />
          {file ? file.name : "Selecionar imagem…"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
        </label>

        {mut.error && (
          <p className="mt-2 text-sm text-destructive">{(mut.error as Error).message}</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-border bg-background px-4 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!file || mut.isPending}
            onClick={() => mut.mutate()}
            className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {mut.isPending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
    >
      {children}
    </button>
  );
}

function ProductForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: ProductInput | Product;
  submitting: boolean;
  onSubmit: (input: ProductInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductInput>({
    nameOfProduct: initial.nameOfProduct,
    priceOfProduct: initial.priceOfProduct,
    amount: initial.amount,
    description: initial.description,
    available: initial.available,
    category: initial.category,
    observations: initial.observations,
    main: initial.main,
    image: initial.image ?? "",
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
      <form
        onSubmit={submit}
        className="grid w-full max-w-2xl grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-6 sm:grid-cols-2"
      >
        <h3 className="sm:col-span-2 font-display text-lg font-semibold">
          {("_id" in initial) ? "Editar produto" : "Novo produto"}
        </h3>

        <Field label="Nome" value={form.nameOfProduct} onChange={(v) => setForm({ ...form, nameOfProduct: v })} full required />
        <Field label="Preço (R$)" type="number" step="0.01" value={String(form.priceOfProduct)} onChange={(v) => setForm({ ...form, priceOfProduct: Number(v) })} required />
        <Field label="Estoque" type="number" value={String(form.amount)} onChange={(v) => setForm({ ...form, amount: Number(v) })} required />
        <Field label="Categorias (separadas por vírgula)" value={form.category.join(", ")} onChange={(v) => setForm({ ...form, category: v.split(",").map((s) => s.trim()).filter(Boolean) })} full />
        <Field label="Imagem (URL)" value={form.image ?? ""} onChange={(v) => setForm({ ...form, image: v })} full />
        <Field label="Descrição" value={form.description} onChange={(v) => setForm({ ...form, description: v })} full textarea />
        <Field label="Observações" value={form.observations} onChange={(v) => setForm({ ...form, observations: v })} full textarea />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
          Disponível
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.main} onChange={(e) => setForm({ ...form, main: e.target.checked })} />
          Em destaque
        </label>

        <div className="sm:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="h-9 rounded-md border border-border bg-background px-4 text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {submitting ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  required,
  full,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  required?: boolean;
  full?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className={"block " + (full ? "sm:col-span-2" : "")}>
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      ) : (
        <input
          type={type}
          step={step}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}
    </label>
  );
}
