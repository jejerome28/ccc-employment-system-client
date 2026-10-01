import type { Metadata } from "next";
import Link from "next/link";
import { apiData } from "@/app/_lib/api.server";
import { formatClock, formatDate, formatDuration, todayManila } from "@/app/_lib/format";
import type { DashboardData } from "@/app/_lib/types";
import { PageHeader } from "../_components/PageHeader";
import { ClockButton } from "./_components/ClockButton";

export const metadata: Metadata = { title: "Today" };

export default async function DashboardPage() {
  const { stats, hours_today, employees } = await apiData<DashboardData>(`/api/dashboard?date=${todayManila()}`);

  const cards = [
    { label: "On the clock now", value: stats.clocked_in, tone: "text-clay" },
    { label: "Finished for the day", value: stats.completed, tone: "text-moss" },
    { label: "Not yet in", value: stats.not_in, tone: "text-muted" },
    { label: "Hours logged today", value: hours_today.toFixed(2), tone: "text-ink" },
  ];

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={formatDate(todayManila(), "long")}
        actions={
          <Link href="/attendance" className="inline-block rounded border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-canvas">
            Open time records
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded overflow-hidden mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white px-4 py-4">
            <p className={`text-3xl font-bold tnum ${c.tone}`}>{c.value}</p>
            <p className="text-xs text-muted mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-line rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold">Time clock</h2>
          <span className="text-xs text-muted">{stats.active} active employees</span>
        </div>

        {employees.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-muted mb-3">No active employees yet.</p>
            <Link href="/employees/new" className="text-sm font-semibold underline underline-offset-2">Add your first employee</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted border-b border-line">
              <tr>
                <th className="px-4 py-2 font-medium">Employee</th>
                <th className="px-4 py-2 font-medium">Time in</th>
                <th className="px-4 py-2 font-medium">Time out</th>
                <th className="px-4 py-2 font-medium">Worked</th>
                <th className="px-4 py-2 font-medium text-right">Clock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {employees.map((e) => {
                const log = e.today_attendance;
                return (
                  <tr key={e.id}>
                    <td className="px-4 py-3">
                      <Link href={`/employees/${e.id}`} className="font-medium hover:underline underline-offset-2">{e.full_name}</Link>
                      <p className="text-xs text-muted">{e.employee_code} · {e.position || "No position set"}</p>
                    </td>
                    <td className="px-4 py-3 tnum">{formatClock(log?.clock_in_at)}</td>
                    <td className="px-4 py-3 tnum">{formatClock(log?.clock_out_at)}</td>
                    <td className={`px-4 py-3 tnum ${log?.clock_in_at && !log.clock_out_at ? "text-clay" : ""}`}>{formatDuration(log)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {!log?.clock_in_at ? (
                          <ClockButton employeeId={e.id} kind="time-in" />
                        ) : !log.clock_out_at ? (
                          <ClockButton employeeId={e.id} kind="time-out" />
                        ) : (
                          <span className="text-xs text-muted">Done for today</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
