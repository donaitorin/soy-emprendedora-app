"use client";

import { useEffect, useState } from "react";
import ConfirmModal from "../_components/confirm-modal";
import { api, ApiError } from "@/lib/api";
import type { Lead, LeadStage, LeadStats, User } from "@/lib/types";
import { PlusIcon } from "../_components/icons";
import KanbanBoard from "./_components/kanban-board";
import LeadsTable from "./_components/leads-table";
import NewLeadModal from "./_components/new-lead-modal";

export default function DashboardLeadsPage() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [archivingConverted, setArchivingConverted] = useState(false);
  const [confirmingArchiveConverted, setConfirmingArchiveConverted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const me = await api.get<User>("/auth/me");
        const account = me.accounts[0];
        if (!account) {
          setLoadError("No se encontró un negocio asociado a tu cuenta.");
          return;
        }

        const [board, leadStats] = await Promise.all([
          api.get<Lead[]>(`/accounts/${account.id}/leads/board`),
          api.get<LeadStats>(`/accounts/${account.id}/leads/stats`),
        ]);

        setAccountId(account.id);
        setLeads(board);
        setStats(leadStats);
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : "No se pudieron cargar las leads");
      }
    }
    load();
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }

  async function refreshStats(currentAccountId: string) {
    try {
      const leadStats = await api.get<LeadStats>(`/accounts/${currentAccountId}/leads/stats`);
      setStats(leadStats);
    } catch {
      // si falla el refresco de métricas no rompemos el resto de la pantalla
    }
  }

  function handleLeadCreated(lead: Lead) {
    setLeads((prev) => (prev ? [lead, ...prev] : [lead]));
    setShowNewLead(false);
    showToast("Lead agregada");
    if (accountId) refreshStats(accountId);
    setTableRefreshKey((k) => k + 1);
  }

  async function handleMoveStage(lead: Lead, stage: LeadStage) {
    if (!accountId) return;
    const previousStage = lead.stage;

    setLeads((prev) => (prev ? prev.map((l) => (l.id === lead.id ? { ...l, stage } : l)) : prev));

    try {
      const updated = await api.patch<Lead>(`/accounts/${accountId}/leads/${lead.id}/stage`, {
        stage,
      });
      setLeads((prev) => (prev ? prev.map((l) => (l.id === lead.id ? updated : l)) : prev));
      refreshStats(accountId);
      setTableRefreshKey((k) => k + 1);
    } catch (err) {
      setLeads((prev) =>
        prev ? prev.map((l) => (l.id === lead.id ? { ...l, stage: previousStage } : l)) : prev
      );
      showToast(err instanceof ApiError ? err.message : "No se pudo mover la lead");
    }
  }

  async function handleArchive(lead: Lead) {
    if (!accountId) return;
    setArchivingId(lead.id);
    try {
      await api.post(`/accounts/${accountId}/leads/${lead.id}/archive`, {
        reason: "not_converted",
      });
      setLeads((prev) => (prev ? prev.filter((l) => l.id !== lead.id) : prev));
      showToast(`${lead.name} archivada`);
      refreshStats(accountId);
      setTableRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "No se pudo archivar la lead");
    } finally {
      setArchivingId(null);
    }
  }

  async function handleArchiveConverted() {
    if (!accountId) return;
    setArchivingConverted(true);
    try {
      const archived = await api.post<Lead[]>(`/accounts/${accountId}/leads/archive-converted`);
      const archivedIds = new Set(archived.map((l) => l.id));
      setLeads((prev) => (prev ? prev.filter((l) => !archivedIds.has(l.id)) : prev));
      showToast(
        archived.length > 0
          ? `${archived.length} lead${archived.length === 1 ? "" : "s"} archivada${
              archived.length === 1 ? "" : "s"
            }`
          : "No había leads convertidas para archivar"
      );
      refreshStats(accountId);
      setTableRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "No se pudo archivar las leads convertidas"
      );
    } finally {
      setArchivingConverted(false);
      setConfirmingArchiveConverted(false);
    }
  }

  function handleLeadDeletedFromTable(lead: Lead) {
    setLeads((prev) => (prev ? prev.filter((l) => l.id !== lead.id) : prev));
    if (accountId) refreshStats(accountId);
  }

  if (loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  if (!leads || !stats || !accountId) {
    return <p className="text-sm text-secondary">Cargando leads…</p>;
  }

  const now = new Date();
  const convertedCount = leads.filter((lead) => lead.stage === "convertida").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-primary">Leads</h1>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setConfirmingArchiveConverted(true)}
            disabled={archivingConverted}
            className="rounded-lg border border-border bg-surface px-4 py-2.25 text-sm font-semibold text-secondary disabled:opacity-60"
          >
            {archivingConverted ? "Archivando…" : "Archivar convertidos"}
          </button>
          <button
            type="button"
            onClick={() => setShowNewLead(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.25 text-sm font-semibold text-on-accent"
          >
            <PlusIcon className="h-3.75 w-3.75" />
            Nueva lead
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Leads activas
          </div>
          <div className="mt-2 text-2xl font-black text-primary">{stats.active_count}</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Conversión
          </div>
          <div className="mt-2 text-2xl font-black text-primary">
            {stats.conversion_rate !== null
              ? `${Math.round(stats.conversion_rate * 100)}%`
              : "Sin datos"}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
            Tiempo promedio
          </div>
          <div className="mt-2 text-2xl font-black text-primary">
            {stats.avg_conversion_days !== null
              ? `${stats.avg_conversion_days.toFixed(1)} días`
              : "Sin datos"}
          </div>
        </div>
      </section>

      <KanbanBoard
        leads={leads}
        now={now}
        onMoveStage={handleMoveStage}
        onArchive={handleArchive}
        archivingId={archivingId}
      />

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-lg font-semibold text-primary">Todas las leads</h2>
        <LeadsTable
          accountId={accountId}
          refreshKey={tableRefreshKey}
          onLeadDeleted={handleLeadDeletedFromTable}
        />
      </section>

      {showNewLead && (
        <NewLeadModal
          accountId={accountId}
          onClose={() => setShowNewLead(false)}
          onCreated={handleLeadCreated}
        />
      )}

      {confirmingArchiveConverted && (
        <ConfirmModal
          title="Archivar convertidos"
          message={
            convertedCount > 0
              ? `Se van a archivar ${convertedCount} lead${convertedCount === 1 ? "" : "s"} de la columna Convertida. Van a salir del tablero, pero van a seguir contando para las métricas.`
              : "No hay leads en la columna Convertida para archivar."
          }
          confirmLabel="Archivar"
          loading={archivingConverted}
          onConfirm={handleArchiveConverted}
          onCancel={() => setConfirmingArchiveConverted(false)}
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
