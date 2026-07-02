import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { adminListUsers } from "@/lib/api";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsers,
});

function AdminUsers() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminListUsers,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">Usuários</h2>
        <span className="ml-2 text-sm text-muted-foreground">
          {isLoading ? "…" : `${users.length} cadastrados`}
        </span>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {(error as Error).message}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border/60 bg-surface/40">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3">Papel</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id} className="border-t border-border/40">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.telephone ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.cpf ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-semibold " +
                      (u.role === "admin"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/40 text-muted-foreground")
                    }
                  >
                    {u.role ?? "user"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
