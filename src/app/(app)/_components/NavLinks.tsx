"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/app/_lib/types";

const NAV = [
  { href: "/dashboard", label: "Today" },
  { href: "/employees", label: "Employees" },
  { href: "/attendance", label: "Time records" },
  { href: "/attendance/summary", label: "Cutoff summary" },
  { href: "/attendance/import", label: "Import", admin: true },
  { href: "/users", label: "Users", admin: true },
];

export function NavLinks({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = NAV.filter((n) => !n.admin || role === "admin");

  return (
    <nav className="px-3 pb-4 flex lg:block gap-1 overflow-x-auto">
      {links.map(({ href, label }) => {
        const deeper = links.some((n) => n.href.length > href.length && pathname.startsWith(n.href));
        const active = pathname === href || (pathname.startsWith(`${href}/`) && !deeper);
        return (
          <Link
            key={href}
            href={href}
            className={`block whitespace-nowrap rounded px-3 py-2 text-sm transition ${
              active ? "bg-canvas text-ink font-semibold" : "text-canvas/75 hover:bg-white/10"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
