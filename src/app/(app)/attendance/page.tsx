import type { Metadata } from "next";
import Link from "next/link";
import { apiData } from "@/app/_lib/api.server";
import { formatClock, formatDate, formatDuration, formatMinutes, todayManila } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import type { AttendanceDay } from "@/app/_lib/types";
import { PageHeader } from "../_components/PageHeader";
import { ManualEntryForm } from "./_components/ManualEntryForm";

export const metadata: Metadata = { title: "Time records" };

export default async function AttendancePage(props: PageProps<"/attendance">) {
  const sp = await props.searchParams;
  const date = param(sp.date) || todayManila();
  const q = param(sp.q);
  const exportError = param(sp.export_error);
  const monthStart = `${todayManila().slice(0, 8)}01`;

  const { attendances, total_minutes, employees } = await apiData<AttendanceDay>(
    `/api/attendance?${new URLSearchParams({ date, ...(q && { q }) })}`,
  );

  return (
    <>
      <PageHeader title="Time records" subtitle={formatDate(date, "long")} />

      {exportError && (
        <div role="alert" className="mb-5 rounded border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick">
          {exportError}
        </div>
      )}

      <form action="/attendance/export" method="get" className="mb-5 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="from" className="block text-xs text-muted mb-1">From</label>
          <input type="date" id="from" name="from" required defaultValue={monthStart} className="rounded border border-line bg-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="to" className="block text-xs text-muted mb-1">To</label>
          <input type="date" id="to" name="to" required defaultValue={todayManila()} className="rounded border border-line bg-white px-3 py-2 text-sm" />
        </div>
        <button className="rounded border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-canvas">Download report</button>
      </form>

      <form className="mb-5 flex flex-wrap items-center gap-2">
        <input type="date" name="date" defaultValue={date} className="rounded border border-line bg-white px-3 py-2 text-sm" />
        <input type="search" name="q" defaultValue={q} placeholder="Filter by employee" className="flex-1 min-w-48 rounded border border-line bg-white px-3 py-2 text-sm" />
        <button className="rounded border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-canvas">Show</button>
        <Link href="/attendance" className="px-3 py-2 text-sm text-muted underline underline-offset-2">Today</Link>
      </form>

      <div className="bg-white border border-line rounded overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted border-b border-line">
            <tr>
              <th className="px-4 py-2 font-medium">Employee</th>
              <th className="px-4 py-2 font-medium">Time in</th>
              <th className="px-4 py-2 font-medium">Time out</th>
              <th className="px-4 py-2 font-medium">Worked</th>
              <th className="px-4 py-2 font-medium">Notes</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {attendances.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">Nobody has clocked in on this date yet.</td></tr>
            ) : (
              attendances.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <Link href={`/employees/${a.employee_id}`} className="font-medium hover:underline underline-offset-2">{a.employee?.full_name}</Link>
                    <p className="text-xs text-muted">{a.employee?.employee_code}</p>
                  </td>
                  <td className="px-4 py-3 tnum">{formatClock(a.clock_in_at)}</td>
                  <td className="px-4 py-3 tnum">{formatClock(a.clock_out_at)}</td>
                  <td className="px-4 py-3 tnum">{formatDuration(a)}</td>
                  <td className="px-4 py-3 text-xs text-muted">{a.notes || "—"}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/attendance/${a.id}/edit`} className="text-xs font-semibold underline underline-offset-2">Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {attendances.length > 0 && (
            <tfoot className="border-t border-line">
              <tr>
                <td className="px-4 py-3 text-xs text-muted" colSpan={3}>{attendances.length} records</td>
                <td className="px-4 py-3 tnum font-semibold" colSpan={3}>{formatMinutes(total_minutes)} total</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <h2 className="font-semibold mb-2">Add or correct a record</h2>
      <p className="text-sm text-muted mb-3">
        Use this when someone forgot to clock in, or to fix a wrong time. Saving overwrites the record for that employee and date.
      </p>
      <ManualEntryForm employees={employees} date={date} />
    </>
  );
}
