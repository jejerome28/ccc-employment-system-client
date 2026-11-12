/** @jest-environment node */
import { saveSignatory } from "@/app/(app)/settings/reports/_actions/signatory.action";
import { apiFetch } from "@/app/_lib/api.server";
import { revalidatePath } from "next/cache";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const fd = (fields: Record<string, string>) => {
  const f = new FormData();
  Object.entries(fields).forEach(([k, v]) => f.set(k, v));
  f.set("$ACTION_ID_abc", "");
  return f;
};

beforeEach(() => jest.clearAllMocks());

it("PUTs the exact body and revalidates", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "Signatory updated.", data: {} });

  const state = await saveSignatory(3, undefined, fd({ label: "Prepared by", name: "ANA", title: "Line 1\nLine 2" }));

  expect(apiFetch).toHaveBeenCalledWith("/api/report-signatories/3", { method: "PUT", body: { label: "Prepared by", name: "ANA", title: "Line 1\nLine 2" } });
  expect(revalidatePath).toHaveBeenCalledWith("/settings/reports");
  expect(state).toEqual({ message: "Signatory updated." });
});

it("returns 422 field errors", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: false, status: 422, message: "The given data was invalid.", errors: { name: ["required"] } });

  const state = await saveSignatory(3, undefined, fd({ label: "x", name: "", title: "t" }));

  expect(state?.errors).toEqual({ name: ["required"] });
  expect(revalidatePath).not.toHaveBeenCalled();
});
