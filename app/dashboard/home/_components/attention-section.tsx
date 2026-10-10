"use client";

import type { Task } from "@/lib/types";

function AttentionIcon({ className }: { className?: string }) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Tareas de prioridad alta del día: lo que no puede esperar. Las pendientes van primero
// y las completadas quedan abajo, tachadas, con el badge "Hecha" del diseño de referencia.
export default function AttentionSection({
  tasks,
  togglingId,
  onToggle,
}: {
  tasks: Task[];
  togglingId: string | null;
  onToggle: (task: Task) => void;
}) {
  const highPriority = tasks.filter((t) => t.priority === "alta");
  const sorted = [...highPriority.filter((t) => !t.done), ...highPriority.filter((t) => t.done)];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <AttentionIcon className="h-4.75 w-4.75 text-danger" />
        <h2 className="font-serif text-lg font-semibold text-primary">Atención hoy</h2>
      </div>

      {sorted.length === 0 && (
        <p className="text-sm text-secondary">Por ahora no hay nada urgente. ✦</p>
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 rounded-xl border-l-[3px] p-4 ${
              task.done ? "border-success bg-surface-2" : "border-danger bg-danger-soft"
            }`}
          >
            <button
              type="button"
              onClick={() => onToggle(task)}
              disabled={togglingId === task.id}
              aria-label={task.done ? "Marcar como pendiente" : "Marcar como hecha"}
              className={`mt-px flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md disabled:opacity-60 ${
                task.done ? "bg-accent" : "border-2 border-border bg-surface"
              }`}
            >
              {task.done && <CheckIcon className="h-3.5 w-3.5 text-on-accent" />}
            </button>
            <div className="min-w-0 flex-1">
              <div
                className={`text-sm font-semibold ${
                  task.done ? "text-tertiary line-through" : "text-primary"
                }`}
              >
                {task.title}
              </div>
              {task.notes && !task.done && (
                <p className="mt-1 text-sm text-secondary">{task.notes}</p>
              )}
            </div>
            {task.done && (
              <span className="shrink-0 rounded-full bg-success-soft px-2.25 py-0.75 text-[11px] font-bold text-success">
                Hecha
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
