/** @jest-environment node */
import { saveAccount } from "@/app/(app)/account/_actions/account.action";
import { apiFetch } from "@/app/_lib/api.server";
import { clearSession } from "@/app/_lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("@/app/_lib/session", () => ({ clearSession: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));

const fd = (fields: Record<string, string>) => {
  const f = new FormData();
  Object.entries(fields).forEach(([k, v]) => f.set(k, v));
  f.set("$ACTION_ID_abc", "");
  return f;
};
const ok = { ok: true, status: 200, message: "Account updated.", data: {} };

beforeEach(() => jest.clearAllMocks());

it("name only: sends just the name, stays signed in", async () => {
  (apiFetch as jest.Mock).mockResolvedValue(ok);

  const state = await saveAccount(undefined, fd({ name: "Ana", current_password: "", password: "", password_confirmation: "" }));

  expect(apiFetch).toHaveBeenCalledWith("/api/me", { method: "PUT", body: { name: "Ana" } });
  expect(clearSession).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  expect(state).toEqual({ message: "Account updated." });
});

it("password change: exact body, clears cookie, sends to login", async () => {
  (apiFetch as jest.Mock).mockResolvedValue(ok);

  await saveAccount(undefined, fd({ name: "Ana", current_password: "oldpass12", password: "newpass12", password_confirmation: "newpass12" }));

  expect(apiFetch).toHaveBeenCalledWith("/api/me", {
    method: "PUT",
    body: { name: "Ana", current_password: "oldpass12", password: "newpass12", password_confirmation: "newpass12" },
  });
  expect(clearSession).toHaveBeenCalled();
  expect(redirect).toHaveBeenCalledWith("/login?changed=1");
});

it("422: returns field errors, keeps name, never echoes passwords, keeps session", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false, status: 422, message: "The given data was invalid.", errors: { current_password: ["The password is incorrect."] },
  });

  const state = await saveAccount(undefined, fd({ name: "Ana", current_password: "bad", password: "newpass12", password_confirmation: "newpass12" }));

  expect(state).toEqual({
    error: "The given data was invalid.",
    errors: { current_password: ["The password is incorrect."] },
    values: { name: "Ana" },
  });
  expect(clearSession).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
});

const pw = (current_password: string, password: string, password_confirmation: string) =>
  fd({ name: "Ana", current_password, password, password_confirmation });

it.each([
  ["current only", pw("oldpass12", "", ""), { password: ["Enter a new password."] }],
  ["new without current", pw("", "newpass12", "newpass12"), { current_password: ["Enter your current password."] }],
  ["too short", pw("oldpass12", "short", "short"), { password: ["New password must be at least 8 characters."] }],
  ["mismatch", pw("oldpass12", "newpass12", "newpass13"), { password_confirmation: ["Passwords do not match."] }],
])("client validation: %s — field errors, no API call", async (_label, form, errors) => {
  const state = await saveAccount(undefined, form);

  expect(apiFetch).not.toHaveBeenCalled();
  expect(state).toEqual({ error: "Check the password fields.", errors, values: { name: "Ana" } });
  expect(clearSession).not.toHaveBeenCalled();
});
