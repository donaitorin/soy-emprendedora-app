"use client";

import { useState } from "react";
import Modal from "@/app/dashboard/_components/modal";
import MarkdownEditor from "./lazy-markdown-editor";

export type DiscardReason = "not_converted" | "mistake";

export const NOTE_MAX_LENGTH = 5000;

const OPTIONS: { value: DiscardReason; label: string; hint: string }[] = [
  {
    value: "not_converted",
    label: "No se logró convertir",
    hint: "Se archiva y cuenta en tus métricas de conversión.",
  },
  {
    value: "mistake",
    label: "Se creó por error",
    hint: "Se elimina y no cuenta en ninguna métrica.",
  },
];

export default function DiscardLeadModal({
  leadName,
  loading,
  onConfirm,
  onCancel,
}: {
  leadName: string;
  loading: boolean;
  onConfirm: (reason: DiscardReason, note: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<DiscardReason>("not_converted");
  const [note, setNote] = useState("");
  const tooLong = note.trim().length > NOTE_MAX_LENGTH;

  return (
    <Modal title="Descartar lead" onClose={onCancel}>
      <p className="mb-4 text-sm text-secondary">
        ¿Por qué querés descartar a <span className="font-semibold text-primary">{leadName}</span>?
      </p>

      <div className="flex flex-col gap-2">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
              reason === option.value ? "border-accent bg-accent-soft" : "border-border"
            }`}
          >
            <input
              type="radio"
              name="discard-reason"
              value={option.value}
              checked={reason === option.value}
              onChange={() => setReason(option.value)}
              className="mt-1 accent-accent"
            />
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-primary">{option.label}</span>
              <span className="text-xs text-secondary">{option.hint}</span>
            </span>
          </label>
        ))}
      </div>

      {reason === "not_converted" && (
        <div className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">
            Motivo del rechazo <span className="font-normal text-tertiary">(opcional)</span>
          </span>
          <MarkdownEditor
            value={note}
            onChange={setNote}
            placeholder="¿Por qué no se logró convertir?"
          />
          {tooLong && (
            <p className="text-sm text-danger">
              El motivo no puede superar los {NOTE_MAX_LENGTH} caracteres.
            </p>
          )}
        </div>
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
          onClick={() => onConfirm(reason, reason === "not_converted" ? note.trim() : "")}
          disabled={loading || (reason === "not_converted" && tooLong)}
          className="flex-1 rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
        >
          {loading ? "Procesando…" : "Descartar"}
        </button>
      </div>
    </Modal>
  );
}
