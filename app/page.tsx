"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { MetaStatus, User } from "@/lib/types";

export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    async function resolve() {
      try {
        const me = await api.get<User>("/auth/me");
        const accountId = me.accounts[0]?.id;
        if (!accountId) {
          router.replace("/connect-meta");
          return;
        }
        const status = await api.get<MetaStatus>(`/meta/status?account_id=${accountId}`);
        router.replace(status.connected ? "/dashboard" : "/connect-meta");
      } catch {
        // Un 401 ya redirige a /login desde lib/api.ts
      }
    }
    resolve();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-secondary">Cargando…</p>
    </main>
  );
}
