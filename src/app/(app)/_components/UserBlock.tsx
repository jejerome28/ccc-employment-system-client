import Link from "next/link";
import type { Role } from "@/app/_lib/types";
import { logout } from "../_actions/logout.action";

export function UserBlock({ name, email, role }: { name: string; email: string; role: Role }) {
  return (
    <>
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-canvas/55 mb-2">{email}</p>
      {role !== "viewer" && (
        <Link href="/account" className="block mb-1 text-xs text-canvas/80 underline underline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
          My account
        </Link>
      )}
      <form action={logout}>
        <button type="submit" className="text-xs text-gold font-semibold underline underline-offset-2 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
          Sign out
        </button>
      </form>
    </>
  );
}
