import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./cookie";

export async function setSession(token: string, expiresAt: string | null): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt ? new Date(expiresAt) : undefined,
  });
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Only callable from Server Actions and Route Handlers (not during Server Component render).
export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
