"use client";

import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import {
  daysLabel,
  daysSince,
  formatSchedule,
  isStalling,
  leadChannelDot,
  leadChannelLabel,
} from "@/lib/leads";
import type { Lead } from "@/lib/types";
import DiscardLeadModal, { type DiscardReason } from "./discard-lead-modal";
import LeadDescriptionModal from "./lead-description-modal";
import ScheduleLeadModal from "./schedule-lead-modal";

function CalendarIcon({ className }: { className?: string }) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

export default function LeadCard({
  lead,
  now,
  onDiscard,
  onSchedule,
  archiving,
}: {
  lead: Lead;
  now: Date;
  onDiscard: (lead: Lead, reason: DiscardReason, note: string) => void;
  onSchedule: (lead: Lead, isoDatetime: string | null) => Promise<boolean>;
  archiving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });
  const [confirming, setConfirming] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  async function handleSaveSchedule(isoDatetime: string | null) {
    setSavingSchedule(true);
    const ok = await onSchedule(lead, isoDatetime);
    setSavingSchedule(false);
    if (ok) setScheduling(false);
  }

  function handleConfirmDiscard(reason: DiscardReason, note: string) {
    setConfirming(false);
    onDiscard(lead, reason, note);
  }

  const days = daysSince(lead.stage_changed_at, now);
  const stalling = isStalling(lead.stage, days);
  const showArchiveButton = lead.stage !== "convertida";

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        // Toda la card es el handle del drag; el sensor del tablero exige mover unos px
        // para activarlo, así un click simple llega acá y abre el detalle.
        onClick={() => setViewing(true)}
        className={`cursor-grab rounded-xl border bg-surface p-3 shadow-sm active:cursor-grabbing ${
          stalling ? "border-danger" : "border-border"
        } ${isDragging ? "opacity-50" : ""}`}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: leadChannelDot(lead.channel) }}
          />
          <span className="text-xs text-tertiary">{leadChannelLabel(lead.channel)}</span>
          <span
            className={`ml-auto text-[10.5px] font-semibold ${
              stalling ? "rounded-full bg-danger-soft px-2 py-0.5 text-danger" : "text-tertiary"
            }`}
          >
            {daysLabel(days)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-primary" title={lead.name}>
            {lead.name}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setScheduling(true);
              }}
              aria-label={lead.scheduled_at ? "Cambiar agenda" : "Agendar"}
              className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg border hover:border-accent hover:text-accent ${
                lead.scheduled_at ? "border-accent text-accent" : "border-border text-secondary"
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
            </button>
            {showArchiveButton && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirming(true);
                }}
                disabled={archiving}
                className="shrink-0 rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-secondary hover:border-danger hover:text-danger disabled:opacity-60"
              >
                {archiving ? "…" : "Descartar"}
              </button>
            )}
          </div>
        </div>
        {lead.scheduled_at && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent">
            <CalendarIcon className="h-3 w-3" />
            {formatSchedule(lead.scheduled_at)}
          </div>
        )}
      </div>

      {viewing && <LeadDescriptionModal lead={lead} onClose={() => setViewing(false)} />}

      {scheduling && (
        <ScheduleLeadModal
          leadName={lead.name}
          scheduledAt={lead.scheduled_at}
          loading={savingSchedule}
          onSave={handleSaveSchedule}
          onCancel={() => setScheduling(false)}
        />
      )}

      {confirming && (
        <DiscardLeadModal
          leadName={lead.name}
          loading={archiving}
          onConfirm={handleConfirmDiscard}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
