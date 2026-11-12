"use client";

import { useActionState } from "react";
import type { ReportSignatory } from "@/app/_lib/types";
import { FieldError } from "../../../_components/FieldError";
import { Notice } from "../../../_components/Notice";
import { saveSignatory } from "../_actions/signatory.action";

const input = "w-full rounded border border-line px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";

export function SignatoryForm({ signatory }: { signatory: ReportSignatory }) {
  const [state, action, pending] = useActionState(saveSignatory.bind(null, signatory.id), undefined);
  const v = state?.values;
  const id = (n: string) => `${n}-${signatory.id}`;

  return (
    <form action={action} className="bg-white border border-line rounded p-4 grid sm:grid-cols-2 gap-3 items-start">
      <div className="sm:col-span-2"><Notice state={state} /></div>
      <div>
        <label htmlFor={id("label")} className="block text-sm font-medium mb-1">Label</label>
        <input id={id("label")} name="label" required maxLength={60} className={input} defaultValue={v?.label ?? signatory.label} />
        <FieldError errors={state?.errors} name="label" />
      </div>
      <div>
        <label htmlFor={id("name")} className="block text-sm font-medium mb-1">Name</label>
        <input id={id("name")} name="name" required maxLength={120} className={input} defaultValue={v?.name ?? signatory.name} />
        <FieldError errors={state?.errors} name="name" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={id("title")} className="block text-sm font-medium mb-1">Title</label>
        <textarea id={id("title")} name="title" rows={3} required maxLength={300} className={input} defaultValue={v?.title ?? signatory.title} />
        <FieldError errors={state?.errors} name="title" />
      </div>
      <div>
        <button type="submit" disabled={pending} className="rounded bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60">Save</button>
      </div>
    </form>
  );
}
