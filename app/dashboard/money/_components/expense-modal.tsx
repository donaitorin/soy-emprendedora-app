"use client";

import { type FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { EXPENSE_CATEGORIES, toIsoDate } from "@/lib/money";
import type { Expense, ExpenseCategory } from "@/lib/types";
import Modal from "./modal";

export default function ExpenseModal({
  accountId,
  onClose,
  onCreated,
}: {
  accountId: string;
  onClose: () => void;
  onCreated: (expense: Expense) => void;
}) {
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState(() => toIsoDate(new Date()));
  const [category, setCategory] = useState<ExpenseCategory>("herramientas");
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
      const expense = await api.post<Expense>(`/accounts/${accountId}/expenses`, {
        amount: numericAmount,
        occurred_on: occurredOn,
        category,
      });
      onCreated(expense);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar el gasto");
      setLoading(false);
    }
  }

  return (
    <Modal title="Registrar gasto" onClose={onClose}>
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
          <span className="text-xs font-semibold text-secondary">Categoría</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          >
            {EXPENSE_CATEGORIES.map((option) => (
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
