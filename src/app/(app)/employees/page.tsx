import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { apiData } from "@/app/_lib/api.server";
import { GROUPS, groupLabel } from "@/app/_lib/groups";
import { formatClock, formatDate, todayManila } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import { canEdit, currentUser, isAdmin } from "@/app/_lib/role";
import type { Employee, Paginated } from "@/app/_lib/types";
import { KeyedBySearch } from "../_components/KeyedBySearch";
import { PageHeader } from "../_components/PageHeader";
import { Pager } from "../_components/Pager";
import { restoreEmployee } from "./_actions/employee.action";

export const metadata: Metadata = { title: "Employees" };

export default function EmployeesPage(props: PageProps<"/employees">) {
  return (
    <KeyedBySearch searchParams={props.searchParams}>
      <EmployeesContent {...props} />
    </KeyedBySearch>
  );
}

async function EmployeesContent(props: PageProps<"/employees">) {
  const sp = await props.searchParams;
  const q = param(sp.q);
  const status = param(sp.status);
  const group = param(sp.group);
  const page = param(sp.page) || "1";
  const { role } = await currentUser();
  const archived = param(sp.archived) === "1" && isAdmin(role);
  const showActions = archived || canEdit(role);

  const filters = { ...(q && { q }), ...(status && { status }), ...(group && { group }), ...(archived && { archived: "1" }) };
  const { date, items, meta } = await apiData<Paginated<Employee> & { date: string }>(`/api/employees?${new URLSearchParams({ page, ...filters })}`);
  const pageHref = (n: number) => `/employees?${new URLSearchParams({ page: String(n), ...filters })}`;
  const dayLabel = date === todayManila() ? "Today" : formatDate(date, "short");
  const empty = "No employees match this search.";

  const name = (e: Employee) => archived
    ? <span className="font-medium text-muted">{e.full_name}</span>
    : <Link href={`/employees/${e.id}`} className="font-medium hover:underline underline-offset-2">{e.full_name}</Link>;
  const pill = (e: Employee) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.status === "active" ? "bg-moss/10 text-moss" : "bg-ink/10 text-muted"}`}>
      {e.status === "active" ? "Active" : "Inactive"}
    </span>
  );
  const dayTimes = (e: Employee) => `${formatClock(e.today_attendance?.clock_in_at)} – ${formatClock(e.today_attendance?.clock_out_at)}`;
  const action = (e: Employee) => archived ? (
    <form action={restoreEmployee.bind(null, e.id)}>
      <button className="inline-block -m-3 p-3 text-xs font-semibold text-royal hover:text-navy underline underline-offset-2">Restore</button>
    </form>
  ) : (
    <Link href={`/employees/${e.id}/edit`} className="inline-block -m-3 p-3 text-xs font-semibold text-royal hover:text-navy underline underline-offset-2">Edit</Link>
  );

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle={`${meta.total} records`}
        actions={
          <div className="flex items-center gap-3">
            {isAdmin(role) && (
              <Link href={archived ? "/employees" : "/employees?archived=1"} className="text-sm text-muted underline underline-offset-2">
                {archived ? "Show active" : "Show archived"}
              </Link>
            )}
            {canEdit(role) && !archived && (
              <Link href="/employees/new" className="inline-block rounded bg-royal px-4 py-2 text-sm font-semibold text-white hover:bg-royal/90">
                Add employee
              </Link>
            )}
          </div>
        }
      />

      <Form action="" className="mb-5 flex flex-wrap gap-2">
        {archived && <input type="hidden" name="archived" value="1" />}
        <input type="search" name="q" defaultValue={q} placeholder="Search name, code, department"
          className="flex-1 min-w-52 rounded border border-line bg-white px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal" />
        <select name="status" defaultValue={status} className="rounded border border-line bg-white px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select name="group" defaultValue={group} className="rounded border border-line bg-white px-3 py-2 text-sm">
          <option value="">All groups</option>
          {GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          <option value="none">Not set</option>
        </select>
        <button className="rounded border border-royal px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white">Search</button>
        {(q || status || group) && <Link href={archived ? "/employees?archived=1" : "/employees"} className="px-3 py-2 text-sm text-muted underline underline-offset-2">Clear</Link>}
      </Form>

      <div className="hidden md:block bg-white border border-line rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted border-b border-line">
            <tr>
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Position</th>
              <th className="px-4 py-2 font-medium">Department</th>
              <th className="px-4 py-2 font-medium">Group</th>
              <th className="px-4 py-2 font-medium">{dayLabel}</th>
              <th className="px-4 py-2 font-medium">Status</th>
              {showActions && <th className="px-4 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.length === 0 ? (
              <tr><td colSpan={showActions ? 8 : 7} className="px-4 py-10 text-center text-sm text-muted">{empty}</td></tr>
            ) : (
              items.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 tnum">{e.employee_code}</td>
                  <td className="px-4 py-3">{name(e)}</td>
                  <td className="px-4 py-3">{e.position || "—"}</td>
                  <td className="px-4 py-3">{e.department || "—"}</td>
                  <td className="px-4 py-3">{groupLabel(e.employment_group)}</td>
                  <td className="px-4 py-3 tnum text-xs">{dayTimes(e)}</td>
                  <td className="px-4 py-3">{pill(e)}</td>
                  {showActions && <td className="px-4 py-3 text-right">{action(e)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden bg-white border border-line rounded divide-y divide-line">
        {items.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-muted">{empty}</li>
        ) : (
          items.map((e) => (
            <li key={e.id} className="px-4 py-3 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">{name(e)}</div>
                {pill(e)}
              </div>
              <p className="text-xs text-muted">{e.employee_code} · {e.position || "No position set"} · {e.department || "No department"}</p>
              <p className="text-xs text-muted">{groupLabel(e.employment_group)}</p>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-sm tnum"><span className="text-xs text-muted">{dayLabel}</span> {dayTimes(e)}</span>
                {showActions && action(e)}
              </div>
            </li>
          ))
        )}
      </ul>

      <Pager meta={meta} href={pageHref} empty={items.length === 0} />
    </>
  );
}
