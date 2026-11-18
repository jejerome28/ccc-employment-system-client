"use server";

import { apiFetch } from "@/app/_lib/api.server";
import type { EmployeeLookup } from "@/app/_lib/types";

export type LookupState = { result?: EmployeeLookup; error?: string; code?: string } | undefined;

export async function lookupEmployee(_prev: LookupState, fd: FormData): Promise<LookupState> {
  const code = String(fd.get("employee_code") ?? "").trim();
  const month = String(fd.get("month") ?? "");
  if (!code) return { error: "Enter your employee code." };

  const r = await apiFetch<EmployeeLookup>("/api/lookup", { method: "POST", body: { employee_code: code, ...(month && { month }) } });
  if (!r.ok) return { error: Object.values(r.errors ?? {})[0]?.[0] ?? r.message, code };
  return { result: r.data, code };
}
