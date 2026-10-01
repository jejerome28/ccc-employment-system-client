import { NextResponse } from "next/server";
import { getToken } from "@/app/_lib/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qs = new URLSearchParams({ from: searchParams.get("from") ?? "", to: searchParams.get("to") ?? "" });
  const token = await getToken();

  const res = await fetch(`${process.env.API_URL}/api/attendance/export?${qs}`, {
    headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    cache: "no-store",
  });

  if (res.status === 401) return NextResponse.redirect(new URL("/auth/expired", request.url));

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const first = Object.values<string[]>(json.data?.errors ?? {})[0]?.[0];
    const back = new URL("/attendance", request.url);
    back.searchParams.set("export_error", first ?? json.message ?? "Export failed. Try again.");
    return NextResponse.redirect(back);
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? "attachment",
    },
  });
}
