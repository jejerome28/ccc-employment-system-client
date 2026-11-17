"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/app/_lib/types";

const NAV = [
  { href: "/dashboard", label: "Today" },
  { href: "/employees", label: "Employees" },
  { href: "/attendance", label: "Time records" },
  { href: "/attendance/summary", label: "Cutoff summary" },
  { href: "/attendance/import", label: "Import", editor: true },
  { href: "/users", label: "Users", admin: true },
  { href: "/settings/reports", label: "Report settings", admin: true },
];

export function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const links = NAV.filter((n) => (!n.admin || role === "admin") && (!n.editor || role !== "viewer"));

  return (
    <nav className="pb-4">
      {links.map(({ href, label }) => {
        const deeper = links.some((n) => n.href.length > href.length && pathname.startsWith(n.href));
        const active = pathname === href || (pathname.startsWith(`${href}/`) && !deeper);
        return (
          <Link
            key={href}
            aria-current={active ? "page" : undefined}
            href={href}
            onClick={onNavigate}
            className={`block whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold px-5 py-2.5 text-sm border-l-4 ${
              active
                ? "border-gold bg-white/10 text-white font-semibold"
                : "border-transparent text-canvas/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
