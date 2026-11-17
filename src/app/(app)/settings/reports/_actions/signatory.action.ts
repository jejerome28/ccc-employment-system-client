"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/app/_lib/api.server";
import { formValues } from "@/app/_lib/params";
import type { ActionState } from "@/app/_lib/types";

export async function saveSignatories(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const get = (k: string) => String(fd.get(k) ?? "");
  const ids = fd.getAll("id").map(String);
  if (ids.length === 0 || !ids.every((id) => /^[1-9]\d*$/.test(id))) return { error: "Invalid request." };

  for (const [i, id] of ids.entries()) {
    const r = await apiFetch(`/api/report-signatories/${id}`, {
      method: "PUT",
      body: { label: get(`label-${id}`), name: get(`name-${id}`), title: get(`title-${id}`) },
    });
    if (!r.ok) {
      const errors = r.errors && Object.fromEntries(Object.entries(r.errors).map(([k, v]) => [`${k}-${id}`, v]));
      return { error: `Block ${i + 1}: ${r.message}`, errors, values: formValues(fd) };
    }
  }

  revalidatePath("/settings/reports");
  return { message: "Signatories saved." };
}
