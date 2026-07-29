"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { DashboardInsights, User } from "@/lib/types";

function formatMetric(value: number | null): string {
  return value === null || value === undefined ? "Sin datos" : value.toLocaleString("es-AR");
}

export default function DashboardPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await api.get<User>("/auth/me");
        const accountId = me.accounts[0]?.id;
        if (!accountId) {
          router.replace("/connect-meta");
          return;
        }
        const data = await api.get<DashboardInsights>(`/dashboard/${accountId}/insights`);
        setInsights(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          router.replace("/connect-meta");
          return;
        }
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar las métricas");
      }
    }
    load();
  }, [router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-danger">{error}</p>
      </main>
    );
  }

  if (!insights) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-secondary">Cargando métricas…</p>
      </main>
    );
  }

  const metrics = [
    { label: "Seguidores", value: insights.followers_count },
    { label: "Impresiones", value: insights.impressions },
    { label: "Alcance", value: insights.reach },
  ];

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header>
          <h1 className="font-serif text-2xl font-semibold text-primary">Tu Instagram</h1>
          <p className="text-sm text-secondary">
            {insights.ig_username ? `@${insights.ig_username}` : "Cuenta conectada"}
          </p>
        </header>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                {m.label}
              </div>
              <div className="mt-2 text-3xl font-black text-primary">{formatMetric(m.value)}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
