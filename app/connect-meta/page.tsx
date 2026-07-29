"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function ConnectMetaPage() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    api
      .get<User>("/auth/me")
      .then((me) => setAccountId(me.accounts[0]?.id ?? null))
      .catch(() => {});
  }, []);

  async function handleConnect() {
    if (!accountId) return;
    setError(null);
    setConnecting(true);
    try {
      const data = await api.get<{ url: string }>(`/meta/connect?account_id=${accountId}`);
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar la conexión");
      setConnecting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="font-serif text-2xl font-semibold text-primary">Conectá tu Instagram</h1>
      <p className="max-w-sm text-sm text-secondary">
        Vamos a llevarte a Facebook para autorizar el acceso a tu cuenta de Instagram profesional.
        Cuando termines, vas a volver acá automáticamente.
      </p>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        onClick={handleConnect}
        disabled={!accountId || connecting}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
      >
        {connecting ? "Conectando…" : "Conectar con Meta"}
      </button>
    </main>
  );
}
