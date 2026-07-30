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
import { Line } from "react-chartjs-2";
import { formatMoney } from "@/lib/money";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

// Idem monthly-income-chart: colores hardcodeados porque canvas no resuelve vars de Tailwind.
const ACCENT = "#be6a4e";
const BORDER = "#e7dccf";
const TEXT_TERTIARY = "#b7ab9b";

export default function HistoryChart({ data }: { data: { label: string; total: number }[] }) {
  return (
    <Line
      data={{
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "Ingresos",
            data: data.map((d) => d.total),
            borderColor: ACCENT,
            backgroundColor: ACCENT,
            tension: 0.35,
            pointRadius: 3,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<"line">) => formatMoney(ctx.parsed.y ?? 0),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: TEXT_TERTIARY, font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: BORDER },
            ticks: { color: TEXT_TERTIARY, font: { size: 11 } },
          },
        },
      }}
    />
  );
}
