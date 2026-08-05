"use client";

import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import ConfirmModal from "@/app/dashboard/_components/confirm-modal";
import { daysLabel, daysSince, isStalling, leadChannelDot, leadChannelLabel } from "@/lib/leads";
import type { Lead } from "@/lib/types";

export default function LeadCard({
  lead,
  now,
  onArchive,
  archiving,
}: {
  lead: Lead;
  now: Date;
  onArchive: (lead: Lead) => void;
  archiving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });
  const [confirming, setConfirming] = useState(false);

  function handleConfirmArchive() {
    setConfirming(false);
    onArchive(lead);
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
        className={`rounded-xl border bg-surface p-3 shadow-sm ${
          stalling ? "border-danger" : "border-border"
        } ${isDragging ? "opacity-50" : ""}`}
      >
        <div
          {...listeners}
          {...attributes}
          className="mb-1.5 flex cursor-grab items-center gap-2 active:cursor-grabbing"
        >
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
          <span className="text-sm font-semibold text-primary">{lead.name}</span>
          {showArchiveButton && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={archiving}
              className="shrink-0 rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-secondary hover:border-danger hover:text-danger disabled:opacity-60"
            >
              {archiving ? "…" : "Descartar"}
            </button>
          )}
        </div>
      </div>

      {confirming && (
        <ConfirmModal
          title="Descartar lead"
          message={`¿Seguro que querés descartar a ${lead.name}? Se va a archivar como no convertida.`}
          confirmLabel="Descartar"
          loading={archiving}
          onConfirm={handleConfirmArchive}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
}
