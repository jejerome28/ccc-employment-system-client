import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { expired } = await props.searchParams;

  return (
    <div className="min-h-full flex flex-wrap bg-canvas text-ink">
      <section className="relative flex-[1_1_480px] min-h-[320px] flex flex-col justify-between gap-6 sm:gap-8 overflow-hidden p-6 sm:p-12 text-white">
        <Image src="/brand/campus.jpg" alt="" fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy/85" />
        <div className="relative flex items-center gap-3.5">
          <Image src="/brand/ccc-logo.png" alt="City College of Calamba shield" width={64} height={64} className="h-16 w-16 object-contain" />
          <div>
            <p className="font-wordmark text-xl font-bold tracking-wide">CITY COLLEGE OF CALAMBA</p>
            <p className="mt-0.5 text-sm italic text-canvas/80">Dalubhasaan ng Lungsod ng Calamba</p>
          </div>
        </div>
        <div className="relative flex max-w-md flex-col gap-3 sm:gap-5">
          <Image src="/brand/hrdu-seal.png" alt="Human Resource Development Unit seal" width={132} height={132} className="h-20 w-20 sm:h-[132px] sm:w-[132px] rounded-full bg-white" />
          <h1 className="font-heading text-3xl sm:text-4xl font-bold leading-tight">Staff Time Records</h1>
          <p className="hidden sm:block text-lg leading-relaxed text-canvas/80">
            Human Resource Development Unit. Import biometric logs, review attendance and generate cutoff reports.
          </p>
          <div className="h-1 w-16 rounded-sm bg-gold" />
        </div>
      </section>
      <section className="flex flex-[1_1_420px] items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-xl border border-line bg-white p-9 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-navy">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted">Sign in to manage employees and daily time in and time out.</p>
          {expired && (
            <p role="status" className="mt-4 rounded bg-clay/20 px-3 py-2 text-sm">
              Your session expired. Sign in again.
            </p>
          )}
          <LoginForm />
          <p className="mt-4 text-xs text-muted">Accounts are issued by the administrator. There is no self sign-up.</p>
        </div>
      </section>
    </div>
  );
}
