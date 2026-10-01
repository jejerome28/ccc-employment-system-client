import "server-only";
import { notFound, redirect } from "next/navigation";
import { getToken } from "./session";
import type { FieldErrors } from "./types";

export type ApiResult<T> =
  | { ok: true; status: number; message: string; data: T }
  | { ok: false; status: number; message: string; errors?: FieldErrors };

type Init = { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown };

export async function apiFetch<T>(path: string, init: Init = {}): Promise<ApiResult<T>> {
  const token = await getToken();
  const form = init.body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body !== undefined && !form) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${process.env.API_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : form ? (init.body as FormData) : JSON.stringify(init.body),
    cache: "no-store",
  });

  // A 401 with a token means it expired or was revoked. /auth/expired clears the cookie
  // (Server Components can't), which also stops proxy.ts bouncing /login back to /dashboard.
  if (res.status === 401 && token) redirect("/auth/expired");

  const json = await res.json();
  if (res.status >= 500) throw new Error(`API ${res.status}: ${json.message}`);
  if (res.ok) return { ok: true, status: res.status, message: json.message, data: json.data as T };
  return { ok: false, status: res.status, message: json.message, errors: json.data?.errors };
}

export async function apiData<T>(path: string): Promise<T> {
  const r = await apiFetch<T>(path);
  if (r.status === 404) notFound();
  if (!r.ok) throw new Error(`API ${r.status}: ${r.message}`);
  return r.data;
}
