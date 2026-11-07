import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/app/_lib/api.server";
import { currentCutoff, cutoffRange, formatDate } from "@/app/_lib/format";
import { param } from "@/app/_lib/params";
import type { Summary, SummaryNumbers } from "@/app/_lib/types";
import { PageHeader } from "../../_components/PageHeader";

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
const button = "rounded border border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-canvas";

export default async function SummaryPage(props: PageProps<"/attendance/summary">) {
  const sp = await props.searchParams;
  const fallback = currentCutoff();
  const from = param(sp.from) || fallback.from;
  const to = param(sp.to) || fallback.to;
  const exportError = param(sp.export_error);
  const month = from.slice(0, 7);
  const qs = (r: { from: string; to: string }) => `?${new URLSearchParams(r)}`;

  const r = await apiFetch<Summary>(`/api/attendance/summary${qs({ from, to })}`);
  const error = exportError || (!r.ok ? (Object.values(r.errors ?? {})[0]?.[0] ?? r.message) : null);

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
          <input type="date" id="from" name="from" required defaultValue={from} className={field} />
        </div>
        <div>
          <label htmlFor="to" className="block text-xs text-muted mb-1">To</label>
          <input type="date" id="to" name="to" required defaultValue={to} className={field} />
        </div>
        <button className={button}>Show</button>
        <Link href={qs(cutoffRange(month, 1))} className="px-3 py-2 text-sm underline underline-offset-2">1–15</Link>
        <Link href={qs(cutoffRange(month, 2))} className="px-3 py-2 text-sm underline underline-offset-2">16–end</Link>
        {r.ok && (
          <a href={`/attendance/summary/export${qs({ from, to })}`} className={`${button} ml-auto`}>Download .xlsx</a>
        )}
      </form>

      {r.ok && (
        <>
          {r.data.computed_through === null ? (
            <p className="mb-4 text-sm text-muted">No attendance has been imported yet.</p>
          ) : (
            r.data.computed_through < to && (
              <p className="mb-4 text-sm text-muted">
                Only days up to {formatDate(r.data.computed_through, "medium")} are counted — import the rest of the cutoff to include them.
              </p>
            )
          )}

          <div className="bg-white border border-line rounded overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted border-b border-line">
                <tr>
                  <th className="px-4 py-2 font-medium">Person ID</th>
                  <th className="px-4 py-2 font-medium">Employee</th>
                  {COLUMNS.map((c) => <th key={c.key} className="px-3 py-2 font-medium text-right">{c.label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {r.data.rows.length === 0 ? (
                  <tr><td colSpan={COLUMNS.length + 2} className="px-4 py-10 text-center text-sm text-muted">No active employees.</td></tr>
                ) : (
                  r.data.rows.map((row) => (
                    <tr key={row.employee_id}>
                      <td className="px-4 py-3 tnum text-muted">{row.person_id ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Link href={`/employees/${row.employee_id}`} className="font-medium hover:underline underline-offset-2">{row.name}</Link>
                        <p className="text-xs text-muted">{row.department ?? ""}</p>
                      </td>
                      {COLUMNS.map((c) => <td key={c.key} className="px-3 py-3 tnum text-right">{row[c.key]}</td>)}
                    </tr>
                  ))
                )}
              </tbody>
              {r.data.rows.length > 0 && (
                <tfoot className="border-t border-line font-semibold">
                  <tr>
                    <td className="px-4 py-3" colSpan={2}>Total</td>
                    {COLUMNS.map((c) => <td key={c.key} className="px-3 py-3 tnum text-right">{r.data.totals[c.key]}</td>)}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {r.data.needs_check.length > 0 && (
            <>
              <h2 className="font-semibold mb-2">Needs check</h2>
              <p className="text-sm text-muted mb-3">
                Only one punch was recorded. Confirm against the guard logbook, then fix the record. These days aren&apos;t counted until then.
              </p>
              <ul className="bg-white border border-line rounded divide-y divide-line text-sm">
                {r.data.needs_check.map((n) => (
                  <li key={`${n.employee_id}-${n.work_date}`} className="px-4 py-3 flex flex-wrap justify-between gap-2">
                    <span><span className="font-medium">{n.name}</span> · {formatDate(n.work_date, "short")} · one punch at {n.punch}</span>
                    <Link href={`/attendance?date=${n.work_date}`} className="text-xs font-semibold underline underline-offset-2">Open day</Link>
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
