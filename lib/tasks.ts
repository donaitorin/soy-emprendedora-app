import type { TaskPriority } from "./types";

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

// Orden de las secciones en /dashboard/actions: alta primero.
export const TASK_PRIORITY_ORDER: TaskPriority[] = ["alta", "media", "baja"];

const TASK_PRIORITY_LABELS = Object.fromEntries(
  TASK_PRIORITIES.map((p) => [p.value, p.label])
) as Record<TaskPriority, string>;

export function taskPriorityLabel(priority: TaskPriority): string {
  return TASK_PRIORITY_LABELS[priority];
}
