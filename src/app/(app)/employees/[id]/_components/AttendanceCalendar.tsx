import Link from "next/link";
import { formatMinutes } from "@/app/_lib/format";
import type { CalendarStatus, EmployeeCalendar } from "@/app/_lib/types";

const PURPLE = "bg-purple-100 text-purple-900";

export const STATUS_CLASS: Record<CalendarStatus, string> = {
  complete: "bg-green-100 text-green-900",
  absent: "bg-red-100 text-red-900",
  undertime: "bg-yellow-100 text-yellow-900",
  late: "bg-orange-100 text-orange-900",
  overtime: "bg-blue-100 text-blue-900",
  ob: PURPLE,
  leave: PURPLE,
  needs_check: "bg-gray-200 text-gray-900",
  off: "", holiday: "", future: "", in_progress: "", rest_day_worked: "",
};

const DOT_CLASS: Partial<Record<CalendarStatus, string>> = {
  complete: "bg-green-500", absent: "bg-red-500", undertime: "bg-yellow-500", late: "bg-orange-500",
  overtime: "bg-blue-500", ob: "bg-purple-500", leave: "bg-purple-500", needs_check: "bg-gray-500",
};

const HEADINGS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function AttendanceCalendar({ cal, canEdit }: { cal: EmployeeCalendar; canEdit: boolean }) {
  const [y, m] = cal.month.split("-").map(Number);
  const t = cal.totals;
  const nav = "text-sm font-semibold underline underline-offset-2";

  return (
    <div className="bg-white border border-line rounded p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Link href={`?month=${cal.prev_month}`} className={nav}>‹ Prev</Link>
        <h2 className="font-semibold">{MONTHS[m - 1]} {y}</h2>
        <Link href={`?month=${cal.next_month}`} className={nav}>Next ›</Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {HEADINGS.map((h) => <div key={h} className="text-xs text-muted">{h}</div>)}
        {Array.from({ length: cal.first_weekday - 1 }, (_, i) => <div key={`pad${i}`} data-pad />)}
        {cal.days.map((d) => {
          const title = d.label + (d.clock_in || d.clock_out ? ` · ${d.clock_in ?? "—"}–${d.clock_out ?? "—"}` : "");
          const aria = `${d.day}: ${title}`;
          const cls = `relative rounded py-2 tnum ${STATUS_CLASS[d.status]}`;
          const body = (
            <>
              {d.day}{d.status === "needs_check" && "!"}
              {d.flags.length > 0 && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {d.flags.map((f) => <span key={f} data-flag className={`size-1.5 rounded-full ${DOT_CLASS[f] ?? "bg-gray-500"}`} />)}
                </span>
              )}
            </>
          );
          return canEdit && d.attendance_id ? (
            <Link key={d.date} data-day href={`/attendance/${d.attendance_id}/edit`} title={title} aria-label={aria} className={`${cls} block hover:ring-2 ring-ink`}>{body}</Link>
          ) : (
            <div key={d.date} data-day title={title} aria-label={aria} className={cls}>{body}</div>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-3 text-xs">
        {cal.legend.map((l) => (
          <li key={l.status} className="flex items-center gap-1">
            <span className={`size-3 rounded ${STATUS_CLASS[l.status]}`} />{l.label}
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted tnum">
        Full {t.complete} · Late {t.late} ({formatMinutes(t.late_minutes)}) · Undertime {t.undertime} ({formatMinutes(t.undertime_minutes)}) ·
        OT {t.overtime} ({formatMinutes(t.ot_minutes)}) · Absent {t.absent} · OB {t.ob} · Leave {t.leave} · Needs check {t.needs_check}
      </p>
    </div>
  );
}
