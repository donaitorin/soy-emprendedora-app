"use client";

import Markdown from "react-markdown";
import Modal from "@/app/dashboard/_components/modal";
import type { Lead } from "@/lib/types";
import { MARKDOWN_CONTENT_CLASS } from "./markdown-styles";

export default function LeadDescriptionModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const description = lead.description?.trim();

  return (
    <Modal title={lead.name} onClose={onClose}>
      {description ? (
        <div className={`flex max-h-[60vh] flex-col gap-2 overflow-y-auto ${MARKDOWN_CONTENT_CLASS}`}>
          <Markdown>{description}</Markdown>
        </div>
      ) : (
        <p className="text-sm text-secondary">Esta lead no tiene descripción.</p>
      )}
    </Modal>
  );
}
