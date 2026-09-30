"use client";

import { useActionState } from "react";
import { clock } from "../_actions/clock.action";

export function ClockButton({ employeeId, kind }: { employeeId: number; kind: "time-in" | "time-out" }) {
  const [state, action, pending] = useActionState(clock.bind(null, employeeId, kind), undefined);
  const style = kind === "time-in" ? "bg-moss text-white hover:bg-moss/90" : "bg-ink text-canvas hover:bg-ink/90";

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <button disabled={pending} className={`rounded px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${style}`}>
        {kind === "time-in" ? "Time in" : "Time out"}
      </button>
      {state?.error && <p role="alert" className="text-xs text-brick">{state.error}</p>}
    </form>
  );
}
