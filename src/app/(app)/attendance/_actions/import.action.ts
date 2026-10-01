"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/app/_lib/api.server";
import type { FieldErrors } from "@/app/_lib/types";

export type ImportRow = { line: number; person_id: string; name: string | null };
export type RowError = { line: number; message: string };
export type ImportState =
  | { ok: true; message: string; created: number; updated: number; unknown: ImportRow[] }
  | { ok: false; message: string; rowErrors: RowError[] }
  | undefined;

type ImportResult = { created: number; updated: number; unknown: ImportRow[] };

export async function importAttendance(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const body = new FormData();
  const file = fd.get("file");
  if (file) body.set("file", file);

  const r = await apiFetch<ImportResult>("/api/attendance/import", { method: "POST", body });

  if (!r.ok) {
    const errors: unknown = r.errors;
    if (Array.isArray(errors)) return { ok: false, message: r.message, rowErrors: errors as RowError[] };
    return { ok: false, message: (errors as FieldErrors | undefined)?.file?.[0] ?? r.message, rowErrors: [] };
  }

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  return { ok: true, message: r.message, ...r.data };
}
