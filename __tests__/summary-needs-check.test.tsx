import type React from "react";
import { render, screen } from "@testing-library/react";
import SummaryPage from "@/app/(app)/attendance/summary/page";
import { apiFetch } from "@/app/_lib/api.server";
import { currentUser } from "@/app/_lib/role";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("@/app/_lib/role", () => ({ ...jest.requireActual("@/app/_lib/role"), currentUser: jest.fn() }));

const zero = { present: 0, absent: 0, late_count: 0, late_minutes: 0, undertime_minutes: 0, ot_minutes: 0, ob: 0, leave: 0, needs_check: 1 };
const data = {
  from: "2026-11-01", to: "2026-11-15", computed_through: "2026-11-15", ungrouped_count: 0,
  rows: [], totals: zero, meta: { total: 0 },
  needs_check: [{ attendance_id: 42, employee_id: 7, name: "Ana Cruz", work_date: "2026-11-03", punch: "08:00" }],
};
const props = { searchParams: Promise.resolve({ from: "2026-11-01", to: "2026-11-15" }) } as never;

async function renderAs(role: string, needs_check = data.needs_check) {
  (currentUser as jest.Mock).mockResolvedValue({ role });
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, message: "", data: { ...data, needs_check } });
  const content = (SummaryPage(props) as React.ReactElement<{ children: React.ReactElement }>).props.children;
  render(await (content.type as (p: unknown) => Promise<React.ReactElement>)(content.props));
}

describe("summary needs-check section", () => {
  it.each(["admin", "hr"])("%s sees it with an edit link", async (role) => {
    await renderAs(role);
    expect(screen.getByRole("heading", { name: "Needs check" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open day" }).getAttribute("href")).toBe("/attendance/42/edit");
  });

  it("viewer does not see it", async () => {
    await renderAs("viewer");
    expect(screen.queryByRole("heading", { name: "Needs check" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Open day" })).toBeNull();
  });
});
