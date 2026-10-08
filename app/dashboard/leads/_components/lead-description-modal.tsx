"use client";

import Markdown from "react-markdown";
import Modal from "@/app/dashboard/_components/modal";
import type { Lead } from "@/lib/types";
import { MARKDOWN_CONTENT_CLASS } from "./markdown-styles";

function Section({ title, content, empty }: { title: string; content?: string | null; empty: string }) {
  const text = content?.trim();

  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="text-xs font-bold uppercase tracking-wide text-tertiary">{title}</h4>
      {text ? (
        <div className={`flex flex-col gap-2 ${MARKDOWN_CONTENT_CLASS}`}>
          <Markdown>{text}</Markdown>
        </div>
      ) : (
        <p className="text-sm text-secondary">{empty}</p>
      )}
    </section>
  );
}

export default function LeadDescriptionModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  // El motivo de rechazo solo existe para leads archivadas como "no convertida".
  const showRejection = lead.archived && lead.archive_reason === "not_converted";

  return (
    <Modal title={lead.name} onClose={onClose}>
      <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto">
        <Section title="Descripción" content={lead.description} empty="Sin descripción." />
        {showRejection && (
          <Section
            title="Motivo de rechazo"
            content={lead.archive_note}
            empty="No se indicó un motivo."
          />
        )}
      </div>
    </Modal>
  );
}
