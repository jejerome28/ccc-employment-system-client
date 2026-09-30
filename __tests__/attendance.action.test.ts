/** @jest-environment node */
import { saveAttendance, updateAttendance } from "@/app/(app)/attendance/_actions/attendance.action";
import { apiFetch } from "@/app/_lib/api.server";
import { redirect } from "next/navigation";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  Object.entries(fields).forEach(([k, v]) => f.set(k, v));
  f.set("$ACTION_ID_abc", "");
  return f;
};

beforeEach(() => jest.clearAllMocks());

it("saveAttendance sends numeric employee_id, blank times as null", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "Attendance saved.", data: {} });

  const state = await saveAttendance(undefined, form({ employee_id: "3", work_date: "2026-09-29", time_in: "08:00", time_out: "", notes: "" }));

  expect(apiFetch).toHaveBeenCalledWith("/api/attendance", {
    method: "POST",
    body: { employee_id: 3, work_date: "2026-09-29", time_in: "08:00", time_out: null, notes: null },
  });
  expect(state).toEqual({ message: "Attendance saved." });
});

it("updateAttendance sends only time fields and redirects to the day", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "Attendance updated.", data: {} });

  await expect(
    updateAttendance(9, "2026-09-29", undefined, form({ time_in: "22:00", time_out: "06:00", notes: "night" })),
  ).rejects.toThrow("NEXT_REDIRECT");

  expect(apiFetch).toHaveBeenCalledWith("/api/attendance/9", {
    method: "PUT",
    body: { time_in: "22:00", time_out: "06:00", notes: "night" },
  });
  expect(redirect).toHaveBeenCalledWith("/attendance?date=2026-09-29");
});

it("returns field errors on 422", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 422,
    message: "The given data was invalid.",
    errors: { work_date: ["The work date field must be a date before or equal to today."] },
  });

  const state = await saveAttendance(undefined, form({ employee_id: "3", work_date: "2099-01-01" }));

  expect(state?.errors?.work_date?.[0]).toMatch(/before or equal to today/);
});
