"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Employee } from "@/app/_lib/types";
import { FieldError } from "../../_components/FieldError";
import { Notice } from "../../_components/Notice";
import { saveEmployee } from "../_actions/employee.action";

const FIELDS: [keyof Employee, string, string, boolean][] = [
  ["employee_code", "Employee code", "text", true],
  ["first_name", "First name", "text", true],
  ["last_name", "Last name", "text", true],
  ["email", "Email", "email", false],
  ["phone", "Phone", "text", false],
  ["position", "Position", "text", false],
  ["department", "Department", "text", false],
  ["hire_date", "Hire date", "date", false],
];

export function EmployeeForm({ employee, submitLabel }: { employee?: Employee; submitLabel: string }) {
  const [state, action, pending] = useActionState(saveEmployee.bind(null, employee?.id ?? null), undefined);

  return (
    <form action={action}>
      <Notice state={state} />
      <div className="bg-white border border-line rounded p-6 grid sm:grid-cols-2 gap-4 max-w-3xl">
        {FIELDS.map(([name, label, type, required]) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium mb-1">
              {label} {!required && <span className="text-muted font-normal">(optional)</span>}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              required={required}
              defaultValue={state?.values?.[name] ?? (employee?.[name] as string | null) ?? ""}
              className={`w-full rounded border ${state?.errors?.[name] ? "border-brick" : "border-line"} px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink`}
            />
            <FieldError errors={state?.errors} name={name} />
          </div>
        ))}
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
          <select id="status" name="status" defaultValue={state?.values?.status ?? employee?.status ?? "active"} className="w-full rounded border border-line px-3 py-2 text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <p className="mt-1 text-xs text-muted">Inactive staff stay in the database but leave the time clock.</p>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <button type="submit" disabled={pending} className="rounded bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60">
            {submitLabel}
          </button>
          <Link href="/employees" className="text-sm text-muted underline underline-offset-2">Cancel</Link>
        </div>
      </div>
    </form>
  );
}
