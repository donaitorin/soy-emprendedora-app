"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { API_URL, api, ApiError } from "@/lib/api";
import type { MetaCallbackResponse } from "@/lib/types";

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const oauthState = params.get("state");
  const hasParams = Boolean(code && oauthState);

  const [status, setStatus] = useState<"loading" | "select" | "error">(
    hasParams ? "loading" : "error"
  );
  const [error, setError] = useState<string | null>(
    hasParams ? null : "Faltan parámetros de autorización."
  );
  const [data, setData] = useState<MetaCallbackResponse | null>(null);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (!code || !oauthState) return;

    fetch(
      `${API_URL}/meta/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(oauthState)}`
    )
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.detail ?? "No se pudo completar la conexión");
        return body as MetaCallbackResponse;
      })
      .then((body) => {
        if (body.requires_selection) {
          setData(body);
          setStatus("select");
        } else {
          router.replace("/dashboard/home");
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "No se pudo completar la conexión");
        setStatus("error");
      });
  }, [code, oauthState, router]);

  async function handleSelect(fbPageId: string) {
    if (!data) return;
    setSelecting(true);
    try {
      await api.post("/meta/select-page", { account_id: data.account_id, fb_page_id: fbPageId });
      router.replace("/dashboard/home");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo seleccionar la página");
      setSelecting(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-secondary">Conectando con Instagram…</p>;
  }

  if (status === "error") {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <div className="w-full max-w-sm text-left">
      <h1 className="font-serif text-xl font-semibold text-primary">Elegí una página</h1>
      <p className="mt-1 text-sm text-secondary">
        Tu negocio tiene varias páginas de Facebook conectadas.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        {data?.pages.map((page) => (
          <button
            key={page.fb_page_id}
            onClick={() => handleSelect(page.fb_page_id)}
            disabled={selecting}
            className="rounded-lg border border-border bg-white px-4 py-3 text-left text-sm hover:border-accent disabled:opacity-60"
          >
            <div className="font-semibold text-primary">{page.page_name}</div>
            <div className="text-tertiary">
              {page.ig_username ? `@${page.ig_username}` : "Sin Instagram vinculado"}
            </div>
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
    </div>
  );
}

export default function MetaCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <Suspense fallback={<p className="text-sm text-secondary">Cargando…</p>}>
        <CallbackContent />
      </Suspense>
    </main>
  );
}
