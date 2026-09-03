"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { weekdayShort } from "@/lib/home";
import { formatMoney } from "@/lib/money";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

// Chart.js dibuja en <canvas>, no puede resolver custom properties de Tailwind,
// por eso los colores del tema van hardcodeados acá (deben coincidir con globals.css).
const ACCENT = "#be6a4e"; // Ingresos
const SUCCESS = "#4f8a6b"; // Alcance
const WARNING = "#cc9a4d"; // Leads
const BORDER = "#e7dccf";
const TEXT_TERTIARY = "#b7ab9b";

export type WeeklyRow = {
  date: Date;
  iso: string;
  isToday: boolean;
  income: number;
  reach: number;
  leads: number;
};

type SeriesKey = "income" | "reach" | "leads";

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "income", label: "Ingresos", color: ACCENT },
  { key: "reach", label: "Alcance", color: SUCCESS },
  { key: "leads", label: "Leads", color: WARNING },
];

export default function WeeklyChart({ rows }: { rows: WeeklyRow[] }) {
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    income: true,
    reach: true,
    leads: true,
  });

  function toggle(key: SeriesKey) {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const labels = rows.map((row) => weekdayShort(row.date));

  const datasets = SERIES.filter((s) => visible[s.key]).map((s) => ({
    label: s.label,
    data: rows.map((row) => row[s.key]),
    borderColor: s.color,
    backgroundColor: s.color,
    tension: 0.35,
    pointRadius: 3,
    yAxisID: `y-${s.key}`,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => toggle(s.key)}
            className="flex items-center gap-1.75 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-secondary"
          >
            <span
              className="h-2.25 w-2.25 rounded-full"
              style={
                visible[s.key]
                  ? { background: s.color }
                  : { border: `1.5px solid ${TEXT_TERTIARY}` }
              }
            />
            {s.label}
          </button>
        ))}
      </div>

      <div className="h-52">
        <Line
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: TooltipItem<"line">) => {
                    const value = ctx.parsed.y ?? 0;
                    return ctx.dataset.label === "Ingresos"
                      ? `${ctx.dataset.label}: ${formatMoney(value)}`
                      : `${ctx.dataset.label}: ${value.toLocaleString("es-AR")}`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  font: { size: 11 },
                  color: (ctx) => (rows[ctx.index]?.isToday ? ACCENT : TEXT_TERTIARY),
                },
              },
              "y-income": { ticks: { display: false }, grid: { color: BORDER } },
              "y-reach": { display: false },
              "y-leads": { display: false },
            },
          }}
        />
      </div>
    </div>
  );
}
