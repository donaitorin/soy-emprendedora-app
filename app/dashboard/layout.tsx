"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import type { MetaStatus, User } from "@/lib/types";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function MoneyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function AudienceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LeadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ActionsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 11 3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard/home", label: "Inicio", icon: HomeIcon },
  { href: "/dashboard/money", label: "Dinero", icon: MoneyIcon },
  { href: "/dashboard/audience", label: "Audiencia", icon: AudienceIcon },
  { href: "/dashboard/leads", label: "Leads", icon: LeadsIcon },
  { href: "/dashboard/actions", label: "Acciones", icon: ActionsIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const me = await api.get<User>("/auth/me");
        const account = me.accounts[0];
        if (!account) return;

        const status = await api.get<MetaStatus>(`/meta/status?account_id=${account.id}`);
        const metaName = status.page_name ?? (status.ig_username ? `@${status.ig_username}` : null);
        setBusinessName(metaName ?? account.name);
        setProfilePictureUrl(status.profile_picture_url);
      } catch {
        // el nombre queda en "Cargando…" si esto falla
      }
    }
    loadBusiness();
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  const initial = businessName?.trim().charAt(0).toUpperCase() || "·";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-62 shrink-0 flex-col gap-1 border-r border-border bg-surface px-5 py-6">
        <div className="flex items-center gap-3 px-1 pb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-accent font-serif text-lg font-bold text-on-accent">
            {profilePictureUrl && !imageFailed ? (
              // eslint-disable-next-line @next/next/no-img-element -- viene de un CDN externo de Meta con subdominios dinámicos, no vale la pena optimizarla con next/image
              <img
                src={profilePictureUrl}
                alt={businessName ?? "Negocio"}
                className="h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-serif text-base font-semibold text-primary">
              {businessName ?? "Cargando…"}
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-accent-soft text-accent" : "text-secondary hover:bg-surface-2"
                }`}
              >
                {isActive && (
                  <span className="absolute bottom-2.25 left-0 top-2.25 w-0.75 rounded-full bg-accent" />
                )}
                <item.icon className="h-4.75 w-4.75 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <LogoutIcon className="h-4.5 w-4.5" />
          Cerrar sesión
        </button>
      </aside>

      <main className="min-w-0 flex-1 px-10 py-8">
        <div className="mx-auto w-full max-w-330">{children}</div>
      </main>
    </div>
  );
}
