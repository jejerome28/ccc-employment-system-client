import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="min-h-full flex items-center justify-center bg-canvas px-5">
      <div className="max-w-sm text-center">
        <p className="font-heading text-5xl font-bold text-navy">403</p>
        <h1 className="mt-2 font-heading text-xl font-bold text-navy">No access</h1>
        <p className="mt-2 text-sm text-muted">Your account can&apos;t open this page. Ask an administrator if you need it.</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded bg-royal px-4 py-2 text-sm font-semibold text-white hover:bg-royal/90">Back to dashboard</Link>
      </div>
    </div>
  );
}
