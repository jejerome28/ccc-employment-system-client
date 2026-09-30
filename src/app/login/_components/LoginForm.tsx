"use client";

import { useActionState } from "react";
import { login } from "../_actions/login.action";

const input =
  "w-full rounded border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const error = state?.errors ? Object.values(state.errors)[0]?.[0] : state?.error;

  return (
    <form action={action} className="mt-8 bg-canvas text-ink rounded-lg p-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input id="email" name="email" type="email" required autoFocus defaultValue={state?.values?.email ?? ""} className={input} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input id="password" name="password" type="password" required className={input} />
      </div>
      {error && <p role="alert" className="text-sm text-brick">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-ink px-4 py-2.5 text-sm font-semibold text-canvas hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
