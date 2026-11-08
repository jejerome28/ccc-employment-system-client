"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/app/_lib/api.server";
import { formValues } from "@/app/_lib/params";
import type { ActionState } from "@/app/_lib/types";

export async function saveUser(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const get = (k: string) => String(fd.get(k) ?? "");
  const password = get("password");
  // Explicit body: the API 422s on unknown fields (email is create-only).
  const body = id
    ? { name: get("name"), role: get("role"), ...(password && { password }) }
    : { name: get("name"), email: get("email"), password, role: get("role") };

  const r = await apiFetch(id ? `/api/users/${id}` : "/api/users", { method: id ? "PUT" : "POST", body });
  if (!r.ok) return { error: r.message, errors: r.errors, values: Object.fromEntries(Object.entries(formValues(fd)).filter(([k]) => k !== "password")) };

  revalidatePath("/users");
  return { message: r.message };
}
