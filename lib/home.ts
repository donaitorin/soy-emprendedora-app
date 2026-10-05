// El "Alcance" del gráfico semanal todavía no tiene una fuente de datos real definida
// (a diferencia de la tarjeta de arriba, que ya usa `reach` real de /dashboard/insights)
// — placeholder visual a propósito hasta que se defina cómo va a funcionar día a día.
export const HARDCODED_WEEKLY_REACH = [980, 1420, 1240, 1600, 2100, 760, 1100];

// % de variación de una métrica vs. el día anterior. `null` si no hay base de
// comparación (dato faltante o `previous` en 0, para evitar dividir por cero).
export function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

const WEEKDAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEKDAY_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function weekdayShort(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()];
}

export function weekdayLong(date: Date): string {
  return WEEKDAY_LONG[date.getDay()];
}

export function lastNDays(reference: Date, days: number): Date[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(reference);
    d.setDate(d.getDate() - (days - 1 - i));
    return d;
  });
}

export function hoursLabel(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "día" : "días"}`;
}
