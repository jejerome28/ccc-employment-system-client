import { render, screen } from "@testing-library/react";
import { UserBlock } from "@/app/(app)/_components/UserBlock";

jest.mock("@/app/(app)/_actions/logout.action", () => ({ logout: jest.fn() }));

it("admin/hr see My account", () => {
  render(<UserBlock name="Ana" email="hr@x.com" role="hr" />);
  expect(screen.getByRole("link", { name: "My account" })).toHaveAttribute("href", "/account");
});

it("viewer does not", () => {
  render(<UserBlock name="Kiosk" email="v@x.com" role="viewer" />);
  expect(screen.queryByRole("link", { name: "My account" })).not.toBeInTheDocument();
});
