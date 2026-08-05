"use client";

import { DndContext, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import { LEAD_STAGES, leadStageLabel } from "@/lib/leads";
import type { Lead, LeadStage } from "@/lib/types";
import LeadCard from "./lead-card";

function KanbanColumn({
  stage,
  leads,
  now,
  onArchive,
  archivingId,
}: {
  stage: LeadStage;
  leads: Lead[];
  now: Date;
  onArchive: (lead: Lead) => void;
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
            onArchive={onArchive}
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
  onArchive,
  archivingId,
}: {
  leads: Lead[];
  now: Date;
  onMoveStage: (lead: Lead, stage: LeadStage) => void;
  onArchive: (lead: Lead) => void;
  archivingId: string | null;
}) {
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
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {LEAD_STAGES.map(({ value }) => (
          <KanbanColumn
            key={value}
            stage={value}
            leads={leads.filter((lead) => lead.stage === value)}
            now={now}
            onArchive={onArchive}
            archivingId={archivingId}
          />
        ))}
      </div>
    </DndContext>
  );
}
