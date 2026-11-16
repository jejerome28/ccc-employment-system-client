import { render, screen } from "@testing-library/react";
import { Pager } from "@/app/(app)/_components/Pager";

const href = (n: number) => `/x?q=ana&page=${n}`;
const meta = (current_page: number, last_page: number) => ({ current_page, last_page, per_page: 10, total: 30 });

test("renders nav links and position", () => {
  render(<Pager meta={meta(2, 3)} href={href} empty={false} />);
  expect(screen.getByText("First")).toHaveAttribute("href", "/x?q=ana&page=1");
  expect(screen.getByText("Previous")).toHaveAttribute("href", "/x?q=ana&page=1");
  expect(screen.getByText("Next")).toHaveAttribute("href", "/x?q=ana&page=3");
  expect(screen.getByText("Last")).toHaveAttribute("href", "/x?q=ana&page=3");
  expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
});

test("renders nothing for a single page", () => {
  const { container } = render(<Pager meta={meta(1, 1)} href={href} empty={false} />);
  expect(container).toBeEmptyDOMElement();
});

test("empty out-of-range page offers a way back", () => {
  render(<Pager meta={meta(9, 3)} href={href} empty />);
  expect(screen.getByText(/No rows on this page\./)).toBeInTheDocument();
  expect(screen.getByText("Go to page 1")).toHaveAttribute("href", "/x?q=ana&page=1");
});
