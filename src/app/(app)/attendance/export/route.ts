import { proxyDownload } from "@/app/_lib/download.server";

export function GET(request: Request) {
  return proxyDownload(request, "/api/attendance/export", "/attendance");
}
