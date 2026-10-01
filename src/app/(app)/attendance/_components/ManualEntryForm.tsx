"use client";

import { useActionState } from "react";
import type { Employee } from "@/app/_lib/types";
import { FieldError } from "../../_components/FieldError";
import { Notice } from "../../_components/Notice";
import { saveAttendance } from "../_actions/attendance.action";

const input = "w-full rounded border border-line px-3 py-2 text-sm";

export function ManualEntryForm({ employees, date }: { employees: Employee[]; date: string }) {
  const [state, action, pending] = useActionState(saveAttendance, undefined);

  return (
    <form action={action}>
      <Notice state={state} />
      <div className="bg-white border border-line rounded p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="lg:col-span-2">
          <label htmlFor="employee_id" className="block text-sm font-medium mb-1">Employee</label>
          <select id="employee_id" name="employee_id" required defaultValue={state?.values?.employee_id} className={input}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>
            ))}
          </select>
          <FieldError errors={state?.errors} name="employee_id" />
        </div>
        <div>
          <label htmlFor="work_date" className="block text-sm font-medium mb-1">Date</label>
          <input id="work_date" name="work_date" type="date" required defaultValue={state?.values?.work_date ?? date} className={input} />
          <FieldError errors={state?.errors} name="work_date" />
        </div>
        <div>
          <label htmlFor="clock_in_at" className="block text-sm font-medium mb-1">Time in</label>
          <input id="clock_in_at" name="clock_in_at" type="time" defaultValue={state?.values?.clock_in_at} className={input} />
          <FieldError errors={state?.errors} name="clock_in_at" />
        </div>
        <div>
          <label htmlFor="clock_out_at" className="block text-sm font-medium mb-1">Time out</label>
          <input id="clock_out_at" name="clock_out_at" type="time" defaultValue={state?.values?.clock_out_at} className={input} />
          <FieldError errors={state?.errors} name="clock_out_at" />
        </div>
        <div className="lg:col-span-4">
          <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes <span className="text-muted font-normal">(optional)</span></label>
          <input id="notes" name="notes" type="text" maxLength={255} defaultValue={state?.values?.notes} placeholder="Half day, field work, forgot to clock out" className={input} />
        </div>
        <div>
          <button disabled={pending} className="w-full rounded bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60">
            Save record
          </button>
        </div>
      </div>
    </form>
  );
}
