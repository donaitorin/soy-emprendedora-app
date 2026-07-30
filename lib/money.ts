import type {
  Expense,
  ExpenseCategory,
  Income,
  IncomeSource,
  Movement,
  PaymentMethod,
} from "./types";

export const INCOME_SOURCES: { value: IncomeSource; label: string }[] = [
  { value: "mentoria", label: "Mentoría 1:1" },
  { value: "comunidad", label: "Comunidad Soy Empresaria" },
  { value: "claridad", label: "Sesión de Claridad" },
  { value: "producto", label: "Producto digital" },
  { value: "otro", label: "Otro" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "stripe", label: "Stripe" },
  { value: "mercadopago", label: "MercadoPago" },
  { value: "paypal", label: "PayPal" },
  { value: "efectivo", label: "Efectivo" },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "herramientas", label: "Herramientas / Software" },
  { value: "publicidad", label: "Publicidad" },
  { value: "educacion", label: "Educación" },
  { value: "servicios", label: "Servicios externos" },
  { value: "otro", label: "Otro" },
];

export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-AR")}`;
}

const INCOME_SOURCE_LABELS = Object.fromEntries(
  INCOME_SOURCES.map((s) => [s.value, s.label])
) as Record<IncomeSource, string>;

const PAYMENT_METHOD_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((s) => [s.value, s.label])
) as Record<PaymentMethod, string>;

const EXPENSE_CATEGORY_LABELS = Object.fromEntries(
  EXPENSE_CATEGORIES.map((s) => [s.value, s.label])
) as Record<ExpenseCategory, string>;

export function movementDetailLabel(movement: Movement): string {
  if (movement.type === "income" && movement.source) {
    const sourceLabel = INCOME_SOURCE_LABELS[movement.source];
    const paymentLabel = movement.payment_method
      ? PAYMENT_METHOD_LABELS[movement.payment_method]
      : null;
    return paymentLabel ? `${sourceLabel} · ${paymentLabel}` : sourceLabel;
  }
  if (movement.type === "expense" && movement.category) {
    return EXPENSE_CATEGORY_LABELS[movement.category];
  }
  return "—";
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthsAgoStart(date: Date, monthsBack: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - monthsBack, 1);
}

// El backend serializa `amount` como string (ej. "800.00") en vez de number —
// confirmado contra la API real, aunque el contrato documentado en
// frontend-integration.md lo muestra como number. Coercionamos acá para no romper
// las sumas mientras eso se corrige del lado del backend.
function coerceAmount(item: { amount: number }): number {
  const raw = item.amount as unknown;
  if (typeof raw === "number" && !Number.isNaN(raw)) {
    return raw;
  }

  const parsed = typeof raw === "string" ? Number(raw) : NaN;
  if (Number.isNaN(parsed)) {
    console.error("[money] item con amount inválido, se ignora en los totales:", item);
    return 0;
  }

  return parsed;
}

function sumAmount(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + coerceAmount(item), 0);
}

export function sumByDate<T extends { occurred_on: string; amount: number }>(
  items: T[],
  isoDate: string
): number {
  return sumAmount(items.filter((item) => item.occurred_on === isoDate));
}

function isSameMonth(isoDate: string, reference: Date): boolean {
  const [year, month] = isoDate.split("-").map(Number);
  return year === reference.getFullYear() && month === reference.getMonth() + 1;
}

export function monthlyIncomeByDay(
  incomes: Income[],
  reference: Date
): { day: number; total: number }[] {
  const daysElapsed = reference.getDate();
  return Array.from({ length: daysElapsed }, (_, i) => {
    const day = i + 1;
    const iso = toIsoDate(new Date(reference.getFullYear(), reference.getMonth(), day));
    return { day, total: sumByDate(incomes, iso) };
  });
}

export function incomeBySource(
  incomes: Income[],
  reference: Date
): { source: IncomeSource; label: string; amount: number; percentage: number }[] {
  const thisMonth = incomes.filter((income) => isSameMonth(income.occurred_on, reference));
  const total = sumAmount(thisMonth);

  const bySource = new Map<IncomeSource, number>();
  for (const income of thisMonth) {
    bySource.set(income.source, (bySource.get(income.source) ?? 0) + coerceAmount(income));
  }

  return INCOME_SOURCES.map(({ value, label }) => {
    const amount = bySource.get(value) ?? 0;
    return {
      source: value,
      label,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    };
  })
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function monthlyHistory(
  incomes: Income[],
  reference: Date,
  monthsBack = 6
): { label: string; total: number }[] {
  const months = Array.from({ length: monthsBack }, (_, i) => {
    const monthDate = new Date(reference.getFullYear(), reference.getMonth() - (monthsBack - 1 - i), 1);
    return { year: monthDate.getFullYear(), month: monthDate.getMonth() };
  });

  return months.map(({ year, month }) => {
    const total = sumAmount(
      incomes.filter((income) => {
        const [y, m] = income.occurred_on.split("-").map(Number);
        return y === year && m === month + 1;
      })
    );
    return { label: MONTH_LABELS[month], total };
  });
}

export function todayTotals(
  incomes: Income[],
  expenses: Expense[],
  reference: Date
): { income: number; expense: number; result: number } {
  const todayIso = toIsoDate(reference);
  const income = sumByDate(incomes, todayIso);
  const expense = sumByDate(expenses, todayIso);
  return { income, expense, result: income - expense };
}
