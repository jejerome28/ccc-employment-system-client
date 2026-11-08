"use client";

import { useActionState } from "react";
import type { User } from "@/app/_lib/types";
import { FieldError } from "../../_components/FieldError";
import { Notice } from "../../_components/Notice";
import { saveUser } from "../_actions/user.action";

const input = "w-full rounded border border-line px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";

// One form for both: a table row when `user` is given, the create form otherwise.
export function UserForm({ user }: { user?: User }) {
  const [state, action, pending] = useActionState(saveUser.bind(null, user?.id ?? null), undefined);
  const v = state?.values;
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`${name}-${user?.id ?? "new"}`} className="block text-sm font-medium mb-1">{label}</label>
      <input id={`${name}-${user?.id ?? "new"}`} name={name} className={input} {...props} />
      <FieldError errors={state?.errors} name={name} />
    </div>
  );

  return (
    <form action={action} className="bg-white border border-line rounded p-4 grid sm:grid-cols-5 gap-3 items-start">
      <div className="sm:col-span-5"><Notice state={state} /></div>
      {field("name", "Name", { required: true, defaultValue: v?.name ?? user?.name ?? "" })}
      {user ? <p className="text-sm pt-8">{user.email}</p> : field("email", "Email", { type: "email", required: true, defaultValue: v?.email ?? "" })}
      <div>
        <label htmlFor={`role-${user?.id ?? "new"}`} className="block text-sm font-medium mb-1">Role</label>
        <select id={`role-${user?.id ?? "new"}`} name="role" defaultValue={v?.role ?? user?.role ?? "viewer"} className={input}>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="viewer">Viewer</option>
        </select>
        <FieldError errors={state?.errors} name="role" />
      </div>
      {field("password", user ? "New password (optional)" : "Password", { type: "password", required: !user, autoComplete: "new-password" })}
      <div className="pt-7">
        <button type="submit" disabled={pending} className="rounded bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60">
          {user ? "Save" : "Create user"}
        </button>
      </div>
    </form>
  );
}
