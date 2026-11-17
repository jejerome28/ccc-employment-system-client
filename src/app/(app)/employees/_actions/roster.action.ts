"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/app/_lib/api.server";
import type { FieldErrors } from "@/app/_lib/types";
import type { RowError } from "@/app/(app)/attendance/_actions/import.action";

type RosterResult = { created: number; updated: number; restored: number };
export type RosterState =
  | ({ ok: true; message: string } & RosterResult)
  | { ok: false; message: string; rowErrors: RowError[] }
  | undefined;

export async function importRoster(_prev: RosterState, fd: FormData): Promise<RosterState> {
  const body = new FormData();
  const file = fd.get("file");
  if (file) body.set("file", file);

  const r = await apiFetch<RosterResult>("/api/employees/import", { method: "POST", body });

  if (!r.ok) {
    const errors: unknown = r.errors;
    if (Array.isArray(errors)) return { ok: false, message: r.message, rowErrors: errors as RowError[] };
    return { ok: false, message: (errors as FieldErrors | undefined)?.file?.[0] ?? r.message, rowErrors: [] };
  }

  revalidatePath("/employees");
  return { ok: true, message: r.message, ...r.data };
}
