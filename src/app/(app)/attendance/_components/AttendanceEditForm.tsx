"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Attendance } from "@/app/_lib/types";
import { toClockInput } from "@/app/_lib/format";
import { FieldError } from "../../_components/FieldError";
import { Notice } from "../../_components/Notice";
import { updateAttendance } from "../_actions/attendance.action";

const input = "w-full rounded border border-line px-3 py-2 text-sm";

export function AttendanceEditForm({ attendance: a }: { attendance: Attendance }) {
  const [state, action, pending] = useActionState(updateAttendance.bind(null, a.id, a.work_date, { clock_in_at: a.clock_in_at, clock_out_at: a.clock_out_at }), undefined);

  return (
    <form action={action} className="max-w-xl">
      <Notice state={state} />
      <div className="bg-white border border-line rounded p-6 grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="clock_in_at" className="block text-sm font-medium mb-1">Time in</label>
          <input id="clock_in_at" name="clock_in_at" type="time" defaultValue={state?.values?.clock_in_at ?? toClockInput(a.clock_in_at)} className={input} />
          <FieldError errors={state?.errors} name="clock_in_at" />
        </div>
        <div>
          <label htmlFor="clock_out_at" className="block text-sm font-medium mb-1">Time out</label>
          <input id="clock_out_at" name="clock_out_at" type="time" defaultValue={state?.values?.clock_out_at ?? toClockInput(a.clock_out_at)} className={input} />
          <FieldError errors={state?.errors} name="clock_out_at" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes <span className="text-muted font-normal">(optional)</span></label>
          <input id="notes" name="notes" type="text" maxLength={255} defaultValue={state?.values?.notes ?? a.notes ?? ""} className={input} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
          <button disabled={pending} className="rounded bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60">Save changes</button>
          <Link href={`/attendance?date=${a.work_date}`} className="text-sm text-muted underline underline-offset-2">Cancel</Link>
        </div>
      </div>
    </form>
  );
}
