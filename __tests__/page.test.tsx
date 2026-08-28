import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

describe("Home page", () => {
  it("renders", () => {
    render(<Page />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
