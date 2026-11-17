"use client";

import { useActionState } from "react";
import { RowErrors } from "@/app/(app)/_components/RowErrors";
import { importRoster } from "../../_actions/roster.action";

export function RosterForm() {
  const [state, action, pending] = useActionState(importRoster, undefined);

  return (
    <>
      <ol className="mb-5 list-decimal pl-5 text-sm text-muted space-y-1 max-w-3xl">
        <li>
          <a href="/templates/employee-roster.xlsx" download className="font-semibold text-royal underline underline-offset-2">Download the roster template</a>{" "}
          and fill in the Roster sheet, one row per employee.
        </li>
        <li>Upload it here. If any row has a problem, nothing is saved: fix the lines listed and upload again.</li>
        <li>Uploading again is safe. Employees are matched by Person ID and updated, archived ones are restored, and blank optional cells keep what is already saved.</li>
      </ol>

      <form action={action} className="bg-white border border-line rounded p-5 flex flex-wrap items-end gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <label htmlFor="file" className="block text-sm font-medium mb-1">Roster (Excel .xlsx)</label>
          <input
            id="file" name="file" type="file" required
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="block w-full text-sm text-muted file:mr-3 file:rounded file:border file:border-royal file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-royal hover:file:bg-royal hover:file:text-white"
          />
        </div>
        <button disabled={pending} className="rounded bg-royal px-4 py-2 text-sm font-semibold text-white hover:bg-royal/90 disabled:opacity-60">
          {pending ? "Importing…" : "Import"}
        </button>
      </form>

      {state?.ok && (
        <div role="status" className="mb-5 rounded border border-moss/30 bg-moss/10 px-4 py-3 text-sm text-moss">
          {state.message} {state.created} created · {state.updated} updated · {state.restored} restored
        </div>
      )}

      {state && !state.ok && (
        <div role="alert" className="mb-5 rounded border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick">
          {state.message}
        </div>
      )}

      {state && !state.ok && <RowErrors rows={state.rowErrors} />}
    </>
  );
}
