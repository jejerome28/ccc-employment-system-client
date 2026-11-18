"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/app/_lib/api.server";
import { clearSession } from "@/app/_lib/session";
import type { ActionState, FieldErrors } from "@/app/_lib/types";

function passwordErrors(current: string, password: string, confirmation: string): FieldErrors | null {
  if (!current && !password && !confirmation) return null;
  const errors: FieldErrors = {};
  if (!current) errors.current_password = ["Enter your current password."];
  if (!password) errors.password = ["Enter a new password."];
  else if (password.length < 8) errors.password = ["New password must be at least 8 characters."];
  else if (password !== confirmation) errors.password_confirmation = ["Passwords do not match."];
  return Object.keys(errors).length ? errors : null;
}

export async function saveAccount(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const get = (k: string) => String(fd.get(k) ?? "");
  const name = get("name");
  const password = get("password");
  const currentPassword = get("current_password");
  const confirmation = get("password_confirmation");
  const invalid = passwordErrors(currentPassword, password, confirmation);
  if (invalid) return { error: "Check the password fields.", errors: invalid, values: { name } };
  const body = password
    ? { name, current_password: currentPassword, password, password_confirmation: confirmation }
    : { name };

  const r = await apiFetch("/api/me", { method: "PUT", body });
  if (!r.ok) return { error: r.message, errors: r.errors, values: { name } };

  if (password) {
    await clearSession();
    redirect("/login?changed=1");
  }
  revalidatePath("/", "layout");
  return { message: r.message };
}
