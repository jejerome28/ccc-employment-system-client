"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@/app/_lib/types";
import { Brand } from "./Brand";
import { NavLinks } from "./NavLinks";
import { UserBlock } from "./UserBlock";

export function MobileNav({ role, name, email, today }: { role: Role; name: string; email: string; today: string }) {
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  if (openedAt !== null && openedAt !== pathname) setOpenedAt(null);
  const open = openedAt === pathname;
  const close = () => setOpenedAt(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpenedAt(null);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-navy text-canvas">
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <Brand size="sm" />
          <p className="mt-1 text-xs text-canvas/60 tnum">{today}</p>
        </div>
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpenedAt(open ? null : pathname)}
          className="rounded p-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-white/10 pt-3">
          <NavLinks role={role} onNavigate={close} />
          <div className="px-5 py-4 border-t border-white/10">
            <UserBlock name={name} email={email} role={role} />
          </div>
        </div>
      )}
    </header>
  );
}
