"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/app/_lib/api.server";
import { formValues } from "@/app/_lib/params";
import type { ActionState, Employee } from "@/app/_lib/types";
import { employeeBody } from "../_lib/employee-body";

export async function saveEmployee(id: number | null, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const r = await apiFetch<{ employee: Employee }>(id ? `/api/employees/${id}` : "/api/employees", {
    method: id ? "PUT" : "POST",
    body: employeeBody(fd),
  });
  if (!r.ok) return { error: r.message, errors: r.errors, values: formValues(fd) };

  revalidatePath("/employees");
  redirect(`/employees/${r.data.employee.id}`);
}

export async function deleteEmployee(id: number): Promise<void> {
  const r = await apiFetch(`/api/employees/${id}`, { method: "DELETE" });
  if (!r.ok && r.status !== 404) throw new Error(r.message);

  revalidatePath("/employees");
  redirect("/employees");
}
