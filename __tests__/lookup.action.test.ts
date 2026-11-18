/** @jest-environment node */
import { lookupEmployee } from "@/app/(app)/employees/_actions/lookup.action";
import { apiFetch } from "@/app/_lib/api.server";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  Object.entries(o).forEach(([k, v]) => f.set(k, v));
  f.set("$ACTION_ID_abc", "");
  return f;
};

beforeEach(() => jest.clearAllMocks());

it("POSTs only employee_code (trimmed) and month", async () => {
  const data = { employee: { full_name: "Ana Cruz" } };
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "OK", data });

  const state = await lookupEmployee(undefined, fd({ employee_code: " EMP-1003 ", month: "2026-10" }));

  expect(apiFetch).toHaveBeenCalledWith("/api/lookup", { method: "POST", body: { employee_code: "EMP-1003", month: "2026-10" } });
  expect(state).toEqual({ result: data, code: "EMP-1003" });
});

it("omits month when empty", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "OK", data: {} });
  await lookupEmployee(undefined, fd({ employee_code: "EMP-1003", month: "" }));
  expect(apiFetch).toHaveBeenCalledWith("/api/lookup", { method: "POST", body: { employee_code: "EMP-1003" } });
});

it("blank code never calls the API", async () => {
  expect(await lookupEmployee(undefined, fd({ employee_code: "  " }))).toEqual({ error: "Enter your employee code." });
  expect(apiFetch).not.toHaveBeenCalled();
});

it("404 shows the API message and keeps the code", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: false, status: 404, message: "No employee with that employee code." });
  expect(await lookupEmployee(undefined, fd({ employee_code: "EMP-9999" }))).toEqual({ error: "No employee with that employee code.", code: "EMP-9999" });
});

it("422 shows the first field error", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: false, status: 422, message: "The given data was invalid.", errors: { month: ["The month field must be a date before or equal to 2026-11."] } });
  const state = await lookupEmployee(undefined, fd({ employee_code: "EMP-1003", month: "2026-12" }));
  expect(state?.error).toBe("The month field must be a date before or equal to 2026-11.");
});
