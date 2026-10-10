"use client";

import { type FormEvent, useState } from "react";
import Modal from "@/app/dashboard/_components/modal";
import { api, ApiError } from "@/lib/api";
import { toIsoDate } from "@/lib/money";

export default function ExportModal({
  accountId,
  onClose,
  onExported,
}: {
  accountId: string;
  onClose: () => void;
  onExported: () => void;
}) {
  // Por defecto el rango es solo hoy: exporta los movimientos del día.
  const [from, setFrom] = useState(() => toIsoDate(new Date()));
  const [to, setTo] = useState(() => toIsoDate(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (from > to) {
      setError("La fecha de inicio no puede ser posterior a la de fin.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { blob, filename } = await api.download(
        `/accounts/${accountId}/movements/export?from=${from}&to=${to}`,
        `movimientos_${from}_${to}.xlsx`
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      onExported();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo exportar los movimientos");
      setLoading(false);
    }
  }

  return (
    <Modal title="Exportar movimientos" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-secondary">
          Se descarga un Excel con tus ingresos (en verde) y gastos (en rojo) del rango elegido.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Desde</span>
          <input
            type="date"
            required
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Hasta</span>
          <input
            type="date"
            required
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-secondary disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !from || !to}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
          >
            {loading ? "Exportando…" : "Exportar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
