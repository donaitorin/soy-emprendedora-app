"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConfirmModal from "../_components/confirm-modal";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export default function DashboardConfigPage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<User>("/auth/me")
      .then((me) => {
        const account = me.accounts[0];
        if (account) setAccountId(account.id);
        else setLoadError("No se encontró un negocio asociado a tu cuenta.");
      })
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : "No se pudo cargar la configuración")
      );
  }, []);

  // Borra la conexión guardada y manda a la pantalla de conectar, donde la usuaria
  // vuelve a autorizar a Meta como la primera vez.
  async function handleResetMeta() {
    if (!accountId) return;
    setResetting(true);
    setError(null);
    try {
      await api.delete(`/meta/disconnect?account_id=${accountId}`);
      router.push("/connect-meta");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo reiniciar la conexión");
      setResetting(false);
      setConfirming(false);
    }
  }

  if (loadError) {
    return <p className="text-sm text-danger">{loadError}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-primary">Configuración</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-primary">Reiniciar conexión con Meta</div>
              <p className="mt-1 text-xs text-secondary">
                Quita la conexión actual y vuelve a pedir los permisos. Usalo si dejaste de ver
                los datos de Instagram, por ejemplo después de iniciar sesión desde otro
                dispositivo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={!accountId}
              className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:border-danger hover:text-danger disabled:opacity-60"
            >
              Reiniciar
            </button>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </section>

        <div />
      </div>

      {confirming && (
        <ConfirmModal
          title="Reiniciar conexión con Meta"
          message="Se va a quitar la conexión actual y vas a volver a la pantalla para conectar tu cuenta. Tus leads, movimientos y tareas no se borran. Si conectás la misma cuenta de Meta, vas a ver tus datos como antes."
          confirmLabel="Reiniciar"
          loading={resetting}
          onConfirm={handleResetMeta}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
