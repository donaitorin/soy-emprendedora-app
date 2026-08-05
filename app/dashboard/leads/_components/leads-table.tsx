"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "@/app/dashboard/_components/confirm-modal";
import { api, ApiError } from "@/lib/api";
import { leadChannelLabel, leadStageLabel } from "@/lib/leads";
import type { Lead, LeadsPage } from "@/lib/types";

const PAGE_SIZE = 10;

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function statusLabel(lead: Lead): string {
  if (!lead.archived) return leadStageLabel(lead.stage);
  return lead.archive_reason === "converted" ? "Archivada · Convertida" : "Archivada · No convertida";
}

export default function LeadsTable({
  accountId,
  refreshKey,
  onLeadDeleted,
}: {
  accountId: string;
  refreshKey?: number;
  onLeadDeleted?: (lead: Lead) => void;
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LeadsPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);
      try {
        const result = await api.get<LeadsPage>(
          `/accounts/${accountId}/leads?page=${page}&page_size=${PAGE_SIZE}`
        );
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "No se pudieron cargar las leads");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accountId, page, refreshKey]);

  async function handleDelete(lead: Lead) {
    const wasLastOnPage = data?.items.length === 1;
    setDeletingId(lead.id);
    try {
      await api.delete(`/accounts/${accountId}/leads/${lead.id}`);
      setPendingDelete(null);
      onLeadDeleted?.(lead);

      if (wasLastOnPage && page > 1) {
        setPage((p) => p - 1);
      } else {
        setData((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((item) => item.id !== lead.id),
                total: Math.max(0, prev.total - 1),
              }
            : prev
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo borrar la lead");
    } finally {
      setDeletingId(null);
    }
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-secondary">Cargando leads…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-150 border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-tertiary">
              <th className="py-2.5 pr-4 font-semibold">Fecha</th>
              <th className="py-2.5 pr-4 font-semibold">Nombre</th>
              <th className="py-2.5 pr-4 font-semibold">Canal</th>
              <th className="py-2.5 pr-4 font-semibold">Estado</th>
              <th className="py-2.5 pr-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-secondary">
                  Todavía no hay leads registradas.
                </td>
              </tr>
            )}
            {data.items.map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0">
                <td className="py-3 pr-4 text-primary">{lead.created_at.slice(0, 10)}</td>
                <td className="py-3 pr-4 font-semibold text-primary">{lead.name}</td>
                <td className="py-3 pr-4 text-secondary">{leadChannelLabel(lead.channel)}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      lead.archived
                        ? lead.archive_reason === "converted"
                          ? "bg-success-soft text-success"
                          : "bg-danger-soft text-danger"
                        : "bg-surface-2 text-secondary"
                    }`}
                  >
                    {statusLabel(lead)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    onClick={() => setPendingDelete(lead)}
                    aria-label="Borrar lead"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-2 hover:text-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.total_pages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-secondary">
          <span>
            Página {data.page} de {data.total_pages} · {data.total} leads
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="rounded-lg border border-border px-3 py-1.5 font-semibold disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Borrar lead"
          message={`¿Seguro que querés borrar a ${pendingDelete.name}? Esta acción no se puede deshacer.`}
          confirmLabel="Borrar"
          loading={deletingId === pendingDelete.id}
          onConfirm={() => handleDelete(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
