"use client";

import Modal from "./modal";

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-secondary">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-secondary disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60 ${
            danger ? "bg-danger" : "bg-accent"
          }`}
        >
          {loading ? "Procesando…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
