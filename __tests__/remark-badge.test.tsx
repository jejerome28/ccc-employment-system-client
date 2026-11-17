import { render, screen } from "@testing-library/react";
import { RemarkBadge, remarkLabel } from "@/app/(app)/_components/RemarkBadge";

test("remarkLabel names the remark and the half", () => {
  expect(remarkLabel({ remark: "leave", remark_part: "whole" })).toBe("Leave");
  expect(remarkLabel({ remark: "ob", remark_part: "am" })).toBe("OB (AM)");
  expect(remarkLabel({ remark: "ob", remark_part: "pm" })).toBe("OB (PM)");
  expect(remarkLabel({ remark: null, remark_part: null })).toBeNull();
});

test("badge shows the label", () => {
  render(<RemarkBadge a={{ remark: "leave", remark_part: "whole" }} />);
  expect(screen.getByText("Leave")).toBeInTheDocument();
});

test("no attendance or no remark renders nothing", () => {
  expect(render(<RemarkBadge a={null} />).container).toBeEmptyDOMElement();
  expect(render(<RemarkBadge a={{ remark: null, remark_part: null }} />).container).toBeEmptyDOMElement();
});
