import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { apiData } from "@/app/_lib/api.server";
import { formatClock, formatDate, formatDuration, formatMinutes, todayManila } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import { canEdit, currentUser } from "@/app/_lib/role";
import type { Attendance, DashboardData } from "@/app/_lib/types";
import { InOutWorked } from "../_components/InOutWorked";
import { KeyedBySearch } from "../_components/KeyedBySearch";
import { PageHeader } from "../_components/PageHeader";
import { Pager } from "../_components/Pager";
import { RemarkBadge } from "../_components/RemarkBadge";
import { ClockButton } from "./_components/ClockButton";

const CLOCK_BUTTONS = false;

export const metadata: Metadata = { title: "Today" };

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <KeyedBySearch searchParams={props.searchParams}>
      <DashboardContent {...props} />
    </KeyedBySearch>
  );
}

async function DashboardContent(props: PageProps<"/dashboard">) {
  const sp = await props.searchParams;
  const q = param(sp.q);
  const page = param(sp.page);
  const { date, stats, hours_today, employees, meta } = await apiData<DashboardData>(
    `/api/dashboard?${new URLSearchParams({ ...(q && { q }), ...(page && { page }) })}`,
  );
  const pageHref = (n: number) => `/dashboard?${new URLSearchParams({ ...(q && { q }), page: String(n) })}`;
  const { role } = await currentUser();
  const isToday = date === todayManila();
  const clock = CLOCK_BUTTONS && canEdit(role);

  const cards = [
    { label: isToday ? "On the clock now" : "No time out", value: stats.clocked_in, tone: "text-clay" },
    { label: "Finished for the day", value: stats.completed, tone: "text-moss" },
    { label: "No punches", value: stats.not_in, tone: "text-muted" },
    { label: "Hours logged", value: formatMinutes(Math.round(hours_today * 60)), tone: "text-ink" },
  ];

  const rows = employees.map((e) => {
    const log = e.today_attendance;
    return {
      e,
      log,
      timeIn: formatClock(log?.clock_in_at),
      timeOut: formatClock(log?.clock_out_at),
      worked: formatDuration(log),
      stillIn: Boolean(log?.clock_in_at && !log.clock_out_at),
    };
  });

  const clockAction = (id: number, log: Attendance | null | undefined) =>
    !log?.clock_in_at ? <ClockButton employeeId={id} kind="time-in" />
      : !log.clock_out_at ? <ClockButton employeeId={id} kind="time-out" />
      : <span className="text-xs text-muted">Done for today</span>;

  return (
    <>
      <PageHeader
        title={isToday ? "Today" : "Latest imported day"}
        subtitle={formatDate(date, "long")}
        actions={
          <Link href="/attendance" className="inline-block rounded border border-royal px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white">
            Open time records
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded overflow-hidden mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white px-4 py-4">
            <p className={`text-2xl sm:text-3xl font-bold tnum ${c.tone}`}>{c.value}</p>
            <p className="text-xs text-muted mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <Form action="" className="mb-5 flex flex-wrap gap-2">
        <input type="search" name="q" defaultValue={q} placeholder="Search employee" className="flex-1 min-w-52 rounded border border-line bg-white px-3 py-2 text-sm" />
        <button className="rounded border border-royal px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white">Search</button>
        {q && <Link href="/dashboard" className="px-3 py-2 text-sm text-muted underline underline-offset-2">Clear</Link>}
      </Form>

      <div className="bg-white border border-line rounded overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="font-heading font-semibold text-navy">Time clock</h2>
          <span className="text-xs text-muted">{stats.active} active employees</span>
        </div>

        {employees.length === 0 ? (
          meta.total === 0 && <div className="px-4 py-10 text-center">
            <p className="text-sm text-muted mb-3">{q ? "No employees match this search." : "No active employees yet."}</p>
            {!q && canEdit(role) && <Link href="/employees/new" className="text-sm font-semibold text-royal hover:text-navy underline underline-offset-2">Add your first employee</Link>}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted border-b border-line">
                  <tr>
                    <th className="px-4 py-2 font-medium">Employee</th>
                    <th className="px-4 py-2 font-medium">Time in</th>
                    <th className="px-4 py-2 font-medium">Time out</th>
                    <th className="px-4 py-2 font-medium">Worked</th>
                    {clock && <th className="px-4 py-2 font-medium text-right">Clock</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map(({ e, log, timeIn, timeOut, worked, stillIn }) => (
                    <tr key={e.id}>
                      <td className="px-4 py-3">
                        <Link href={`/employees/${e.id}`} className="font-medium hover:underline underline-offset-2">{e.full_name}</Link>
                        <p className="text-xs text-muted">{e.employee_code} · {e.position || "No position set"}</p>
                      </td>
                      <td className="px-4 py-3 tnum">{timeIn}</td>
                      <td className="px-4 py-3 tnum">{timeOut}</td>
                      <td className={`px-4 py-3 tnum ${stillIn ? "text-clay" : ""}`}>
                        <RemarkBadge a={log} />{worked}
                      </td>
                      {clock && <td className="px-4 py-3"><div className="flex justify-end">{clockAction(e.id, log)}</div></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden divide-y divide-line">
              {rows.map(({ e, log, timeIn, timeOut, worked, stillIn }) => (
                <li key={e.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/employees/${e.id}`} className="font-medium hover:underline underline-offset-2">{e.full_name}</Link>
                      <p className="text-xs text-muted">{e.employee_code} · {e.position || "No position set"}</p>
                    </div>
                    <RemarkBadge a={log} />
                  </div>
                  <InOutWorked timeIn={timeIn} timeOut={timeOut} worked={worked} warn={stillIn} />
                  {clock && <div>{clockAction(e.id, log)}</div>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Pager meta={meta} href={pageHref} empty={employees.length === 0} />
    </>
  );
}
