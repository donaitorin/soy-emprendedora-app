"use client";

import { type FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { TASK_PRIORITIES } from "@/lib/tasks";
import type { Task, TaskPriority, TaskSuggestionType } from "@/lib/types";
import Modal from "./modal";

export default function TaskModal({
  accountId,
  initialTitle = "",
  initialNotes = "",
  initialPriority = "media",
  suggestionType = null,
  conversationRef = null,
  onClose,
  onCreated,
}: {
  accountId: string;
  initialTitle?: string;
  initialNotes?: string;
  initialPriority?: TaskPriority;
  suggestionType?: TaskSuggestionType | null;
  conversationRef?: string | null;
  onClose: () => void;
  onCreated: (task: Task) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState(initialNotes);
  const [priority, setPriority] = useState<TaskPriority>(initialPriority);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Escribí la tarea.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const task = await api.post<Task>(`/accounts/${accountId}/tasks`, {
        title: title.trim(),
        notes: notes.trim() || null,
        priority,
        suggestion_type: suggestionType,
        conversation_ref: conversationRef,
      });
      onCreated(task);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo agregar la tarea");
      setLoading(false);
    }
  }

  return (
    <Modal title="Agregar tarea" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Tarea</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué necesitás hacer?"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Anotaciones</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contexto adicional (opcional)"
            rows={3}
            className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-secondary">Prioridad</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          >
            {TASK_PRIORITIES.map((option) => (
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
