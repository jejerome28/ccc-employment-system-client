/** @jest-environment node */
import { Suspense, isValidElement } from "react";
import { KeyedBySearch } from "@/app/(app)/_components/KeyedBySearch";
import DashboardPage from "@/app/(app)/dashboard/page";
import AttendancePage from "@/app/(app)/attendance/page";
import SummaryPage from "@/app/(app)/attendance/summary/page";
import EmployeesPage from "@/app/(app)/employees/page";
import EmployeePage from "@/app/(app)/employees/[id]/page";
import { currentUser } from "@/app/_lib/role";

jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("@/app/_lib/api.server", () => ({ apiData: jest.fn(), apiFetch: jest.fn() }));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));

test("a new query gives the boundary a new key", async () => {
  const a = await KeyedBySearch({ searchParams: Promise.resolve({ q: "ana" }), children: null });
  const b = await KeyedBySearch({ searchParams: Promise.resolve({ q: "ana", page: "2" }), children: null });
  expect(a.type).toBe(Suspense);
  expect(a.key).not.toBe(b.key);
});

test.each([
  ["dashboard", DashboardPage],
  ["attendance", AttendancePage],
  ["summary", SummaryPage],
  ["employees", EmployeesPage],
  ["employee", EmployeePage],
])("%s page wraps its content in KeyedBySearch", async (_, Page) => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "hr" });
  const props = { params: Promise.resolve({ id: "7" }), searchParams: Promise.resolve({}) } as never;
  const el = await (Page as (p: never) => unknown)(props);
  expect(isValidElement(el) && el.type).toBe(KeyedBySearch);
});
