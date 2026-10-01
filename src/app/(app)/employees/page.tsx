import type { Metadata } from "next";
import Link from "next/link";
import { apiData } from "@/app/_lib/api.server";
import { formatClock, todayManila } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import type { Employee, Paginated } from "@/app/_lib/types";
import { PageHeader } from "../_components/PageHeader";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage(props: PageProps<"/employees">) {
  const sp = await props.searchParams;
  const q = param(sp.q);
  const status = param(sp.status);
  const page = param(sp.page) || "1";

  const query = new URLSearchParams({ page, date: todayManila(), ...(q && { q }), ...(status && { status }) });
  const { items, meta } = await apiData<Paginated<Employee>>(`/api/employees?${query}`);
  const pageHref = (n: number) => `/employees?${new URLSearchParams({ page: String(n), ...(q && { q }), ...(status && { status }) })}`;

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle={`${meta.total} records`}
        actions={
          <Link href="/employees/new" className="inline-block rounded bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink/90">
            Add employee
          </Link>
        }
      />

      <form className="mb-5 flex flex-wrap gap-2">
        <input type="search" name="q" defaultValue={q} placeholder="Search name, code, department"
          className="flex-1 min-w-52 rounded border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink" />
        <select name="status" defaultValue={status} className="rounded border border-line bg-white px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="rounded border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-canvas">Search</button>
        {(q || status) && <Link href="/employees" className="px-3 py-2 text-sm text-muted underline underline-offset-2">Clear</Link>}
      </form>

      <div className="bg-white border border-line rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted border-b border-line">
            <tr>
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Position</th>
              <th className="px-4 py-2 font-medium">Department</th>
              <th className="px-4 py-2 font-medium">Today</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">No employees match this search.</td></tr>
            ) : (
              items.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 tnum text-muted">{e.employee_code}</td>
                  <td className="px-4 py-3">
                    <Link href={`/employees/${e.id}`} className="font-medium hover:underline underline-offset-2">{e.full_name}</Link>
                  </td>
                  <td className="px-4 py-3">{e.position || "—"}</td>
                  <td className="px-4 py-3">{e.department || "—"}</td>
                  <td className="px-4 py-3 tnum text-xs">
                    {formatClock(e.today_attendance?.clock_in_at)} – {formatClock(e.today_attendance?.clock_out_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.status === "active" ? "bg-moss/10 text-moss" : "bg-ink/10 text-muted"}`}>
                      {e.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/employees/${e.id}/edit`} className="text-xs font-semibold underline underline-offset-2">Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.last_page > 1 && (
        <nav className="mt-4 flex items-center gap-3 text-sm">
          {meta.current_page > 1 && <Link href={pageHref(meta.current_page - 1)} className="underline underline-offset-2">Previous</Link>}
          <span className="text-muted tnum">Page {meta.current_page} of {meta.last_page}</span>
          {meta.current_page < meta.last_page && <Link href={pageHref(meta.current_page + 1)} className="underline underline-offset-2">Next</Link>}
        </nav>
      )}
    </>
  );
}
