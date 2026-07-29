"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.post<{ access_token: string }>("/auth/register", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      setToken(data.access_token);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar el registro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold text-primary">Creá tu cuenta</h1>
        <p className="mt-1 text-sm text-secondary">Empezá a organizar tu negocio hoy.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="first_name" className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                Nombre
              </label>
              <input
                id="first_name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="last_name" className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                Apellido
              </label>
              <input
                id="last_name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none focus:border-accent"
            />
            <span className="text-xs text-tertiary">Mínimo 8 caracteres.</span>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent disabled:opacity-60"
          >
            {loading ? "Creando cuenta…" : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-semibold text-accent">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
