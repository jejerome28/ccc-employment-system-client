/** @jest-environment node */
import DashboardPage from "@/app/(app)/dashboard/page";
import { apiData } from "@/app/_lib/api.server";
import { currentUser } from "@/app/_lib/role";
import { redirect } from "next/navigation";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("@/app/_lib/api.server", () => ({ apiData: jest.fn() }));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn(() => { throw new Error("NEXT_REDIRECT"); }) }));

const props = { searchParams: Promise.resolve({}) } as never;

beforeEach(() => jest.clearAllMocks());

it("sends viewers to /employees before loading the dashboard", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "viewer" });
  await expect(DashboardPage(props)).rejects.toThrow("NEXT_REDIRECT");
  expect(redirect).toHaveBeenCalledWith("/employees");
  expect(apiData).not.toHaveBeenCalled();
});

it("hr gets the dashboard", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "hr" });
  await DashboardPage(props);
  expect(redirect).not.toHaveBeenCalled();
});
