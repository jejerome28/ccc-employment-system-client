/** @jest-environment node */
import { importAttendance } from "@/app/(app)/attendance/_actions/import.action";
import { apiFetch } from "@/app/_lib/api.server";
import { revalidatePath } from "next/cache";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const upload = () => {
  const f = new FormData();
  f.set("file", new Blob(["747,263"], { type: "text/csv" }), "report.csv");
  f.set("$ACTION_ID_abc", "");
  return f;
};

beforeEach(() => jest.clearAllMocks());

it("forwards only the file and returns counts and unknown IDs", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: true,
    status: 200,
    message: "Imported 10 rows.",
    data: { created: 10, updated: 0, unknown: [{ line: 12, person_id: "999", name: "Dela Cruz Juan" }] },
  });

  const state = await importAttendance(undefined, upload());

  const [path, init] = (apiFetch as jest.Mock).mock.calls[0];
  expect(path).toBe("/api/attendance/import");
  expect(init.method).toBe("POST");
  expect([...(init.body as FormData).keys()]).toEqual(["file"]);
  expect(state).toEqual({
    ok: true,
    message: "Imported 10 rows.",
    created: 10,
    updated: 0,
    unknown: [{ line: 12, person_id: "999", name: "Dela Cruz Juan" }],
  });
  expect(revalidatePath).toHaveBeenCalledWith("/attendance");
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
});

it("returns line errors when the file has bad rows", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 422,
    message: "The file has errors. Nothing was imported.",
    errors: [{ line: 9, message: 'Date "2026-06-31" is not YYYY-MM-DD.' }],
  });

  const state = await importAttendance(undefined, upload());

  expect(state).toEqual({
    ok: false,
    message: "The file has errors. Nothing was imported.",
    rowErrors: [{ line: 9, message: 'Date "2026-06-31" is not YYYY-MM-DD.' }],
  });
  expect(revalidatePath).not.toHaveBeenCalled();
});

it("shows the file field error instead of the generic message", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 422,
    message: "The given data was invalid.",
    errors: { file: ["The file field must be a file of type: csv, txt."] },
  });

  const state = await importAttendance(undefined, upload());

  expect(state).toEqual({ ok: false, message: "The file field must be a file of type: csv, txt.", rowErrors: [] });
});

it("passes a message-only 422 through", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: false, status: 422, message: "No attendance rows found." });

  expect(await importAttendance(undefined, upload())).toEqual({ ok: false, message: "No attendance rows found.", rowErrors: [] });
});
