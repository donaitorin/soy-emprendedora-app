import type { LeadChannel, LeadStage } from "./types";

export const LEAD_CHANNELS: { value: LeadChannel; label: string; dot: string }[] = [
  { value: "instagram", label: "Instagram DM", dot: "#B655C9" },
  { value: "whatsapp", label: "WhatsApp", dot: "#3FA56A" },
  { value: "referido", label: "Referida", dot: "#4A86C9" },
  { value: "web", label: "Web", dot: "#9A8C7A" },
  { value: "otro", label: "Otro", dot: "#9A8C7A" },
];

const LEAD_CHANNEL_LABELS = Object.fromEntries(
  LEAD_CHANNELS.map((c) => [c.value, c.label])
) as Record<LeadChannel, string>;

const LEAD_CHANNEL_DOTS = Object.fromEntries(
  LEAD_CHANNELS.map((c) => [c.value, c.dot])
) as Record<LeadChannel, string>;

export function leadChannelLabel(channel: LeadChannel): string {
  return LEAD_CHANNEL_LABELS[channel];
}

export function leadChannelDot(channel: LeadChannel): string {
  return LEAD_CHANNEL_DOTS[channel];
}

export const LEAD_STAGES: { value: LeadStage; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "conversacion", label: "En conversación" },
  { value: "propuesta", label: "Propuesta" },
  { value: "agendada", label: "Agendada" },
  { value: "convertida", label: "Convertida" },
];

const LEAD_STAGE_LABELS = Object.fromEntries(
  LEAD_STAGES.map((s) => [s.value, s.label])
) as Record<LeadStage, string>;

export function leadStageLabel(stage: LeadStage): string {
  return LEAD_STAGE_LABELS[stage];
}

// Días transcurridos desde que la lead llegó a su etapa actual (`stage_changed_at`).
export function daysSince(isoDatetime: string, reference: Date): number {
  const then = new Date(isoDatetime).getTime();
  const diffMs = reference.getTime() - then;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function daysLabel(days: number): string {
  if (days === 0) return "hoy";
  return `${days} ${days === 1 ? "día" : "días"}`;
}

// Mismo criterio de "se está enfriando" que el diseño de referencia: 2+ días
// estancada en conversación o propuesta.
export function isStalling(stage: LeadStage, days: number): boolean {
  return days >= 2 && (stage === "conversacion" || stage === "propuesta");
}
