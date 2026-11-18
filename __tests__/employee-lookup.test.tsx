import type React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { EmployeeLookup } from "@/app/(app)/employees/_components/EmployeeLookup";
import EmployeesPage from "@/app/(app)/employees/page";
import { lookupEmployee } from "@/app/(app)/employees/_actions/lookup.action";
import { apiData } from "@/app/_lib/api.server";
import { currentUser } from "@/app/_lib/role";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("@/app/_lib/api.server", () => ({ apiData: jest.fn(), apiFetch: jest.fn() }));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));
jest.mock("@/app/(app)/employees/_actions/lookup.action", () => ({ lookupEmployee: jest.fn() }));
jest.mock("@/app/(app)/employees/_actions/employee.action", () => ({ restoreEmployee: jest.fn() }));
jest.mock("next/navigation", () => ({ usePathname: () => "/employees" }));

const result = {
  employee: { full_name: "Ana Cruz", employee_code: "EMP-1", person_id: "1003", position: "Clerk", department: "HRDU", employment_group: null, status: "active" },
  calendar: {
    month: "2026-10", prev_month: "2026-09", next_month: "2026-11", first_weekday: 4, days: [],
    totals: { complete: 0, late: 0, undertime: 0, overtime: 0, absent: 0, ob: 0, leave: 0, needs_check: 0, late_minutes: 0, undertime_minutes: 0, ot_minutes: 0 },
    legend: [],
  },
  attendances: [], total_minutes: 0, days_present: 0,
};

async function lookUp(code = "EMP-1") {
  (lookupEmployee as jest.Mock).mockResolvedValue({ result, code });
  render(<EmployeeLookup />);
  fireEvent.change(screen.getByLabelText("Employee code"), { target: { value: code } });
  fireEvent.click(screen.getByRole("button", { name: "Look up" }));
  await screen.findByText("Ana Cruz");
}

afterEach(() => jest.useRealTimers());

it("shows one row, details on demand, no links with ids", async () => {
  await lookUp();
  expect(screen.getByText("1003")).toBeTruthy();
  expect(screen.queryByText("October 2026")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "View details" }));
  expect(screen.getByText("October 2026")).toBeTruthy();
  expect(screen.queryAllByRole("link")).toHaveLength(0);
});

it("Done clears the result and the input", async () => {
  await lookUp();
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(screen.queryByText("Ana Cruz")).toBeNull();
  expect((screen.getByLabelText("Employee code") as HTMLInputElement).value).toBe("");
});

it("clears after 60 s idle; activity restarts the timer", async () => {
  await lookUp();
  jest.useFakeTimers();
  fireEvent.keyDown(window, { key: "Shift" });
  act(() => jest.advanceTimersByTime(59_999));
  expect(screen.getByText("Ana Cruz")).toBeTruthy();
  act(() => jest.advanceTimersByTime(1));
  expect(screen.queryByText("Ana Cruz")).toBeNull();
});

it("shows the API error", async () => {
  (lookupEmployee as jest.Mock).mockResolvedValue({ error: "No employee with that employee code.", code: "EMP-9" });
  render(<EmployeeLookup />);
  fireEvent.change(screen.getByLabelText("Employee code"), { target: { value: "EMP-9" } });
  fireEvent.click(screen.getByRole("button", { name: "Look up" }));
  expect((await screen.findByRole("alert")).textContent).toBe("No employee with that employee code.");
});

it("/employees renders the lookup for viewers without listing employees", async () => {
  (currentUser as jest.Mock).mockResolvedValue({ role: "viewer" });
  const props = { searchParams: Promise.resolve({}) } as never;
  const content = (EmployeesPage(props) as React.ReactElement<{ children: React.ReactElement }>).props.children;
  render(await (content.type as (p: unknown) => Promise<React.ReactElement>)(content.props));
  expect(screen.getByLabelText("Employee code")).toBeTruthy();
  expect(apiData).not.toHaveBeenCalled();
});
