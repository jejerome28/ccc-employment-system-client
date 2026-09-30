import type { ActionState } from "@/app/_lib/types";

export function Notice({ state }: { state: ActionState }) {
  if (state?.error) {
    return (
      <div role="alert" className="mb-5 rounded border border-brick/30 bg-brick/10 px-4 py-3 text-sm text-brick">
        {state.errors ? "Check the highlighted fields." : state.error}
      </div>
    );
  }
  if (state?.message) {
    return (
      <div role="status" className="mb-5 rounded border border-moss/30 bg-moss/10 px-4 py-3 text-sm text-moss">
        {state.message}
      </div>
    );
  }
  return null;
}
