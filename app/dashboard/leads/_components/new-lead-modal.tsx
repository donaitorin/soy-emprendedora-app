"use client";

import { type FormEvent, useState } from "react";
import Modal from "@/app/dashboard/_components/modal";
import { api, ApiError } from "@/lib/api";
import { LEAD_CHANNELS } from "@/lib/leads";
import type { Lead, LeadChannel } from "@/lib/types";

export default function NewLeadModal({
  accountId,
  onClose,
  onCreated,
}: {
  accountId: string;
  onClose: () => void;
  onCreated: (lead: Lead) => void;
}) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<LeadChannel>("instagram");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ingresá un nombre.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const lead = await api.post<Lead>(`/accounts/${accountId}/leads`, {
        name: name.trim(),
        channel,
      });
      onCreated(lead);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo agregar la lead");
      setLoading(false);
    }
  }

  return (
    <Modal title="Nueva lead" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Nombre</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la lead"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Canal de origen</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as LeadChannel)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          >
            {LEAD_CHANNELS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
          >
            {loading ? "Agregando…" : "Agregar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
