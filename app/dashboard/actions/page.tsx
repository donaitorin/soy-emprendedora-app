"use client";

import { useEffect, useState } from "react";
import TaskModal from "@/app/dashboard/_components/task-modal";
import { api, ApiError } from "@/lib/api";
import { toIsoDate } from "@/lib/money";
import { TASK_PRIORITY_ORDER, taskPriorityLabel } from "@/lib/tasks";
import type { Task, User } from "@/lib/types";
import { PlusIcon } from "../_components/icons";

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

const PRIORITY_DOT: Record<string, string> = {
  alta: "bg-danger",
  media: "bg-warning",
  baja: "bg-success",
};

export default function DashboardActionsPage() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const me = await api.get<User>("/auth/me");
        const account = me.accounts[0];
        if (!account) {
          if (!cancelled) setLoadError("No se encontró un negocio asociado a tu cuenta.");
          return;
        }

        const today = toIsoDate(new Date());
        const result = await api.get<Task[]>(`/accounts/${account.id}/tasks?date=${today}`);
        if (cancelled) return;
        setAccountId(account.id);
        setTasks(result);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "No se pudieron cargar las tareas");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  }

  function handleTaskCreated(task: Task) {
    setTasks((prev) => (prev ? [task, ...prev] : [task]));
    setShowTaskModal(false);
    showToast("Tarea agregada");
  }

  async function handleToggle(task: Task) {
    if (!accountId) return;
    const nextDone = !task.done;
    setTogglingId(task.id);
    setTasks((prev) =>
      prev ? prev.map((t) => (t.id === task.id ? { ...t, done: nextDone } : t)) : prev
    );
    try {
      const updated = await api.patch<Task>(`/accounts/${accountId}/tasks/${task.id}`, {
        done: nextDone,
      });
      setTasks((prev) => (prev ? prev.map((t) => (t.id === task.id ? updated : t)) : prev));
    } catch (err) {
      setTasks((prev) =>
        prev ? prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)) : prev
      );
      showToast(err instanceof ApiError ? err.message : "No se pudo actualizar la tarea");
    } finally {
      setTogglingId(null);
    }
  }

  if (loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  if (!accountId || !tasks) {
    return <p className="text-sm text-secondary">Cargando…</p>;
  }

  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = total > 0 && doneCount === total;

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-semibold text-primary">Acciones de hoy</h1>
        <button
          type="button"
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2.25 text-sm font-semibold text-secondary"
        >
          <PlusIcon className="h-3.75 w-3.75" />
          Agregar tarea
        </button>
      </header>

      {allDone && (
        <div className="rounded-2xl border border-accent bg-accent-soft p-6">
          <div className="font-serif text-xl font-semibold text-primary">¡Lo lograste hoy!</div>
          <p className="mt-1 text-sm text-secondary">
            Cerraste todas tus acciones del día. Descansá tranquila.
          </p>
        </div>
      )}

      {total > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary">
              Completaste{" "}
              <b>
                {doneCount} de {total}
              </b>{" "}
              tareas
            </span>
            <span className="font-bold text-accent">{pct}%</span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {total === 0 && <p className="text-sm text-secondary">No hay tareas para hoy todavía.</p>}

      {TASK_PRIORITY_ORDER.map((priority) => {
        const group = tasks.filter((t) => t.priority === priority);
        if (group.length === 0) return null;
        return (
          <div key={priority}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-2.25 w-2.25 rounded-full ${PRIORITY_DOT[priority]}`} />
              <span className="text-xs font-bold uppercase tracking-wide text-secondary">
                {taskPriorityLabel(priority)} prioridad
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {group.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3.25 rounded-xl border border-border bg-surface p-4 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(task)}
                    disabled={togglingId === task.id}
                    className={`mt-px flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md disabled:opacity-60 ${
                      task.done ? "bg-accent" : "border-2 border-border bg-transparent"
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
                    {task.notes && (
                      <div className="mt-1 text-xs text-secondary">{task.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showTaskModal && (
        <TaskModal
          accountId={accountId}
          onClose={() => setShowTaskModal(false)}
          onCreated={handleTaskCreated}
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
