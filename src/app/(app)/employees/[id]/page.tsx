import Link from "next/link";
import { apiData } from "@/app/_lib/api.server";
import { groupLabel } from "@/app/_lib/groups";
import { formatClock, formatDate, formatDuration, formatMinutes, thisMonthManila } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import { canEdit, currentUser } from "@/app/_lib/role";
import type { EmployeeCalendar, EmployeeDetail } from "@/app/_lib/types";
import { AttendanceCalendar } from "./_components/AttendanceCalendar";
import { PageHeader } from "../../_components/PageHeader";
import { InOutWorked } from "../../_components/InOutWorked";

export default async function EmployeePage(props: PageProps<"/employees/[id]">) {
  const { id } = await props.params;
  const { role } = await currentUser();
  const month = param((await props.searchParams).month) || thisMonthManila();
  const q = encodeURIComponent(month);
  const [{ employee: e, attendances, total_minutes, days_present }, cal] = await Promise.all([
    apiData<EmployeeDetail>(`/api/employees/${id}?month=${q}`),
    apiData<EmployeeCalendar>(`/api/employees/${id}/calendar?month=${q}`),
  ]);

  const details: [string, string][] = [
    ["Department", e.department || "—"],
    ["Group", groupLabel(e.employment_group)],
    ["Email", e.email || "—"],
    ["Phone", e.phone || "—"],
    ["Hired", e.hire_date ? formatDate(e.hire_date, "medium") : "—"],
    ["Status", e.status === "active" ? "Active" : "Inactive"],
  ];

  const editable = canEdit(role);
  const rows = attendances.map((a) => ({
    a,
    day: formatDate(a.work_date, "short"),
    timeIn: formatClock(a.clock_in_at),
    timeOut: formatClock(a.clock_out_at),
    worked: formatDuration(a),
  }));
  const empty = "No time records for this month.";
  const edit = (id: number) => <Link href={`/attendance/${id}/edit`} className="inline-block -m-3 p-3 text-xs font-semibold text-royal hover:text-navy underline underline-offset-2">Edit</Link>;

  return (
    <>
      <PageHeader
        title={e.full_name}
        subtitle={`${e.employee_code} · ${e.position || "No position set"}`}
        actions={
          editable && (
            <Link href={`/employees/${e.id}/edit`} className="inline-block rounded border border-royal px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white">
              Edit details
            </Link>
          )
        }
      />
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="bg-white border border-line rounded p-5 text-sm space-y-3">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0 last:pb-0">
              <span className="text-muted">{label}</span>
              <span className="text-right font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <AttendanceCalendar cal={cal} canEdit={editable} />
          <form className="flex flex-wrap items-center gap-2">
            <label htmlFor="month" className="text-sm text-muted">Month</label>
            <input type="month" id="month" name="month" max={thisMonthManila()} defaultValue={month} className="rounded border border-line bg-white px-3 py-2 text-sm" />
            <button className="rounded border border-royal px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white">Show</button>
            <span className="ml-auto text-sm text-muted tnum">
              {days_present} days · <strong className="text-ink">{formatMinutes(total_minutes)}</strong> total
            </span>
          </form>

          <div className="hidden md:block bg-white border border-line rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted border-b border-line">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Time in</th>
                  <th className="px-4 py-2 font-medium">Time out</th>
                  <th className="px-4 py-2 font-medium">Worked</th>
                  <th className="px-4 py-2 font-medium">Notes</th>
                  {editable && <th className="px-4 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.length === 0 ? (
                  <tr><td colSpan={editable ? 6 : 5} className="px-4 py-10 text-center text-sm text-muted">{empty}</td></tr>
                ) : (
                  rows.map(({ a, day, timeIn, timeOut, worked }) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 tnum">{day}</td>
                      <td className="px-4 py-3 tnum">{timeIn}</td>
                      <td className="px-4 py-3 tnum">{timeOut}</td>
                      <td className="px-4 py-3 tnum">{worked}</td>
                      <td className="px-4 py-3 text-muted text-xs">{a.notes || "—"}</td>
                      {editable && <td className="px-4 py-3 text-right">{edit(a.id)}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden bg-white border border-line rounded divide-y divide-line">
            {rows.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-muted">{empty}</li>
            ) : (
              rows.map(({ a, day, timeIn, timeOut, worked }) => (
                <li key={a.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium tnum">{day}</span>
                    {editable && edit(a.id)}
                  </div>
                  <InOutWorked timeIn={timeIn} timeOut={timeOut} worked={worked} />
                  {a.notes && <p className="text-xs text-muted">{a.notes}</p>}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
