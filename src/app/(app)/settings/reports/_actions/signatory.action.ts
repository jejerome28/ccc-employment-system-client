"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/app/_lib/api.server";
import { formValues } from "@/app/_lib/params";
import type { ActionState } from "@/app/_lib/types";

export async function saveSignatory(id: number, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const get = (k: string) => String(fd.get(k) ?? "");
  // Explicit body: the API 422s on unknown fields.
  const r = await apiFetch(`/api/report-signatories/${id}`, { method: "PUT", body: { label: get("label"), name: get("name"), title: get("title") } });
  if (!r.ok) return { error: r.message, errors: r.errors, values: formValues(fd) };

  revalidatePath("/settings/reports");
  return { message: r.message };
}
