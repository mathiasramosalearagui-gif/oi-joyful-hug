export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="font-display text-lg font-semibold">
              Estação<span className="text-primary">Infinita</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Loja física e digital de produtos nerds: games, HQs, colecionáveis e roupas temáticas.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground">Loja</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Catálogo</li>
              <li>Lançamentos</li>
              <li>Promoções</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground">Conta</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Entrar</li>
              <li>Pedidos</li>
              <li>Carrinho</li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-foreground">Ajuda</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Entrega</li>
              <li>Trocas</li>
              <li>Contato</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Estação Infinita — Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
