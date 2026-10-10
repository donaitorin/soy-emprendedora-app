"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { LEAD_STAGES, leadStageLabel } from "@/lib/leads";
import type { Lead, LeadStage } from "@/lib/types";
import type { DiscardReason } from "./discard-lead-modal";
import LeadCard from "./lead-card";

function KanbanColumn({
  stage,
  leads,
  now,
  onDiscard,
  onSchedule,
  archivingId,
}: {
  stage: LeadStage;
  leads: Lead[];
  now: Date;
  onDiscard: (lead: Lead, reason: DiscardReason, note: string) => void;
  onSchedule: (lead: Lead, isoDatetime: string | null) => Promise<boolean>;
  archivingId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-49 flex-1 flex-col gap-2.5 rounded-2xl p-3 transition-colors ${
        isOver ? "bg-accent-soft" : "bg-surface-2"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wide text-secondary">
          {leadStageLabel(stage)}
        </span>
        <span className="text-xs font-bold text-tertiary">{leads.length}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            now={now}
            onDiscard={onDiscard}
            onSchedule={onSchedule}
            archiving={archivingId === lead.id}
          />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({
  leads,
  now,
  onMoveStage,
  onDiscard,
  onSchedule,
  archivingId,
}: {
  leads: Lead[];
  now: Date;
  onMoveStage: (lead: Lead, stage: LeadStage) => void;
  onDiscard: (lead: Lead, reason: DiscardReason, note: string) => void;
  onSchedule: (lead: Lead, isoDatetime: string | null) => Promise<boolean>;
  archivingId: string | null;
}) {
  // Sin distancia mínima el drag arrancaría en el pointerdown y se comería los clicks.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const targetStage = over.id as LeadStage;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === targetStage) return;

    onMoveStage(lead, targetStage);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {LEAD_STAGES.map(({ value }) => (
          <KanbanColumn
            key={value}
            stage={value}
            leads={leads.filter((lead) => lead.stage === value)}
            now={now}
            onDiscard={onDiscard}
            onSchedule={onSchedule}
            archivingId={archivingId}
          />
        ))}
      </div>
    </DndContext>
  );
}
