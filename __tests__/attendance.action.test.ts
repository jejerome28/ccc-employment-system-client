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

it("saveAttendance converts Manila times to UTC ISO, blanks to null", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "Attendance saved.", data: {} });

  const state = await saveAttendance(
    undefined,
    form({ employee_id: "3", work_date: "2026-09-29", clock_in_at: "08:00", clock_out_at: "", notes: "" }),
  );

  expect(apiFetch).toHaveBeenCalledWith("/api/attendance", {
    method: "POST",
    body: { employee_id: 3, work_date: "2026-09-29", clock_in_at: "2026-09-29T00:00:00Z", clock_out_at: null, notes: null },
  });
  expect(state).toEqual({ message: "Attendance saved." });
});

it("updateAttendance moves an overnight time out to the next day and redirects", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "Attendance updated.", data: {} });

  await expect(
    updateAttendance(9, "2026-06-30", { clock_in_at: null, clock_out_at: null }, undefined, form({ clock_in_at: "22:00", clock_out_at: "06:00", notes: "night" })),
  ).rejects.toThrow("NEXT_REDIRECT");

  expect(apiFetch).toHaveBeenCalledWith("/api/attendance/9", {
    method: "PUT",
    body: { clock_in_at: "2026-06-30T14:00:00Z", clock_out_at: "2026-06-30T22:00:00Z", notes: "night" },
  });
  expect(redirect).toHaveBeenCalledWith("/attendance?date=2026-06-30");
});

it("updateAttendance keeps the original ISO (with seconds) for an unchanged time and rebuilds a changed one", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "Attendance updated.", data: {} });

  await expect(
    updateAttendance(
      9,
      "2026-06-22",
      { clock_in_at: "2026-06-21T23:04:14Z", clock_out_at: "2026-06-22T09:00:30Z" },
      undefined,
      form({ clock_in_at: "07:04", clock_out_at: "18:00", notes: "x" }),
    ),
  ).rejects.toThrow("NEXT_REDIRECT");

  expect(apiFetch).toHaveBeenCalledWith("/api/attendance/9", {
    method: "PUT",
    body: { clock_in_at: "2026-06-21T23:04:14Z", clock_out_at: "2026-06-22T10:00:00Z", notes: "x" },
  });
});

it("sends malformed times as typed so the API error lands on the field", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 422,
    message: "The given data was invalid.",
    errors: { clock_in_at: ["The clock in at field must match the format Y-m-d\\TH:i:s\\Z."] },
  });

  const state = await saveAttendance(undefined, form({ employee_id: "3", work_date: "2026-09-29", clock_in_at: "8am" }));

  expect((apiFetch as jest.Mock).mock.calls[0][1].body.clock_in_at).toBe("8am");
  expect(state?.errors?.clock_in_at?.[0]).toMatch(/format/);
  expect(state?.values?.clock_in_at).toBe("8am");
});

it("does not throw on invalid hour/minute like 25:99", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 422,
    message: "The given data was invalid.",
    errors: { clock_in_at: ["The clock in at field must match the format Y-m-d\\TH:i:s\\Z."] },
  });

  const state = await saveAttendance(undefined, form({ employee_id: "3", work_date: "2026-09-29", clock_in_at: "25:99" }));

  expect((apiFetch as jest.Mock).mock.calls[0][1].body.clock_in_at).toBe("25:99");
  expect(state?.errors?.clock_in_at?.[0]).toMatch(/format/);
  expect(state?.values?.clock_in_at).toBe("25:99");
});

it("does not throw on a missing work date", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: false, status: 422, message: "The given data was invalid.", errors: { work_date: ["required"] } });

  const state = await saveAttendance(undefined, form({ employee_id: "3", work_date: "", clock_in_at: "08:00" }));

  expect(state?.errors?.work_date).toEqual(["required"]);
});
