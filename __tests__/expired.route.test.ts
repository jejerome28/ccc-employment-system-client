/** @jest-environment node */
import { GET } from "@/app/auth/expired/route";
import { clearSession } from "@/app/_lib/session";

jest.mock("@/app/_lib/session", () => ({ clearSession: jest.fn() }));

it("expired route clears cookie and redirects to /login?expired=1", async () => {
  const res = await GET(new Request("http://localhost:3000/auth/expired"));

  expect(clearSession).toHaveBeenCalled();
  expect(res.status).toBe(307);
  expect(res.headers.get("location")).toBe("http://localhost:3000/login?expired=1");
});
