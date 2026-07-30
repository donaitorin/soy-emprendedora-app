"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  formatMoney,
  incomeBySource,
  monthlyHistory,
  monthlyIncomeByDay,
  monthsAgoStart,
  toIsoDate,
  todayTotals,
} from "@/lib/money";
import type { Expense, Income, User } from "@/lib/types";
import ExpenseModal from "./_components/expense-modal";
import HistoryChart from "./_components/history-chart";
import IncomeModal from "./_components/income-modal";
import MonthlyIncomeChart from "./_components/monthly-income-chart";
import SourceBreakdown from "./_components/source-breakdown";

type ModalKind = "income" | "expense" | null;

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

export default function DashboardMoneyPage() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [incomes, setIncomes] = useState<Income[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await api.get<User>("/auth/me");
        const account = me.accounts[0];
        if (!account) {
          setLoadError("No se encontró un negocio asociado a tu cuenta.");
          return;
        }

        const now = new Date();
        const from = toIsoDate(monthsAgoStart(now, 5));
        const to = toIsoDate(now);

        const [incomeData, expenseData] = await Promise.all([
          api.get<Income[]>(`/accounts/${account.id}/incomes?from=${from}&to=${to}`),
          api.get<Expense[]>(`/accounts/${account.id}/expenses?from=${from}&to=${to}`),
        ]);

        setAccountId(account.id);
        setIncomes(incomeData);
        setExpenses(expenseData);
      } catch (err) {
        setLoadError(
          err instanceof ApiError ? err.message : "No se pudieron cargar los movimientos"
        );
      }
    }
    load();
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }

  function handleIncomeCreated(income: Income) {
    setIncomes((prev) => (prev ? [income, ...prev] : [income]));
    setModal(null);
    showToast(`Ingreso registrado: ${formatMoney(income.amount)}`);
  }

  function handleExpenseCreated(expense: Expense) {
    setExpenses((prev) => (prev ? [expense, ...prev] : [expense]));
    setModal(null);
    showToast(`Gasto registrado: ${formatMoney(expense.amount)}`);
  }

  if (loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  if (!incomes || !expenses || !accountId) {
    return <p className="text-sm text-secondary">Cargando movimientos…</p>;
  }

  const now = new Date();
  const { income: todayIncome, expense: todayExpense, result } = todayTotals(incomes, expenses, now);
  const dailyIncome = monthlyIncomeByDay(incomes, now);
  const sourceBreakdown = incomeBySource(incomes, now);
  const history = monthlyHistory(incomes, now);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-primary">Dinero</h1>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setModal("income")}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.25 text-sm font-semibold text-on-accent"
          >
            <PlusIcon className="h-3.75 w-3.75" />
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => setModal("expense")}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2.25 text-sm font-semibold text-secondary"
          >
            <PlusIcon className="h-3.75 w-3.75" />
            Gasto
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Ingresos hoy
          </div>
          <div className="mt-2 text-2xl font-black text-success">{formatMoney(todayIncome)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Gastos hoy
          </div>
          <div className="mt-2 text-2xl font-black text-primary">{formatMoney(todayExpense)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Resultado del día
          </div>
          <div className={`mt-2 text-2xl font-black ${result >= 0 ? "text-success" : "text-danger"}`}>
            {result >= 0 ? "+" : "−"}
            {formatMoney(Math.abs(result))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-primary">Ingresos del mes</h2>
          <div className="h-40">
            <MonthlyIncomeChart data={dailyIncome} />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-primary">Por fuente</h2>
          <SourceBreakdown items={sourceBreakdown} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-lg font-semibold text-primary">
          Histórico · últimos 6 meses
        </h2>
        <div className="h-40">
          <HistoryChart data={history} />
        </div>
      </section>

      {modal === "income" && (
        <IncomeModal
          accountId={accountId}
          onClose={() => setModal(null)}
          onCreated={handleIncomeCreated}
        />
      )}
      {modal === "expense" && (
        <ExpenseModal
          accountId={accountId}
          onClose={() => setModal(null)}
          onCreated={handleExpenseCreated}
        />
      )}

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-60 -translate-x-1/2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
