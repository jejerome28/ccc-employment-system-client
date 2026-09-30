"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/app/_lib/api.server";
import { formValues } from "@/app/_lib/params";
import type { ActionState } from "@/app/_lib/types";

const opt = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim() || null;
const times = (fd: FormData) => ({ time_in: opt(fd, "time_in"), time_out: opt(fd, "time_out"), notes: opt(fd, "notes") });

function refresh() {
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}

export async function saveAttendance(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const r = await apiFetch("/api/attendance", {
    method: "POST",
    body: { employee_id: Number(fd.get("employee_id")), work_date: String(fd.get("work_date") ?? ""), ...times(fd) },
  });
  if (!r.ok) return { error: r.message, errors: r.errors, values: formValues(fd) };

  refresh();
  return { message: r.message };
}

export async function updateAttendance(id: number, date: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const r = await apiFetch(`/api/attendance/${id}`, { method: "PUT", body: times(fd) });
  if (!r.ok) return { error: r.message, errors: r.errors, values: formValues(fd) };

  refresh();
  redirect(`/attendance?date=${date}`);
}

export async function deleteAttendance(id: number, date: string): Promise<void> {
  const r = await apiFetch(`/api/attendance/${id}`, { method: "DELETE" });
  if (!r.ok && r.status !== 404) throw new Error(r.message);

  refresh();
  redirect(`/attendance?date=${date}`);
}
