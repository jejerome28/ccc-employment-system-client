/** @jest-environment node */
import { GET } from "@/app/(app)/attendance/export/route";
import { getToken } from "@/app/_lib/session";

jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));

const fetchMock = jest.fn();
global.fetch = fetchMock;

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const request = (qs: string) => new Request(`http://localhost:3000/attendance/export?${qs}`);

beforeEach(() => {
  jest.clearAllMocks();
  process.env.API_URL = "http://api.test";
  (getToken as jest.Mock).mockResolvedValue("tok");
});

it("proxies the xlsx with the bearer token", async () => {
  fetchMock.mockResolvedValue(
    new Response("PK-bytes", {
      status: 200,
      headers: { "Content-Type": XLSX, "Content-Disposition": 'attachment; filename="attendance_2026-06-01_2026-06-30.xlsx"' },
    }),
  );

  const res = await GET(request("from=2026-06-01&to=2026-06-30"));

  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("http://api.test/api/attendance/export?from=2026-06-01&to=2026-06-30");
  expect(init.headers).toMatchObject({ Authorization: "Bearer tok", Accept: "application/json" });
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe(XLSX);
  expect(res.headers.get("content-disposition")).toContain("attendance_2026-06-01_2026-06-30.xlsx");
  expect(await res.text()).toBe("PK-bytes");
});

it("sends an expired session to /auth/expired", async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: false, message: "Unauthenticated.", data: null }), { status: 401 }));

  const res = await GET(request("from=2026-06-01&to=2026-06-30"));

  expect(res.status).toBe(307);
  expect(res.headers.get("location")).toBe("http://localhost:3000/auth/expired");
});

it("sends a bad range back to the attendance page with the first error", async () => {
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({ success: false, message: "The given data was invalid.", data: { errors: { to: ["Range is at most 366 days."] } } }),
      { status: 422 },
    ),
  );

  const res = await GET(request("from=2026-01-01&to=2027-06-01"));

  expect(res.status).toBe(307);
  expect(res.headers.get("location")).toBe(
    "http://localhost:3000/attendance?export_error=Range+is+at+most+366+days.",
  );
});

it("handles non-JSON error responses (e.g. 502 HTML) with fallback message", async () => {
  fetchMock.mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 }));

  const res = await GET(request("from=2026-06-01&to=2026-06-30"));

  expect(res.status).toBe(307);
  expect(res.headers.get("location")).toBe(
    "http://localhost:3000/attendance?export_error=Export+failed.+Try+again.",
  );
});
