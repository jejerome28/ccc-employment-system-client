/** @jest-environment node */
import { login } from "@/app/login/_actions/login.action";
import { apiFetch } from "@/app/_lib/api.server";
import { setSession } from "@/app/_lib/session";
import { redirect } from "next/navigation";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("@/app/_lib/session", () => ({ setSession: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v));
  fd.set("$ACTION_ID_abc", "");
  return fd;
};

beforeEach(() => jest.clearAllMocks());

it("posts only email + password, stores the token and redirects", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: true,
    status: 200,
    message: "Logged in.",
    data: { token: "1|abc", expires_at: "2026-09-30T16:00:00+08:00" },
  });

  await expect(login(undefined, form({ email: "a@b.c", password: "pw" }))).rejects.toThrow("NEXT_REDIRECT");

  expect(apiFetch).toHaveBeenCalledWith("/api/login", { method: "POST", body: { email: "a@b.c", password: "pw" } });
  expect(setSession).toHaveBeenCalledWith("1|abc", "2026-09-30T16:00:00+08:00");
  expect(redirect).toHaveBeenCalledWith("/dashboard");
});

it("login returns API message on 401", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: false, status: 401, message: "Invalid credentials." });

  const state = await login(undefined, form({ email: "a@b.c", password: "bad" }));

  expect(state).toEqual({ error: "Invalid credentials.", errors: undefined, values: { email: "a@b.c" } });
  expect(setSession).not.toHaveBeenCalled();
});
