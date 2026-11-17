import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/app/(app)/_components/MobileNav";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));
jest.mock("@/app/(app)/_actions/logout.action", () => ({ logout: jest.fn() }));

const pathname = usePathname as jest.Mock;
const props = { role: "admin" as const, name: "System Administrator", email: "admin@example.com", today: "17 Nov 2026" };
const toggle = () => screen.getByRole("button", { name: /menu/i });

beforeEach(() => pathname.mockReturnValue("/dashboard"));

test("starts closed and opens on tap", () => {
  render(<MobileNav {...props} />);
  expect(toggle()).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("link", { name: "Employees" })).not.toBeInTheDocument();

  fireEvent.click(toggle());
  expect(toggle()).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "Employees" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
});

test("Escape closes it", () => {
  render(<MobileNav {...props} />);
  fireEvent.click(toggle());
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("link", { name: "Employees" })).not.toBeInTheDocument();
  expect(toggle()).toHaveFocus();
});

test("tapping a link closes it", () => {
  render(<MobileNav {...props} />);
  fireEvent.click(toggle());
  fireEvent.click(screen.getByRole("link", { name: "Today" }));
  expect(screen.queryByRole("link", { name: "Employees" })).not.toBeInTheDocument();
});

test("closes when the route changes (e.g. browser Back)", () => {
  const { rerender } = render(<MobileNav {...props} />);
  fireEvent.click(toggle());
  pathname.mockReturnValue("/employees");
  rerender(<MobileNav {...props} />);
  expect(screen.queryByRole("link", { name: "Today" })).not.toBeInTheDocument();
});

test("viewers do not get admin links", () => {
  render(<MobileNav {...props} role="viewer" />);
  fireEvent.click(toggle());
  expect(screen.getByRole("link", { name: "Cutoff summary" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Import" })).not.toBeInTheDocument();
});

test("hr gets Import but not admin-only links", () => {
  render(<MobileNav {...props} role="hr" />);
  fireEvent.click(toggle());
  expect(screen.getByRole("link", { name: "Import" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
});

test("does not reopen when returning to the page it was opened on", () => {
  const { rerender } = render(<MobileNav {...props} />);
  fireEvent.click(toggle());
  pathname.mockReturnValue("/employees");
  rerender(<MobileNav {...props} />);
  pathname.mockReturnValue("/dashboard");
  rerender(<MobileNav {...props} />);
  expect(screen.queryByRole("link", { name: "Employees" })).not.toBeInTheDocument();
});

test("phone header shows the CCC shield", () => {
  render(<MobileNav {...props} />);
  expect(screen.getByRole("img", { name: "City College of Calamba shield" })).toBeInTheDocument();
});

test("active nav link is marked current", () => {
  render(<MobileNav {...props} />);
  fireEvent.click(toggle());
  expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Employees" })).not.toHaveAttribute("aria-current");
});
