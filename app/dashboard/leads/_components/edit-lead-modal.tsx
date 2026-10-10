"use client";

import { type FormEvent, useState } from "react";
import Modal from "@/app/dashboard/_components/modal";
import { api, ApiError } from "@/lib/api";
import { LEAD_CHANNELS } from "@/lib/leads";
import type { Lead, LeadChannel } from "@/lib/types";
import MarkdownEditor from "./lazy-markdown-editor";

const DESCRIPTION_MAX_LENGTH = 5000;

export default function EditLeadModal({
  accountId,
  lead,
  onClose,
  onSaved,
}: {
  accountId: string;
  lead: Lead;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
}) {
  const [name, setName] = useState(lead.name);
  const [channel, setChannel] = useState<LeadChannel>(lead.channel);
  const [description, setDescription] = useState(lead.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ingresá un nombre.");
      return;
    }

    if (description.trim().length > DESCRIPTION_MAX_LENGTH) {
      setError(`La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH} caracteres.`);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // `description: null` borra la descripción existente.
      const updated = await api.patch<Lead>(`/accounts/${accountId}/leads/${lead.id}`, {
        name: name.trim(),
        channel,
        description: description.trim() || null,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar la lead");
      setLoading(false);
    }
  }

  return (
    <Modal title="Editar lead" onClose={onClose}>
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

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">
            Descripción <span className="font-normal text-tertiary">(opcional)</span>
          </span>
          <MarkdownEditor
            value={description}
            onChange={setDescription}
            placeholder="Notas sobre la lead…"
          />
        </div>

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
            disabled={loading}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
