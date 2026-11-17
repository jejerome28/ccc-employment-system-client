"use client";

import { useActionState } from "react";
import type { ReportSignatory } from "@/app/_lib/types";
import { FieldError } from "../../../_components/FieldError";
import { Notice } from "../../../_components/Notice";
import { saveSignatories } from "../_actions/signatory.action";

const input = "w-full rounded border border-line px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal";

export function SignatoryForm({ signatories }: { signatories: ReportSignatory[] }) {
  const [state, action, pending] = useActionState(saveSignatories, undefined);
  const v = state?.values;

  return (
    <form action={action} className="space-y-3">
      <Notice state={state} />
      {signatories.map((s) => {
        const id = (n: string) => `${n}-${s.id}`;
        return (
          <fieldset key={s.id} className="bg-white border border-line rounded p-4 grid sm:grid-cols-2 gap-3 items-start">
            <legend className="sr-only">Signatory {s.position}</legend>
            <input type="hidden" name="id" value={s.id} />
            <div>
              <label htmlFor={id("label")} className="block text-sm font-medium mb-1">Label</label>
              <input id={id("label")} name={id("label")} required maxLength={60} className={input} defaultValue={v?.[id("label")] ?? s.label} />
              <FieldError errors={state?.errors} name={id("label")} />
            </div>
            <div>
              <label htmlFor={id("name")} className="block text-sm font-medium mb-1">Name</label>
              <input id={id("name")} name={id("name")} required maxLength={120} className={input} defaultValue={v?.[id("name")] ?? s.name} />
              <FieldError errors={state?.errors} name={id("name")} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={id("title")} className="block text-sm font-medium mb-1">Title</label>
              <textarea id={id("title")} name={id("title")} rows={3} required maxLength={300} className={input} defaultValue={v?.[id("title")] ?? s.title} />
              <FieldError errors={state?.errors} name={id("title")} />
            </div>
          </fieldset>
        );
      })}
      <button type="submit" disabled={pending} className="rounded bg-royal px-4 py-2 text-sm font-semibold text-white hover:bg-royal/90 disabled:opacity-60">
        {pending ? "Saving…" : "Save all"}
      </button>
    </form>
  );
}
