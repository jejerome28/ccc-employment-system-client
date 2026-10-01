"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/app/_lib/api.server";
import { formValues } from "@/app/_lib/params";
import { manilaToUtcIso, toClockInput } from "@/app/_lib/format";
import type { ActionState } from "@/app/_lib/types";

const opt = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim() || null;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

function nextDay(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function clocks(fd: FormData, workDate: string) {
  const inAt = opt(fd, "clock_in_at");
  const outAt = opt(fd, "clock_out_at");
  const dateOk = !Number.isNaN(Date.parse(`${workDate}T00:00:00Z`));
  const iso = (ymd: string, hhmm: string | null) => (hhmm && dateOk && HHMM.test(hhmm) ? manilaToUtcIso(ymd, hhmm) : hhmm);
  const overnight = !!inAt && !!outAt && HHMM.test(inAt) && HHMM.test(outAt) && outAt < inAt;

  return {
    clock_in_at: iso(workDate, inAt),
    clock_out_at: iso(dateOk && overnight ? nextDay(workDate) : workDate, outAt),
    notes: opt(fd, "notes"),
  };
}

function refresh() {
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}

export async function saveAttendance(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const workDate = String(fd.get("work_date") ?? "");
  const r = await apiFetch("/api/attendance", {
    method: "POST",
    body: { employee_id: Number(fd.get("employee_id")), work_date: workDate, ...clocks(fd, workDate) },
  });
  if (!r.ok) return { error: r.message, errors: r.errors, values: formValues(fd) };

  refresh();
  return { message: r.message };
}

type Original = { clock_in_at: string | null; clock_out_at: string | null };

export async function updateAttendance(id: number, date: string, original: Original, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const body = clocks(fd, date);
  for (const k of ["clock_in_at", "clock_out_at"] as const) {
    if (original[k] && opt(fd, k) === toClockInput(original[k])) body[k] = original[k];
  }
  const r = await apiFetch(`/api/attendance/${id}`, { method: "PUT", body });
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
