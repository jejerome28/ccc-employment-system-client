import { NextResponse } from "next/server";
import { clearSession } from "@/app/_lib/session";

export async function GET(request: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/login?expired=1", request.url));
}
