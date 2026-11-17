/** @jest-environment node */
import { importRoster } from "@/app/(app)/employees/_actions/roster.action";
import { apiFetch } from "@/app/_lib/api.server";
import { revalidatePath } from "next/cache";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const upload = () => {
  const f = new FormData();
  f.set("file", new Blob(["PK"]), "roster.xlsx");
  f.set("$ACTION_ID_abc", "");
  return f;
};

beforeEach(() => jest.clearAllMocks());

it("forwards only the file and returns the counts", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: true, status: 200, message: "Saved 3 employees.", data: { created: 1, updated: 1, restored: 1 },
  });

  const state = await importRoster(undefined, upload());

  const [path, init] = (apiFetch as jest.Mock).mock.calls[0];
  expect(path).toBe("/api/employees/import");
  expect(init.method).toBe("POST");
  expect([...(init.body as FormData).keys()]).toEqual(["file"]);
  expect(state).toEqual({ ok: true, message: "Saved 3 employees.", created: 1, updated: 1, restored: 1 });
  expect(revalidatePath).toHaveBeenCalledWith("/employees");
});

it("returns line errors and does not revalidate", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false, status: 422, message: "The file has errors. Nothing was imported.",
    errors: [{ line: 3, message: "The Hire date field is required." }],
  });

  expect(await importRoster(undefined, upload())).toEqual({
    ok: false,
    message: "The file has errors. Nothing was imported.",
    rowErrors: [{ line: 3, message: "The Hire date field is required." }],
  });
  expect(revalidatePath).not.toHaveBeenCalled();
});

it("shows the file field error", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false, status: 422, message: "The given data was invalid.",
    errors: { file: ["The file field must have one of the following extensions: xlsx."] },
  });

  expect(await importRoster(undefined, upload())).toEqual({
    ok: false, message: "The file field must have one of the following extensions: xlsx.", rowErrors: [],
  });
});
