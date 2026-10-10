import { clearToken, getToken } from "./auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "Sesión expirada");
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      typeof data?.detail === "string" ? data.detail : "Ocurrió un error inesperado";
    throw new ApiError(res.status, message);
  }

  return data as T;
}

// Descarga un archivo binario (ej. el .xlsx de movimientos). Va aparte de `request` porque
// esa función asume respuestas JSON. El nombre sale de Content-Disposition si el backend
// lo expone por CORS; si no, se usa `fallbackFilename`.
async function download(
  path: string,
  fallbackFilename: string
): Promise<{ blob: Blob; filename: string }> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "Sesión expirada");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message =
      typeof data?.detail === "string" ? data.detail : "Ocurrió un error inesperado";
    throw new ApiError(res.status, message);
  }

  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return { blob: await res.blob(), filename: match?.[1] ?? fallbackFilename };
}

// Sube un archivo como multipart/form-data. No se fija Content-Type a mano: el browser
// lo arma con el boundary correcto.
async function upload<T>(path: string, file: File): Promise<T> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "Sesión expirada");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      typeof data?.detail === "string" ? data.detail : "Ocurrió un error inesperado";
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const api = {
  upload,
  download,
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
