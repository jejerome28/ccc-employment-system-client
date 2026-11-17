/** @jest-environment node */
import { saveSignatories } from "@/app/(app)/settings/reports/_actions/signatory.action";
import { apiFetch } from "@/app/_lib/api.server";
import { revalidatePath } from "next/cache";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const fd = () => {
  const f = new FormData();
  for (const [id, label, name, title] of [["3", "Prepared by", "ANA", "Line 1\nLine 2"], ["4", "Checked by", "", "HRDU"], ["5", "Attested by", "BEN", "VP"]]) {
    f.append("id", id);
    f.set(`label-${id}`, label);
    f.set(`name-${id}`, name);
    f.set(`title-${id}`, title);
  }
  f.set("$ACTION_ID_abc", "");
  return f;
};
const ok = { ok: true, status: 200, message: "Signatory updated.", data: {} };

beforeEach(() => jest.clearAllMocks());

it("PUTs every block with an exact body, then revalidates once", async () => {
  (apiFetch as jest.Mock).mockResolvedValue(ok);

  const state = await saveSignatories(undefined, fd());

  expect(apiFetch).toHaveBeenNthCalledWith(1, "/api/report-signatories/3", { method: "PUT", body: { label: "Prepared by", name: "ANA", title: "Line 1\nLine 2" } });
  expect(apiFetch).toHaveBeenNthCalledWith(3, "/api/report-signatories/5", { method: "PUT", body: { label: "Attested by", name: "BEN", title: "VP" } });
  expect(revalidatePath).toHaveBeenCalledTimes(1);
  expect(revalidatePath).toHaveBeenCalledWith("/settings/reports");
  expect(state).toEqual({ message: "Signatories saved." });
});

it("stops at the first failing block and points errors at its fields", async () => {
  (apiFetch as jest.Mock)
    .mockResolvedValueOnce(ok)
    .mockResolvedValueOnce({ ok: false, status: 422, message: "The given data was invalid.", errors: { name: ["The name field is required."] } });

  const state = await saveSignatories(undefined, fd());

  expect(apiFetch).toHaveBeenCalledTimes(2);
  expect(state?.errors).toEqual({ "name-4": ["The name field is required."] });
  expect(state?.values?.["label-4"]).toBe("Checked by");
  expect(state?.values).not.toHaveProperty("$ACTION_ID_abc");
  expect(state?.error).toBe("Block 2: The given data was invalid.");
  expect(revalidatePath).not.toHaveBeenCalled();
});

it("rejects id 0 before any API call", async () => {
  const f = new FormData();
  f.append("id", "0");
  f.set("label-0", "x");
  f.set("name-0", "y");
  f.set("title-0", "z");

  const state = await saveSignatories(undefined, f);

  expect(apiFetch).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(state?.error).toBe("Invalid request.");
});

it("rejects a non-numeric id before any API call", async () => {
  const f = new FormData();
  f.append("id", "3/../users");
  f.set("label-3/../users", "x");
  f.set("name-3/../users", "y");
  f.set("title-3/../users", "z");

  const state = await saveSignatories(undefined, f);

  expect(apiFetch).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(state?.error).toBe("Invalid request.");
});
