import { render, screen } from "@testing-library/react";
import Loading from "@/app/(app)/loading";
import AttendanceLoading from "@/app/(app)/attendance/loading";
import EmployeesLoading from "@/app/(app)/employees/loading";
import EmployeeLoading from "@/app/(app)/employees/[id]/loading";

test.each([AttendanceLoading, EmployeesLoading, EmployeeLoading])("nested segment reuses the shared placeholder", (Nested) => {
  expect(Nested).toBe(Loading);
});

test("loading placeholder is announced and respects reduced motion", () => {
  const { container } = render(<Loading />);
  expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  const blocks = container.querySelectorAll(".motion-safe\\:animate-pulse");
  expect(blocks.length).toBeGreaterThan(0);
  expect(container.querySelector(".animate-pulse:not(.motion-safe\\:animate-pulse)")).toBeNull();
});
