"use client";

import dynamic from "next/dynamic";

// El editor se carga solo en el cliente (usa APIs del DOM) y recién cuando se necesita.
const LazyMarkdownEditor = dynamic(() => import("./markdown-editor"), {
  ssr: false,
  loading: () => <div className="h-40 rounded-lg border border-border bg-background" />,
});

export default LazyMarkdownEditor;
