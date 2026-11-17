import { render, screen } from "@testing-library/react";
import EditEmployeePage from "@/app/(app)/employees/[id]/edit/page";
import { apiData } from "@/app/_lib/api.server";
import { currentUser } from "@/app/_lib/role";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("@/app/_lib/api.server", () => ({ apiData: jest.fn() }));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));
jest.mock("@/app/(app)/employees/_actions/employee.action", () => ({ saveEmployee: jest.fn(), deleteEmployee: jest.fn() }));

const employee = { id: 7, employee_code: "CCC-0007", first_name: "Ana", last_name: "Cruz", full_name: "Ana Cruz", status: "active" };

test("edit page loads the employee with the month the API requires", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "admin" });
  (apiData as jest.Mock).mockImplementation(async (path: string) => {
    if (!/\?month=\d{4}-\d{2}$/.test(path)) throw new Error("API 422: The month field is required.");
    return { employee, attendances: [], total_minutes: 0, days_present: 0 };
  });

  render(await EditEmployeePage({ params: Promise.resolve({ id: "7" }) } as never));

  expect(screen.getByRole("heading", { level: 1, name: "Edit Ana Cruz" })).toBeTruthy();
  expect((apiData as jest.Mock).mock.calls[0][0]).toMatch(/^\/api\/employees\/7\?month=\d{4}-\d{2}$/);
});
