/** @jest-environment node */
import AccountPage from "@/app/(app)/account/page";
import { currentUser } from "@/app/_lib/role";

process.env.__NEXT_EXPERIMENTAL_AUTH_INTERRUPTS = "true";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));
jest.mock("@/app/(app)/account/_components/AccountForm", () => ({ AccountForm: () => null }));

const digestOf = async (p: Promise<unknown>) => p.then(() => undefined, (e: { digest?: string }) => e.digest);

it("viewer gets 403", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "viewer", name: "Kiosk", email: "v@x.com" });
  expect(await digestOf(AccountPage())).toBe("NEXT_HTTP_ERROR_FALLBACK;403");
});

it("hr gets the page", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "hr", name: "Ana", email: "hr@x.com" });
  expect(await digestOf(AccountPage())).toBeUndefined();
});
