import { fireEvent, render } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";
import { NavProgress, formStarts, linkStarts } from "@/app/(app)/_components/NavProgress";

jest.mock("next/navigation", () => ({ usePathname: jest.fn(), useSearchParams: jest.fn() }));

const here = new URL("http://localhost/employees?page=1");
const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
const link = (href: string, attrs: Record<string, string> = {}) => {
  const a = document.createElement("a");
  a.href = new URL(href, here).href;
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
  return a;
};
const form = (html: string) => {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.firstElementChild as HTMLFormElement;
};

test("links that navigate start the bar; others don't", () => {
  expect(linkStarts(link("/employees?page=2"), plain, here)).toBe(true);
  expect(linkStarts(link("/dashboard"), plain, here)).toBe(true);
  expect(linkStarts(link("/employees?page=1"), plain, here)).toBe(false);
  expect(linkStarts(link("/dashboard"), { ...plain, ctrlKey: true }, here)).toBe(false);
  expect(linkStarts(link("/dashboard"), { ...plain, button: 1 }, here)).toBe(false);
  expect(linkStarts(link("/dashboard", { target: "_blank" }), plain, here)).toBe(false);
  expect(linkStarts(link("/attendance/summary/export", { download: "" }), plain, here)).toBe(false);
  expect(linkStarts(link("/attendance/summary/export", { "data-no-progress": "" }), plain, here)).toBe(false);
  expect(linkStarts(link("https://example.com/"), plain, here)).toBe(false);
});

test("GET search forms start the bar; downloads, saves and same-URL submits don't", () => {
  expect(formStarts(form('<form action=""><input name="q" value="ana"></form>'), here)).toBe(true);
  expect(formStarts(form('<form action=""><input name="page" value="1"></form>'), here)).toBe(false);
  expect(formStarts(form('<form action="/attendance/export" method="get" data-no-progress><input name="from" value="2026-11-01"></form>'), here)).toBe(false);
  expect(formStarts(form('<form method="post"><input name="q" value="x"></form>'), here)).toBe(false);
  expect(formStarts(form('<form action="javascript:throw new Error()"></form>'), here)).toBe(false);
});

test("bar shows on click and clears when the URL changes", () => {
  (usePathname as jest.Mock).mockReturnValue("/employees");
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("page=1"));
  window.history.replaceState(null, "", "/employees?page=1");
  const { container, rerender, getByText } = render(
    <>
      <NavProgress />
      <a href="/dashboard" onClick={(e) => e.preventDefault()}>go</a>
    </>,
  );
  expect(container.querySelector(".bg-gold")).toBeNull();
  fireEvent.click(getByText("go"));
  expect(container.querySelector(".bg-gold")).not.toBeNull();
  (usePathname as jest.Mock).mockReturnValue("/dashboard");
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(""));
  rerender(
    <>
      <NavProgress />
      <a href="/dashboard" onClick={(e) => e.preventDefault()}>go</a>
    </>,
  );
  expect(container.querySelector(".bg-gold")).toBeNull();
});

test("bar does not reappear when navigating back to the start URL", () => {
  (usePathname as jest.Mock).mockReturnValue("/employees");
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("page=1"));
  window.history.replaceState(null, "", "/employees?page=1");
  const ui = () => (
    <>
      <NavProgress />
      <a href="/dashboard" onClick={(e) => e.preventDefault()}>go</a>
    </>
  );
  const { container, rerender, getByText } = render(ui());
  fireEvent.click(getByText("go"));
  expect(container.querySelector(".bg-gold")).not.toBeNull();
  (usePathname as jest.Mock).mockReturnValue("/dashboard");
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(""));
  rerender(ui());
  expect(container.querySelector(".bg-gold")).toBeNull();
  (usePathname as jest.Mock).mockReturnValue("/employees");
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("page=1"));
  rerender(ui());
  expect(container.querySelector(".bg-gold")).toBeNull();
});
