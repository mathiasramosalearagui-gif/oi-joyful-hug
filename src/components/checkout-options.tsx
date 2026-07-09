import { CreditCard, Ticket } from "lucide-react";

export const PAYMENT_METHODS: { value: string; label: string }[] = [
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "debit_card", label: "Cartão de débito" },
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "cash", label: "Dinheiro" },
];

interface Props {
  paymentMethod: string;
  onPaymentMethodChange: (v: string) => void;
  coupon: string;
  onCouponChange: (v: string) => void;
  className?: string;
}

export function CheckoutOptionsFields({
  paymentMethod,
  onPaymentMethodChange,
  coupon,
  onCouponChange,
  className,
}: Props) {
  return (
    <div className={className ?? "space-y-3"}>
      <label className="block">
        <span className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" /> Forma de pagamento
        </span>
        <select
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Ticket className="h-3.5 w-3.5" /> Cupom (opcional)
        </span>
        <input
          value={coupon}
          onChange={(e) => onCouponChange(e.target.value)}
          placeholder="Digite o código"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm uppercase"
        />
      </label>
    </div>
  );
}
