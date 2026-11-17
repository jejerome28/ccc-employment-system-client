/** @jest-environment node */
import EditAttendancePage from "@/app/(app)/attendance/[id]/edit/page";
import { apiData } from "@/app/_lib/api.server";
import { currentUser } from "@/app/_lib/role";
import { getToken } from "@/app/_lib/session";

process.env.__NEXT_EXPERIMENTAL_AUTH_INTERRUPTS = "true";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("@/app/_lib/api.server", () => ({ ...jest.requireActual("@/app/_lib/api.server"), apiData: jest.fn() }));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));
jest.mock("@/app/(app)/attendance/_actions/attendance.action", () => ({ deleteAttendance: jest.fn() }));
jest.mock("@/app/(app)/attendance/_components/AttendanceEditForm", () => ({ AttendanceEditForm: () => null }));
jest.mock("@/app/(app)/_components/DeleteButton", () => ({ DeleteButton: () => null }));

const DIGEST = "NEXT_HTTP_ERROR_FALLBACK;403";
const props = { params: Promise.resolve({ id: "1" }) } as never;

const digestOf = async (p: Promise<unknown>) => p.then(() => undefined, (e: { digest?: string }) => e.digest);

describe("403 for role-gated pages", () => {
  beforeEach(() => jest.clearAllMocks());

  it("viewer gets the 403 interrupt and the API is never called", async () => {
    (currentUser as jest.Mock).mockResolvedValue({ role: "viewer" });
    expect(await digestOf(EditAttendancePage(props))).toBe(DIGEST);
    expect(apiData).not.toHaveBeenCalled();
  });

  it("hr proceeds to load the record", async () => {
    (currentUser as jest.Mock).mockResolvedValue({ role: "hr" });
    (apiData as jest.Mock).mockResolvedValue({ attendance: { id: 1, work_date: "2026-01-01", employee: { full_name: "A" } } });
    await EditAttendancePage(props);
    expect(apiData).toHaveBeenCalledWith("/api/attendance/1");
  });
});

describe("apiData 403", () => {
  it("maps an API 403 to the 403 interrupt", async () => {
    const { apiData: real } = jest.requireActual("@/app/_lib/api.server");
    (getToken as jest.Mock).mockResolvedValue("tok");
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ message: "no" }), { status: 403 }));
    expect(await digestOf(real("/api/x"))).toBe(DIGEST);
  });
});
