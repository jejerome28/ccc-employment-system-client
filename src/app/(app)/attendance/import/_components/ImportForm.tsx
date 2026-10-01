"use client";

import { useActionState } from "react";
import { importAttendance } from "../../_actions/import.action";

const th = "px-4 py-2 font-medium";
const td = "px-4 py-2";

export function ImportForm() {
  const [state, action, pending] = useActionState(importAttendance, undefined);

  return (
    <>
      <form action={action} className="bg-white border border-line rounded p-5 flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <label htmlFor="file" className="block text-sm font-medium mb-1">Attendance report (CSV)</label>
          <input id="file" name="file" type="file" accept=".csv,text/csv" required className="block w-full text-sm" />
        </div>
        <button disabled={pending} className="rounded bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60">
          {pending ? "Importing…" : "Import"}
        </button>
      </form>

      {state?.ok && (
        <div role="status" className="mb-5 rounded border border-moss/30 bg-moss/10 px-4 py-3 text-sm text-moss">
          {state.message} {state.created} created · {state.updated} updated
        </div>
      )}

      {state?.ok && state.unknown.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Not imported — Person ID not found</h2>
          <p className="text-sm text-muted mb-3">Add the Person ID to the employee record, then import the file again.</p>
          <table className="w-full text-sm bg-white border border-line rounded">
            <thead className="text-left text-xs text-muted border-b border-line">
              <tr><th className={th}>Line</th><th className={th}>Person ID</th><th className={th}>Name</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {state.unknown.map((u) => (
                <tr key={u.line}><td className={`${td} tnum`}>{u.line}</td><td className={`${td} tnum`}>{u.person_id}</td><td className={td}>{u.name ?? "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {state && !state.ok && (
        <div role="alert" className="mb-5 rounded border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick">
          {state.message}
        </div>
      )}

      {state && !state.ok && state.rowErrors.length > 0 && (
        <section>
          <h2 className="font-semibold mb-2">Nothing was imported</h2>
          <table className="w-full text-sm bg-white border border-line rounded">
            <thead className="text-left text-xs text-muted border-b border-line">
              <tr><th className={th}>Line</th><th className={th}>Problem</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {state.rowErrors.map((e, i) => (
                <tr key={i}><td className={`${td} tnum`}>{e.line}</td><td className={td}>{e.message}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
