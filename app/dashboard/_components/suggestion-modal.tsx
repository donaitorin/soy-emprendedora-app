"use client";

import { type FormEvent, useState } from "react";
import MarkdownEditor from "@/app/dashboard/leads/_components/lazy-markdown-editor";
import { api, ApiError } from "@/lib/api";
import Modal from "./modal";

const MESSAGE_MAX_LENGTH = 5000;

export default function SuggestionModal({
  accountId,
  onClose,
}: {
  accountId: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Escribí tu sugerencia antes de enviarla.");
      return;
    }
    if (trimmed.length > MESSAGE_MAX_LENGTH) {
      setError(`La sugerencia no puede superar los ${MESSAGE_MAX_LENGTH} caracteres.`);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await api.post(`/accounts/${accountId}/suggestions`, { message: trimmed });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo enviar la sugerencia");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Modal title="Sugerencias" onClose={onClose} size="lg">
        <p className="text-sm text-secondary">
          ¡Gracias! Recibimos tu sugerencia y la vamos a leer con atención. ✦
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent"
        >
          Cerrar
        </button>
      </Modal>
    );
  }

  return (
    <Modal title="Sugerencias" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-secondary">
          Contanos qué mejorarías o qué te gustaría que hiciera la app. Podés dar formato a tu
          mensaje con los botones de arriba.
        </p>

        <MarkdownEditor
          tall
          value={message}
          onChange={setMessage}
          placeholder="Escribí tu sugerencia…"
        />

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
            {loading ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
