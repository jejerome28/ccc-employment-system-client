"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/app/_lib/api.server";
import type { ActionState } from "@/app/_lib/types";

export async function clock(
  employeeId: number,
  kind: "time-in" | "time-out",
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const r = await apiFetch(`/api/employees/${employeeId}/${kind}`, { method: "POST" });
  if (!r.ok) return { error: r.message };

  revalidatePath("/dashboard");
  revalidatePath("/attendance");
  return { message: r.message };
}
