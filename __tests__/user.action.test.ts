/** @jest-environment node */
import { saveUser } from "@/app/(app)/users/_actions/user.action";
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

it("creates with the exact body", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 201, message: "User created.", data: {} });

  const state = await saveUser(null, undefined, fd({ name: "Ana", email: "a@x.com", password: "secret123", role: "hr" }));

  expect(apiFetch).toHaveBeenCalledWith("/api/users", { method: "POST", body: { name: "Ana", email: "a@x.com", password: "secret123", role: "hr" } });
  expect(revalidatePath).toHaveBeenCalledWith("/users");
  expect(state).toEqual({ message: "User created." });
});

it("update omits an empty password", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "User updated.", data: {} });

  await saveUser(7, undefined, fd({ name: "Ana", role: "viewer", password: "" }));

  expect(apiFetch).toHaveBeenCalledWith("/api/users/7", { method: "PUT", body: { name: "Ana", role: "viewer" } });
});

it("update sends a non-empty password", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "User updated.", data: {} });

  await saveUser(7, undefined, fd({ name: "Ana", role: "viewer", password: "newpass123" }));

  expect(apiFetch).toHaveBeenCalledWith("/api/users/7", { method: "PUT", body: { name: "Ana", role: "viewer", password: "newpass123" } });
});

it("returns 422 field errors (last-admin rule)", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 422,
    message: "The given data was invalid.",
    errors: { role: ["At least one admin is required."] },
  });

  const state = await saveUser(1, undefined, fd({ name: "Root", role: "viewer", password: "" }));

  expect(state?.errors).toEqual({ role: ["At least one admin is required."] });
  expect(revalidatePath).not.toHaveBeenCalled();
});
