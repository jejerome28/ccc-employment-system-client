"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/app/_lib/api.server";
import { clearSession } from "@/app/_lib/session";

export async function logout(): Promise<void> {
  // Revoke server-side too; if the token already expired apiFetch redirects to /auth/expired, which also clears it.
  await apiFetch("/api/logout", { method: "POST" });
  await clearSession();
  redirect("/login");
}
