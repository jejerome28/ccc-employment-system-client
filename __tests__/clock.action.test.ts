/** @jest-environment node */
import { clock } from "@/app/(app)/dashboard/_actions/clock.action";
import { apiFetch } from "@/app/_lib/api.server";
import { revalidatePath } from "next/cache";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

afterEach(() => jest.useRealTimers());

it("times in for Manila's today and revalidates both views", async () => {
  jest.useFakeTimers({ now: new Date("2026-09-30T16:30:00Z") });
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "Timed in.", data: {} });

  const state = await clock(7, "time-in", undefined, new FormData());

  expect(apiFetch).toHaveBeenCalledWith("/api/employees/7/time-in", { method: "POST", body: { work_date: "2026-10-01" } });
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  expect(revalidatePath).toHaveBeenCalledWith("/attendance");
  expect(state).toEqual({ message: "Timed in." });
});

it("returns the 409 message", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 409,
    message: "Maria Santos already timed in at 8:05 AM.",
  });

  const state = await clock(7, "time-in", undefined, new FormData());

  expect(state).toEqual({ error: "Maria Santos already timed in at 8:05 AM." });
  expect(revalidatePath).not.toHaveBeenCalled();
});
