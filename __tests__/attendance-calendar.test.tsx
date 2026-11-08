import { render, screen } from "@testing-library/react";
import { AttendanceCalendar } from "@/app/(app)/employees/[id]/_components/AttendanceCalendar";
import type { CalendarDay, EmployeeCalendar } from "@/app/_lib/types";

const day = (n: number, o: Partial<CalendarDay>): CalendarDay => ({
  date: `2026-01-0${n}`, day: n, weekday: 3 + n, status: "complete", label: "Full day",
  flags: [], clock_in: null, clock_out: null, remark: null, attendance_id: null, late_minutes: 0, undertime_minutes: 0, ot_minutes: 0, ...o,
});

const cal: EmployeeCalendar = {
  employee: { id: 1, full_name: "Ann Cruz" },
  month: "2026-01", prev_month: "2025-12", next_month: "2026-02", first_weekday: 4,
  days: [
    day(1, {}),
    day(2, { status: "late", label: "Late 15m", flags: ["overtime"], clock_in: "7:30 AM", clock_out: "7:20 PM", attendance_id: 9 }),
    day(3, { status: "absent", label: "Absent" }),
  ],
  totals: { complete: 1, late: 1, undertime: 0, overtime: 0, absent: 1, ob: 0, leave: 0, needs_check: 0, late_minutes: 15, undertime_minutes: 0, ot_minutes: 80 },
  legend: [
    { status: "complete", label: "Full day" }, { status: "late", label: "Late" }, { status: "absent", label: "Absent" },
  ],
};

describe("AttendanceCalendar", () => {
  it("pads the grid and renders one cell per day", () => {
    const { container } = render(<AttendanceCalendar cal={cal} canEdit={false} />);
    expect(container.querySelectorAll("[data-pad]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-day]")).toHaveLength(3);
  });

  it("colors the late cell, titles it, and shows one flag dot", () => {
    const { container } = render(<AttendanceCalendar cal={cal} canEdit={false} />);
    const cell = container.querySelectorAll("[data-day]")[1];
    expect(cell.className).toContain("bg-orange-100");
    expect(cell.getAttribute("title")).toContain("Late 15m");
    expect(cell.querySelectorAll("[data-flag]")).toHaveLength(1);
  });

  it("links to the edit page only when canEdit", () => {
    const { unmount } = render(<AttendanceCalendar cal={cal} canEdit />);
    expect(screen.getByRole("link", { name: /Late 15m/ })).toHaveAttribute("href", "/attendance/9/edit");
    unmount();
    const { container } = render(<AttendanceCalendar cal={cal} canEdit={false} />);
    expect(container.querySelectorAll('a[href^="/attendance/"]')).toHaveLength(0);
  });

  it("renders no link when attendance_id is null", () => {
    const noId = { ...cal, days: cal.days.map((d) => ({ ...d, attendance_id: null })) };
    const { container } = render(<AttendanceCalendar cal={noId} canEdit />);
    expect(container.querySelectorAll('a[href^="/attendance/"]')).toHaveLength(0);
  });

  it("renders the legend", () => {
    render(<AttendanceCalendar cal={cal} canEdit={false} />);
    for (const l of cal.legend) expect(screen.getAllByText(l.label).length).toBeGreaterThan(0);
  });
});
