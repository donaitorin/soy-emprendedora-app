"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatMoney } from "@/lib/money";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Chart.js dibuja en <canvas>, no puede resolver custom properties de Tailwind,
// por eso los colores del tema van hardcodeados acá (deben coincidir con globals.css).
const ACCENT = "#be6a4e";
const BORDER = "#e7dccf";
const TEXT_TERTIARY = "#b7ab9b";

export default function MonthlyIncomeChart({
  data,
}: {
  data: { day: number; total: number }[];
}) {
  return (
    <Bar
      data={{
        labels: data.map((d) => String(d.day)),
        datasets: [
          {
            label: "Ingresos",
            data: data.map((d) => d.total),
            backgroundColor: ACCENT,
            borderRadius: 4,
            maxBarThickness: 22,
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
              label: (ctx: TooltipItem<"bar">) => formatMoney(ctx.parsed.y ?? 0),
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
