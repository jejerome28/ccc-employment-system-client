"use client";

import { useActionState, useEffect, useState } from "react";
import { formatClock, formatDate, formatDuration, formatMinutes, thisMonthManila } from "@/app/_lib/format";
import { lookupEmployee } from "../_actions/lookup.action";
import type { EmployeeLookup as Lookup } from "@/app/_lib/types";
import { AttendanceCalendar } from "../[id]/_components/AttendanceCalendar";
import { InOutWorked } from "../../_components/InOutWorked";

const IDLE_MS = 60_000;
const field = "rounded border border-line bg-white px-3 py-2 text-sm";
const button = "rounded border border-royal px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white";

export function EmployeeLookup() {
  const [round, setRound] = useState(0);
  return <LookupForm key={round} onDone={() => setRound((n) => n + 1)} />;
}

function LookupForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(lookupEmployee, undefined);
  const shown = Boolean(state);

  useEffect(() => {
    if (!shown) return;
    let t = setTimeout(onDone, IDLE_MS);
    const bump = () => { clearTimeout(t); t = setTimeout(onDone, IDLE_MS); };
    const events = ["pointerdown", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, bump));
    return () => { clearTimeout(t); events.forEach((e) => window.removeEventListener(e, bump)); };
  }, [shown, onDone]);

  return (
    <>
      <form action={action} className="mb-5 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="employee_code" className="block text-xs text-muted mb-1">Employee code</label>
          <input id="employee_code" name="employee_code" required autoFocus autoComplete="off" placeholder="EMP-1009" defaultValue={state?.code} className={field} />
        </div>
        {state?.result && (
          <div>
            <label htmlFor="month" className="block text-xs text-muted mb-1">Month</label>
            <input type="month" id="month" name="month" max={thisMonthManila()} defaultValue={state.result.calendar.month} className={field} />
          </div>
        )}
        <button disabled={pending} className={button}>{pending ? "Looking up…" : "Look up"}</button>
        {shown && <button type="button" onClick={onDone} className="px-3 py-2 text-sm text-muted underline underline-offset-2">Done</button>}
      </form>

      {state?.error && (
        <div role="alert" className="mb-5 rounded border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick">{state.error}</div>
      )}
      {state?.result && <LookupResult data={state.result} />}
    </>
  );
}

function LookupResult({ data }: { data: Lookup }) {
  const [open, setOpen] = useState(false);
  const e = data.employee;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-line rounded px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div>
          <p className="font-medium">{e.full_name}</p>
          <p className="text-xs text-muted">{[e.employee_code, e.position, e.department].filter(Boolean).join(" · ")}</p>
        </div>
        <span className="text-xs text-muted tnum">Person ID <span className="text-ink">{e.person_id}</span></span>
        <button type="button" onClick={() => setOpen((o) => !o)} className={button}>{open ? "Hide details" : "View details"}</button>
      </div>

      {open && (
        <>
          <AttendanceCalendar cal={data.calendar} canEdit={false} nav={false} />
          <p className="text-sm text-muted tnum">
            {data.days_present} days · <strong className="text-ink">{formatMinutes(data.total_minutes)}</strong> total
          </p>
          <ul className="bg-white border border-line rounded divide-y divide-line">
            {data.attendances.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-muted">No time records for this month.</li>
            ) : (
              data.attendances.map((a) => (
                <li key={a.id} className="px-4 py-3 space-y-2">
                  <span className="font-medium tnum">{formatDate(a.work_date, "short")}</span>
                  <InOutWorked timeIn={formatClock(a.clock_in_at)} timeOut={formatClock(a.clock_out_at)} worked={formatDuration(a)} />
                  {a.notes && <p className="text-xs text-muted">{a.notes}</p>}
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
}
