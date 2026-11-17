import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { apiData } from "@/app/_lib/api.server";
import { formatClock, formatDate, formatDuration, formatMinutes, todayManila } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import { canEdit, currentUser } from "@/app/_lib/role";
import type { AttendanceDay } from "@/app/_lib/types";
import { InOutWorked } from "../_components/InOutWorked";
import { KeyedBySearch } from "../_components/KeyedBySearch";
import { PageHeader } from "../_components/PageHeader";
import { Pager } from "../_components/Pager";
import { RemarkBadge, remarkLabel } from "../_components/RemarkBadge";
import { ManualEntryForm } from "./_components/ManualEntryForm";

export const metadata: Metadata = { title: "Time records" };

const field = "rounded border border-line bg-white px-3 py-2 text-sm";
const button = "rounded border border-royal px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white";
const panel = "mb-5 bg-white border border-line rounded";
const summary = "cursor-pointer select-none px-4 py-3 text-sm font-semibold";

export default function AttendancePage(props: PageProps<"/attendance">) {
  return (
    <KeyedBySearch searchParams={props.searchParams}>
      <AttendanceContent {...props} />
    </KeyedBySearch>
  );
}

async function AttendanceContent(props: PageProps<"/attendance">) {
  const sp = await props.searchParams;
  const picked = param(sp.date);
  const q = param(sp.q);
  const page = param(sp.page);
  const exportError = param(sp.export_error);
  const { role } = await currentUser();
  const editable = canEdit(role);
  const monthStart = `${todayManila().slice(0, 8)}01`;

  const { date, attendances, total_minutes, employees, meta } = await apiData<AttendanceDay>(
    `/api/attendance?${new URLSearchParams({ ...(picked && { date: picked }), ...(q && { q }), ...(page && { page }) })}`,
  );
  const pageHref = (n: number) => `/attendance?${new URLSearchParams({ date, ...(q && { q }), page: String(n) })}`;
  const columns = editable ? 6 : 5;
  const rows = attendances.map((a) => ({
    a,
    timeIn: formatClock(a.clock_in_at),
    timeOut: formatClock(a.clock_out_at),
    worked: formatDuration(a),
    notes: a.notes || (remarkLabel(a) ? "" : "—"),
  }));
  const empty = "Nobody has clocked in on this date yet.";
  const edit = (id: number) => <Link href={`/attendance/${id}/edit`} className="inline-block -m-3 p-3 text-xs font-semibold text-royal hover:text-navy underline underline-offset-2">Edit</Link>;

  return (
    <>
      <PageHeader title="Time records" subtitle={formatDate(date, "long")} />

      {exportError && (
        <div role="alert" className="mb-5 rounded border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick">
          {exportError}
        </div>
      )}

      <Form action="" className="mb-5 flex flex-wrap items-center gap-2">
        <input type="date" name="date" aria-label="Day" max={todayManila()} defaultValue={date} className={field} />
        <input type="search" name="q" defaultValue={q} placeholder="Filter by employee" className={`flex-1 min-w-48 ${field}`} />
        <button className={button}>Show</button>
        <Link href={`/attendance?date=${todayManila()}`} className="px-3 py-2 text-sm text-muted underline underline-offset-2">Today</Link>
        <Link href="/attendance" className="px-3 py-2 text-sm text-muted underline underline-offset-2">Latest</Link>
      </Form>

      <details className={panel} open={Boolean(exportError)}>
        <summary className={summary}>Download a date range</summary>
        <form action="/attendance/export" method="get" data-no-progress className="px-4 pb-4 flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="from" className="block text-xs text-muted mb-1">From</label>
            <input type="date" id="from" name="from" required max={todayManila()} defaultValue={monthStart} className={field} />
          </div>
          <div>
            <label htmlFor="to" className="block text-xs text-muted mb-1">To</label>
            <input type="date" id="to" name="to" required max={todayManila()} defaultValue={todayManila()} className={field} />
          </div>
          <button className={button}>Download report</button>
        </form>
      </details>

      {editable && (
        <details className={panel}>
          <summary className={summary}>Add or correct a record</summary>
          <div className="px-4 pb-4">
            <p className="text-sm text-muted mb-3">
              Use this when someone forgot to clock in, to fix a wrong time, or to mark official business or leave (leave the times empty for a whole day). Saving overwrites the record for that employee and date.
            </p>
            <ManualEntryForm employees={employees} date={date} />
          </div>
        </details>
      )}

      <div className="hidden md:block bg-white border border-line rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted border-b border-line">
            <tr>
              <th className="px-4 py-2 font-medium">Employee</th>
              <th className="px-4 py-2 font-medium">Time in</th>
              <th className="px-4 py-2 font-medium">Time out</th>
              <th className="px-4 py-2 font-medium">Worked</th>
              <th className="px-4 py-2 font-medium">Notes</th>
              {editable && <th className="px-4 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {attendances.length === 0 ? (
              meta.total === 0 && <tr><td colSpan={columns} className="px-4 py-10 text-center text-sm text-muted">{empty}</td></tr>
            ) : (
              rows.map(({ a, timeIn, timeOut, worked, notes }) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <Link href={`/employees/${a.employee_id}`} className="font-medium hover:underline underline-offset-2">{a.employee?.full_name}</Link>
                    <p className="text-xs text-muted">{a.employee?.employee_code}</p>
                  </td>
                  <td className="px-4 py-3 tnum">{timeIn}</td>
                  <td className="px-4 py-3 tnum">{timeOut}</td>
                  <td className="px-4 py-3 tnum">{worked}</td>
                  <td className="px-4 py-3 text-xs text-muted"><RemarkBadge a={a} />{notes}</td>
                  {editable && <td className="px-4 py-3 text-right whitespace-nowrap">{edit(a.id)}</td>}
                </tr>
              ))
            )}
          </tbody>
          {attendances.length > 0 && (
            <tfoot className="border-t border-line">
              <tr>
                <td className="px-4 py-3 text-xs text-muted" colSpan={3}>{meta.total} records</td>
                <td className="px-4 py-3 tnum font-semibold" colSpan={columns - 3}>{formatMinutes(total_minutes)} total</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <ul className="md:hidden bg-white border border-line rounded divide-y divide-line">
        {attendances.length === 0 ? (
          meta.total === 0 && <li className="px-4 py-10 text-center text-sm text-muted">{empty}</li>
        ) : (
          <>
            {rows.map(({ a, timeIn, timeOut, worked }) => (
              <li key={a.id} className="px-4 py-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/employees/${a.employee_id}`} className="font-medium hover:underline underline-offset-2">{a.employee?.full_name}</Link>
                    <p className="text-xs text-muted">{a.employee?.employee_code}</p>
                  </div>
                  {editable && edit(a.id)}
                </div>
                <InOutWorked timeIn={timeIn} timeOut={timeOut} worked={worked} />
                {(remarkLabel(a) || a.notes) && <p className="text-xs text-muted"><RemarkBadge a={a} />{a.notes}</p>}
              </li>
            ))}
            <li className="px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted">{meta.total} records</span>
              <span className="text-sm tnum font-semibold">{formatMinutes(total_minutes)} total</span>
            </li>
          </>
        )}
      </ul>

      <Pager meta={meta} href={pageHref} empty={attendances.length === 0} />
    </>
  );
}
