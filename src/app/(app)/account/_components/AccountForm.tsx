"use client";

import { useActionState } from "react";
import { FieldError } from "../../_components/FieldError";
import { Notice } from "../../_components/Notice";
import { saveAccount } from "../_actions/account.action";

const input = "w-full rounded border border-line px-3 py-2 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal";

export function AccountForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(saveAccount, undefined);
  const field = (id: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">{label}</label>
      <input id={id} name={id} className={input} {...props} />
      <FieldError errors={state?.errors} name={id} />
    </div>
  );

  return (
    <form action={action} className="bg-white border border-line rounded p-5 space-y-4 max-w-md">
      <Notice state={state} />
      {field("name", "Name", { required: true, defaultValue: state?.values?.name ?? name, autoComplete: "name" })}
      <fieldset className="space-y-4 border-t border-line pt-4">
        <legend className="text-sm text-muted">Change password (optional). You will be signed out everywhere.</legend>
        {field("current_password", "Current password", { type: "password", autoComplete: "current-password" })}
        {field("password", "New password", { type: "password", autoComplete: "new-password", minLength: 8 })}
        {field("password_confirmation", "Confirm new password", { type: "password", autoComplete: "new-password" })}
      </fieldset>
      <button type="submit" disabled={pending} className="rounded bg-royal px-4 py-2 text-sm font-semibold text-white hover:bg-royal/90 disabled:opacity-60">
        Save
      </button>
    </form>
  );
}
