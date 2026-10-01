import Link from "next/link";
import { apiData } from "@/app/_lib/api.server";
import { formatClock, formatDate, formatDuration, formatMinutes, thisMonthManila } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import type { EmployeeDetail } from "@/app/_lib/types";
import { PageHeader } from "../../_components/PageHeader";

export default async function EmployeePage(props: PageProps<"/employees/[id]">) {
  const { id } = await props.params;
  const month = param((await props.searchParams).month) || thisMonthManila();
  const { employee: e, attendances, total_minutes, days_present } = await apiData<EmployeeDetail>(
    `/api/employees/${id}?month=${encodeURIComponent(month)}`,
  );

  const details: [string, string][] = [
    ["Department", e.department || "—"],
    ["Email", e.email || "—"],
    ["Phone", e.phone || "—"],
    ["Hired", e.hire_date ? formatDate(e.hire_date, "medium") : "—"],
    ["Status", e.status === "active" ? "Active" : "Inactive"],
  ];

  return (
    <>
      <PageHeader
        title={e.full_name}
        subtitle={`${e.employee_code} · ${e.position || "No position set"}`}
        actions={
          <Link href={`/employees/${e.id}/edit`} className="inline-block rounded border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-canvas">
            Edit details
          </Link>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white border border-line rounded p-5 text-sm space-y-3">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0 last:pb-0">
              <span className="text-muted">{label}</span>
              <span className="text-right font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <form className="flex flex-wrap items-center gap-2">
            <label htmlFor="month" className="text-sm text-muted">Month</label>
            <input type="month" id="month" name="month" defaultValue={month} className="rounded border border-line bg-white px-3 py-2 text-sm" />
            <button className="rounded border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-canvas">Show</button>
            <span className="ml-auto text-sm text-muted tnum">
              {days_present} days · <strong className="text-ink">{formatMinutes(total_minutes)}</strong> total
            </span>
          </form>

          <div className="bg-white border border-line rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted border-b border-line">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Time in</th>
                  <th className="px-4 py-2 font-medium">Time out</th>
                  <th className="px-4 py-2 font-medium">Worked</th>
                  <th className="px-4 py-2 font-medium">Notes</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {attendances.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">No time records for this month.</td></tr>
                ) : (
                  attendances.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 tnum">{formatDate(a.work_date, "short")}</td>
                      <td className="px-4 py-3 tnum">{formatClock(a.clock_in_at)}</td>
                      <td className="px-4 py-3 tnum">{formatClock(a.clock_out_at)}</td>
                      <td className="px-4 py-3 tnum">{formatDuration(a)}</td>
                      <td className="px-4 py-3 text-muted text-xs">{a.notes || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/attendance/${a.id}/edit`} className="text-xs font-semibold underline underline-offset-2">Edit</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
