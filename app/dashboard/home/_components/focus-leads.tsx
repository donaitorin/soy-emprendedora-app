"use client";

import Link from "next/link";
import { daysLabel, daysSince, leadChannelDot, leadChannelLabel } from "@/lib/leads";
import type { Lead } from "@/lib/types";

export default function FocusLeads({ leads, now }: { leads: Lead[]; now: Date }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
        Foco de hoy
      </div>
      <h2 className="mt-1 font-serif text-xl font-semibold text-primary">Leads</h2>

      {leads.length === 0 ? (
        <p className="mt-4 text-sm text-secondary">No hay leads activas todavía.</p>
      ) : (
        <div className="mt-4 flex flex-col">
          {leads.map((lead) => {
            const days = daysSince(lead.stage_changed_at, now);
            return (
              <div
                key={lead.id}
                className="flex items-center gap-2.75 border-b border-border py-2.75 last:border-0"
              >
                <span
                  className="h-2.25 w-2.25 shrink-0 rounded-full"
                  style={{ background: leadChannelDot(lead.channel) }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-primary">{lead.name}</div>
                  <div className="text-xs text-tertiary">{leadChannelLabel(lead.channel)}</div>
                </div>
                <span className="text-xs font-semibold text-secondary">{daysLabel(days)}</span>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/dashboard/leads"
        className="mt-4 block w-full rounded-lg border border-border py-2.5 text-center text-sm font-semibold text-accent"
      >
        Ver pipeline completo →
      </Link>
    </div>
  );
}
