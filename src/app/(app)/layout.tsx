import type { ReactNode } from "react";
import { apiData } from "@/app/_lib/api.server";
import { formatDate, todayManila } from "@/app/_lib/format";
import type { User } from "@/app/_lib/types";
import { NavLinks } from "./_components/NavLinks";
import { logout } from "./_actions/logout.action";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await apiData<{ user: User }>("/api/me");

  return (
    <div className="min-h-full lg:flex">
      <aside className="lg:w-60 lg:flex-none bg-ink text-canvas lg:min-h-screen lg:flex lg:flex-col">
        <div className="px-5 py-5">
          <p className="text-base font-bold leading-tight">Staff Time Records</p>
          <p className="text-xs text-canvas/60 tnum">{formatDate(todayManila(), "medium")}</p>
        </div>
        <NavLinks />
        <div className="px-5 py-4 border-t border-white/10 lg:mt-auto">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-canvas/55 mb-2">{user.email}</p>
          <form action={logout}>
            <button type="submit" className="text-xs text-canvas/75 underline underline-offset-2 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
      </main>
    </div>
  );
}
