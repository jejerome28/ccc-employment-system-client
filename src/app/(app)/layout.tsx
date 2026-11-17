import Image from "next/image";
import { Suspense, type ReactNode } from "react";
import { formatDate, todayManila } from "@/app/_lib/format";
import { currentUser } from "@/app/_lib/role";
import { Brand } from "./_components/Brand";
import { MobileNav } from "./_components/MobileNav";
import { NavProgress } from "./_components/NavProgress";
import { NavLinks } from "./_components/NavLinks";
import { UserBlock } from "./_components/UserBlock";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const today = formatDate(todayManila(), "medium");

  return (
    <div className="min-h-full lg:flex">
      <Suspense fallback={null}>
        <NavProgress />
      </Suspense>
      <MobileNav role={user.role} name={user.name} email={user.email} today={today} />
      <aside className="hidden lg:flex lg:w-60 lg:flex-none lg:flex-col lg:sticky lg:top-0 lg:self-start lg:h-screen bg-navy text-canvas">
        <div className="px-5 py-5 border-b border-white/10">
          <Brand size="md" />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks role={user.role} />
        </div>
        <div className="px-5 py-4 border-t border-white/10 mt-auto">
          <UserBlock name={user.name} email={user.email} />
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="hidden lg:flex h-[72px] bg-white border-b-[3px] border-gold items-center px-8 relative overflow-hidden">
          <p className="text-sm text-muted tnum">{today}</p>
          <Image src="/brand/building-outline.jpg" alt="" width={288} height={72} className="absolute right-0 top-0 h-[72px] w-auto opacity-20" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
      </main>
    </div>
  );
}
