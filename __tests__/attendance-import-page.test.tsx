/** @jest-environment node */
import ImportPage from "@/app/(app)/attendance/import/page";
import { currentUser } from "@/app/_lib/role";

process.env.__NEXT_EXPERIMENTAL_AUTH_INTERRUPTS = "true";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));
jest.mock("@/app/(app)/attendance/import/_components/ImportForm", () => ({ ImportForm: () => null }));

const digestOf = async (p: Promise<unknown>) => p.then(() => undefined, (e: { digest?: string }) => e.digest);

it("viewer gets 403", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "viewer" });
  expect(await digestOf(ImportPage())).toBe("NEXT_HTTP_ERROR_FALLBACK;403");
});

it("hr sees the page", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "hr" });
  expect(await digestOf(ImportPage())).toBeUndefined();
});
