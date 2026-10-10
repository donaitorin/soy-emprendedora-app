"use client";

import { useState } from "react";
import Modal from "@/app/dashboard/_components/modal";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/leads";

export default function ScheduleLeadModal({
  leadName,
  scheduledAt,
  loading,
  onSave,
  onCancel,
}: {
  leadName: string;
  scheduledAt: string | null;
  loading: boolean;
  onSave: (isoDatetime: string | null) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(toDatetimeLocalValue(scheduledAt));

  return (
    <Modal title="Agendar" onClose={onCancel}>
      <p className="mb-4 text-sm text-secondary">
        Elegí fecha y hora para <span className="font-semibold text-primary">{leadName}</span>.
      </p>

      <input
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
      />

      {scheduledAt && (
        <button
          type="button"
          onClick={() => onSave(null)}
          disabled={loading}
          className="mt-3 text-sm font-semibold text-danger disabled:opacity-60"
        >
          Quitar agenda
        </button>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-secondary disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onSave(fromDatetimeLocalValue(value))}
          disabled={loading || !value}
          className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}
