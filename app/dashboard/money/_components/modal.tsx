"use client";

import type { MouseEvent, ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  function stopPropagation(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
    >
      <div
        onClick={stopPropagation}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-lg"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-secondary"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
