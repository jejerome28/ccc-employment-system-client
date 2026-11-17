/** @jest-environment node */
import ImportEmployeesPage from "@/app/(app)/employees/import/page";
import { currentUser } from "@/app/_lib/role";

process.env.__NEXT_EXPERIMENTAL_AUTH_INTERRUPTS = "true";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));
jest.mock("@/app/(app)/employees/import/_components/RosterForm", () => ({ RosterForm: () => null }));

const digestOf = async (p: Promise<unknown>) => p.then(() => undefined, (e: { digest?: string }) => e.digest);

it("viewer gets 403", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "viewer" });
  expect(await digestOf(ImportEmployeesPage())).toBe("NEXT_HTTP_ERROR_FALLBACK;403");
});

it("hr sees the page", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "hr" });
  expect(await digestOf(ImportEmployeesPage())).toBeUndefined();
});
