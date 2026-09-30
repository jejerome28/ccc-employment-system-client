"use client";

export function DeleteButton({ action, confirmText, label }: { action: () => Promise<void>; confirmText: string; label: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm(confirmText)) e.preventDefault(); }}>
      <button className="rounded border border-brick px-4 py-2 text-sm font-semibold text-brick hover:bg-brick hover:text-white">
        {label}
      </button>
    </form>
  );
}
