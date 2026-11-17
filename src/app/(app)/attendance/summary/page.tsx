import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch } from "@/app/_lib/api.server";
import { currentCutoff, cutoffFor, cutoffRange, formatDate, todayManila } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import { canEdit, currentUser } from "@/app/_lib/role";
import type { Summary, SummaryNumbers, SummaryRow } from "@/app/_lib/types";
import { PageHeader } from "../../_components/PageHeader";
import { Pager } from "../../_components/Pager";

export const metadata: Metadata = { title: "Cutoff summary" };

const COLUMNS: { key: keyof SummaryNumbers; label: string }[] = [
  { key: "present", label: "Present" },
  { key: "absent", label: "Absent (LWOP)" },
  { key: "late_count", label: "Late (times)" },
  { key: "late_minutes", label: "Late (min)" },
  { key: "undertime_minutes", label: "Undertime (min)" },
  { key: "ot_minutes", label: "OT (min)" },
  { key: "ob", label: "OB" },
  { key: "leave", label: "Leave" },
  { key: "needs_check", label: "Needs check" },
];

const field = "rounded border border-line bg-white px-3 py-2 text-sm";
const button = "rounded border border-royal px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white";

export default async function SummaryPage(props: PageProps<"/attendance/summary">) {
  const sp = await props.searchParams;
  const rangeGiven = Boolean(param(sp.from) || param(sp.to));
  const fallback = currentCutoff();
  const from = param(sp.from) || fallback.from;
  const to = param(sp.to) || fallback.to;
  const q = param(sp.q);
  const page = param(sp.page);
  const exportError = param(sp.export_error);
  const month = from.slice(0, 7);
  const qs = (r: { from: string; to: string }, extra: Record<string, string> = {}) => `?${new URLSearchParams({ ...r, ...extra })}`;
  const keepQ: Record<string, string> = q ? { q } : {};

  const [r, { role }] = await Promise.all([
    apiFetch<Summary>(`/api/attendance/summary${qs({ from, to }, { ...keepQ, ...(page ? { page } : {}) })}`),
    currentUser(),
  ]);

  if (!rangeGiven && !exportError && r.ok && r.data.computed_through !== null && r.data.computed_through < from) {
    redirect(`/attendance/summary${qs(cutoffFor(r.data.computed_through), keepQ)}`);
  }

  const error = exportError || (!r.ok ? (Object.values(r.errors ?? {})[0]?.[0] ?? r.message) : null);
  const sub = (row: SummaryRow) => [row.employee_code, row.department].filter(Boolean).join(" · ");
  const nameLink = (row: SummaryRow) => <Link href={`/employees/${row.employee_id}`} className="font-medium hover:underline underline-offset-2">{row.name}</Link>;
  const numbers = (values: SummaryNumbers) => (
    <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2">
      {COLUMNS.map((c) => (
        <div key={c.key}>
          <dt className="text-[11px] leading-tight text-muted">{c.label}</dt>
          <dd className="tnum font-medium">{values[c.key]}</dd>
        </div>
      ))}
    </dl>
  );

  const emptyText = r.ok && r.data.rows.length === 0 && r.data.meta.total === 0 ? (q ? "No employees match this search." : "No active employees.") : null;

  return (
    <>
      <PageHeader title="Cutoff summary" subtitle={`${formatDate(from, "medium")} – ${formatDate(to, "medium")}`} />

      {error && (
        <div role="alert" className="mb-5 rounded border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick">
          {error}
        </div>
      )}

      <form className="mb-5 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="from" className="block text-xs text-muted mb-1">From</label>
          <input type="date" id="from" name="from" required max={todayManila()} defaultValue={from} className={field} />
        </div>
        <div>
          <label htmlFor="to" className="block text-xs text-muted mb-1">To</label>
          <input type="date" id="to" name="to" required max={todayManila()} defaultValue={to} className={field} />
        </div>
        <div>
          <label htmlFor="q" className="block text-xs text-muted mb-1">Employee</label>
          <input type="search" id="q" name="q" defaultValue={q} placeholder="Search employee" className={field} />
        </div>
        <button className={button}>Show</button>
        <Link href={qs(cutoffRange(month, 1), keepQ)} className="px-3 py-2 text-sm text-royal hover:text-navy underline underline-offset-2">1–15</Link>
        {`${month}-16` <= todayManila() && (
          <Link href={qs(cutoffRange(month, 2), keepQ)} className="px-3 py-2 text-sm text-royal hover:text-navy underline underline-offset-2">16–end</Link>
        )}
        {r.ok && (
          <span className="flex flex-wrap gap-2 sm:ml-auto">
            <a href={`/attendance/summary/export${qs({ from, to })}`} className={button}>Download review (.xlsx)</a>
            <a href={`/attendance/summary/cra${qs({ from, to })}`} className={button}>Download CRA (.xlsx)</a>
          </span>
        )}
      </form>

      {r.ok && (
        <>
          {r.data.ungrouped_count > 0 && (
            <div role="status" className="mb-4 rounded border border-line bg-white px-4 py-3 text-sm">
              {r.data.ungrouped_count} employee(s) have no employment group. They appear under &quot;No group set&quot; in the CRA.{" "}
              <Link href="/employees?group=none" className="font-semibold text-royal hover:text-navy underline underline-offset-2">View</Link>
            </div>
          )}
          {r.data.computed_through === null ? (
            <p className="mb-4 text-sm text-muted">No attendance has been imported yet.</p>
          ) : (
            r.data.computed_through < to && (
              <p className="mb-4 text-sm text-muted">
                Only days up to {formatDate(r.data.computed_through, "medium")} are counted — import the rest of the cutoff to include them.
              </p>
            )
          )}

          <div className="mb-8">
            <div className="hidden md:block bg-white border border-line rounded overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted border-b border-line">
                  <tr>
                    <th className="px-4 py-2 font-medium">Person ID</th>
                    <th className="px-4 py-2 font-medium">Employee</th>
                    {COLUMNS.map((c) => <th key={c.key} className="px-3 py-2 font-medium text-right">{c.label}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {emptyText && <tr><td colSpan={COLUMNS.length + 2} className="px-4 py-10 text-center text-sm text-muted">{emptyText}</td></tr>}
                  {r.data.rows.map((row) => (
                    <tr key={row.employee_id}>
                      <td className="px-4 py-3 tnum text-muted">{row.person_id ?? "—"}</td>
                      <td className="px-4 py-3">
                        {nameLink(row)}
                        <p className="text-xs text-muted">{sub(row)}</p>
                      </td>
                      {COLUMNS.map((c) => <td key={c.key} className="px-3 py-3 tnum text-right">{row[c.key]}</td>)}
                    </tr>
                  ))}
                </tbody>
                {r.data.meta.total > 0 && (
                  <tfoot className="border-t border-line font-semibold">
                    <tr>
                      <td className="px-4 py-3" colSpan={2}>Total</td>
                      {COLUMNS.map((c) => <td key={c.key} className="px-3 py-3 tnum text-right">{r.data.totals[c.key]}</td>)}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <ul className="md:hidden space-y-3">
              {emptyText && <li className="bg-white border border-line rounded px-4 py-10 text-center text-sm text-muted">{emptyText}</li>}
              {r.data.rows.map((row) => (
                <li key={row.employee_id} className="bg-white border border-line rounded px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {nameLink(row)}
                      <p className="text-xs text-muted">{sub(row)}</p>
                    </div>
                    <span className="text-xs text-muted tnum whitespace-nowrap">Person ID {row.person_id ?? "—"}</span>
                  </div>
                  {numbers(row)}
                </li>
              ))}
              {r.data.meta.total > 0 && (
                <li className="bg-white border border-navy rounded px-4 py-3">
                  <p className="font-semibold">Total</p>
                  {numbers(r.data.totals)}
                </li>
              )}
            </ul>

            <Pager meta={r.data.meta} href={(n) => `/attendance/summary${qs({ from, to }, { ...keepQ, page: String(n) })}`} empty={r.data.rows.length === 0} />
          </div>

          {canEdit(role) && r.data.needs_check.length > 0 && (
            <>
              <h2 className="font-heading font-semibold text-navy mb-2">Needs check</h2>
              <p className="text-sm text-muted mb-3">
                Only one punch was recorded. Confirm against the guard logbook, then fix the record. These days aren&apos;t counted until then.
              </p>
              <ul className="bg-white border border-line rounded divide-y divide-line text-sm">
                {r.data.needs_check.map((n) => (
                  <li key={n.attendance_id} className="px-4 py-3 flex flex-wrap justify-between gap-2">
                    <span><span className="font-medium">{n.name}</span> · {formatDate(n.work_date, "short")} · one punch at {n.punch}</span>
                    <Link href={`/attendance/${n.attendance_id}/edit`} className="text-xs font-semibold text-royal hover:text-navy underline underline-offset-2">Open day</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </>
  );
}
