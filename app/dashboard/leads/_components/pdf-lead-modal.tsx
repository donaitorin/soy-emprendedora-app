"use client";

import { type DragEvent, useRef, useState } from "react";
import Modal from "@/app/dashboard/_components/modal";
import { api, ApiError } from "@/lib/api";
import { formatFileSize, validatePdfFile } from "@/lib/leads";
import type { Lead, LeadPdfDownload } from "@/lib/types";

export default function PdfLeadModal({
  accountId,
  lead,
  onClose,
  onUploaded,
}: {
  accountId: string;
  lead: Lead;
  onClose: () => void;
  onUploaded: (lead: Lead) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    const validationError = validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const updated = await api.upload<Lead>(
        `/accounts/${accountId}/leads/${lead.id}/pdf`,
        file
      );
      onUploaded(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo subir el PDF");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  async function handleDownload() {
    setError(null);
    setDownloading(true);
    try {
      // La URL es presignada y dura pocos minutos, por eso se pide justo al descargar.
      const { url, filename } = await api.get<LeadPdfDownload>(
        `/accounts/${accountId}/leads/${lead.id}/pdf`
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo descargar el PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Modal title="PDF de la lead" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {lead.pdf_filename && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-primary" title={lead.pdf_filename}>
                {lead.pdf_filename}
              </div>
              {lead.pdf_size != null && (
                <div className="text-xs text-tertiary">{formatFileSize(lead.pdf_size)}</div>
              )}
            </div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-60"
            >
              {downloading ? "Descargando…" : "Descargar"}
            </button>
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? "border-accent bg-accent-soft" : "border-border"
          } ${uploading ? "cursor-wait opacity-60" : ""}`}
        >
          <span className="text-sm font-semibold text-primary">
            {uploading
              ? "Subiendo…"
              : lead.pdf_filename
                ? "Arrastrá un PDF para reemplazarlo"
                : "Arrastrá un PDF acá"}
          </span>
          <span className="text-xs text-secondary">
            o <span className="font-semibold text-accent">elegí un archivo</span> · solo PDF, hasta 10
            MB
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-secondary"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
