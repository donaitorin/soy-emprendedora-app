"use client";

import { type FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { INCOME_SOURCES, PAYMENT_METHODS, toIsoDate } from "@/lib/money";
import type { Income, IncomeSource, PaymentMethod } from "@/lib/types";
import Modal from "@/app/dashboard/_components/modal";

export default function IncomeModal({
  accountId,
  onClose,
  onCreated,
}: {
  accountId: string;
  onClose: () => void;
  onCreated: (income: Income) => void;
}) {
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState(() => toIsoDate(new Date()));
  const [source, setSource] = useState<IncomeSource>("mentoria");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transferencia");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Ingresá un monto válido.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const income = await api.post<Income>(`/accounts/${accountId}/incomes`, {
        amount: numericAmount,
        occurred_on: occurredOn,
        source,
        payment_method: paymentMethod,
      });
      onCreated(income);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar el ingreso");
      setLoading(false);
    }
  }

  return (
    <Modal title="Registrar ingreso" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Monto</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="$0"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Fecha</span>
          <input
            type="date"
            required
            value={occurredOn}
            onChange={(e) => setOccurredOn(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Fuente</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as IncomeSource)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          >
            {INCOME_SOURCES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Método de pago</span>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          >
            {PAYMENT_METHODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
          >
            {loading ? "Registrando…" : "Registrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
