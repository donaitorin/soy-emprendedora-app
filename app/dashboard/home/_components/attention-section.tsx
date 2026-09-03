"use client";

import { hoursLabel } from "@/lib/home";
import type { PostingStatus, UnansweredConversation } from "@/lib/types";

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

export default function AttentionSection({
  postingStatus,
  unanswered,
  unansweredError,
  hasPostingTaskToday,
  respondedConversationRefs,
  onCreatePostingTask,
  onCreateConversationTask,
}: {
  postingStatus: PostingStatus | null;
  unanswered: UnansweredConversation[] | null;
  unansweredError: boolean;
  hasPostingTaskToday: boolean;
  respondedConversationRefs: Set<string>;
  onCreatePostingTask: () => void;
  onCreateConversationTask: (conversation: UnansweredConversation) => void;
}) {
  const showPostingAlert =
    !hasPostingTaskToday &&
    postingStatus !== null &&
    (postingStatus.days_since_last_post === null || postingStatus.days_since_last_post >= 1);

  // `unanswered` en null significa "todavía no sabemos" — a diferencia del resto de la
  // API, este endpoint puede tardar hasta 60s (ver frontend-integration.md), así que no
  // podemos tratar "sin datos todavía" igual que "revisamos y no hay nada".
  const unansweredLoading = unanswered === null;
  const pendingConversations = unanswered
    ? unanswered.filter((c) => !respondedConversationRefs.has(c.conversation_id))
    : [];
  const showUnansweredAlerts =
    !unansweredLoading && !unansweredError && pendingConversations.length > 0;

  const allClear =
    !showPostingAlert && !unansweredLoading && !unansweredError && !showUnansweredAlerts;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <AttentionIcon className="h-4.75 w-4.75 text-danger" />
        <h2 className="font-serif text-lg font-semibold text-primary">Atención hoy</h2>
      </div>

      {allClear && <p className="text-sm text-secondary">Por ahora no hay nada urgente. ✦</p>}

      {showPostingAlert && postingStatus && (
        <div className="mb-3 rounded-xl border-l-[3px] border-warning bg-warning-soft p-4">
          <div className="text-sm font-semibold text-primary">
            {postingStatus.days_since_last_post === null
              ? "Todavía no publicaste contenido"
              : `Llevás ${postingStatus.days_since_last_post} ${
                  postingStatus.days_since_last_post === 1 ? "día" : "días"
                } sin publicar`}
          </div>
          <p className="mt-1 text-sm text-secondary">
            Publicar algo hoy ayuda a mantener el alcance de tu cuenta.
          </p>
          <button
            type="button"
            onClick={onCreatePostingTask}
            className="mt-3 text-sm font-semibold text-accent"
          >
            Crear tarea →
          </button>
        </div>
      )}

      {unansweredLoading && (
        <p className="text-sm text-tertiary">
          Revisando conversaciones recientes de Instagram… puede tardar un momento.
        </p>
      )}

      {!unansweredLoading && unansweredError && (
        <p className="text-sm text-tertiary">
          No pudimos revisar tus conversaciones de Instagram en este momento.
        </p>
      )}

      {showUnansweredAlerts && (
        <div className="flex flex-col gap-3">
          {pendingConversations.map((conversation) => (
            <div
              key={conversation.conversation_id}
              className="rounded-xl border-l-[3px] border-danger bg-danger-soft p-4"
            >
              <div className="text-sm font-semibold text-primary">
                {conversation.contact_name} lleva{" "}
                {hoursLabel(conversation.hours_since_last_message)} sin respuesta
              </div>
              <p className="mt-1 text-sm text-secondary">
                Un mensaje hoy puede reactivar la conversación.
              </p>
              <button
                type="button"
                onClick={() => onCreateConversationTask(conversation)}
                className="mt-3 text-sm font-semibold text-accent"
              >
                Crear tarea →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
