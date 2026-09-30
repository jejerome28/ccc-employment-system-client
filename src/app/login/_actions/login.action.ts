"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/app/_lib/api.server";
import { setSession } from "@/app/_lib/session";
import type { ActionState } from "@/app/_lib/types";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const r = await apiFetch<{ token: string; expires_at: string | null }>("/api/login", {
    method: "POST",
    body: { email, password: String(formData.get("password") ?? "") },
  });

  // Echo the email only — never send the password back to the browser.
  if (!r.ok) return { error: r.message, errors: r.errors, values: { email } };

  await setSession(r.data.token, r.data.expires_at);
  redirect("/dashboard");
}
