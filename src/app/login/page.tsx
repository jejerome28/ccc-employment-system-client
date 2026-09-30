import type { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { expired } = await props.searchParams;

  return (
    <div className="min-h-full bg-ink text-canvas flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">Staff Time Records</h1>
        <p className="mt-1 text-sm text-canvas/60">Sign in to manage employees and daily time in and time out.</p>
        {expired && (
          <p role="status" className="mt-4 rounded bg-clay/20 px-3 py-2 text-sm">
            Your session expired. Sign in again.
          </p>
        )}
        <LoginForm />
        <p className="mt-4 text-xs text-canvas/50">Accounts are issued by the administrator. There is no self sign-up.</p>
      </div>
    </div>
  );
}
