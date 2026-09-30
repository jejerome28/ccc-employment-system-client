import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/app/_lib/cookie";

// Optimistic only: checks the cookie exists. The API's 401 is the real check (see api.server.ts).
export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has(SESSION_COOKIE);
  const isLogin = request.nextUrl.pathname === "/login";

  if (!hasToken && !isLogin) return NextResponse.redirect(new URL("/login", request.url));
  if (hasToken && isLogin) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/expired).*)"],
};
