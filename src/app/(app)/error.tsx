"use client";

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="rounded border border-brick/30 bg-brick/10 px-4 py-6 text-sm text-brick">
      <p className="font-semibold mb-2">Something went wrong loading this page.</p>
      <button onClick={() => retry()} className="underline underline-offset-2">Try again</button>
    </div>
  );
}
