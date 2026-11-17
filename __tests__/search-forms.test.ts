import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(__dirname, "..", "src/app/(app)", p), "utf8");
const pages = ["dashboard/page.tsx", "attendance/page.tsx", "attendance/summary/page.tsx", "employees/page.tsx", "employees/[id]/page.tsx"];

test.each(pages)("%s search form uses next/form on the same route", (p) => {
  const src = read(p);
  expect(src).toContain('import Form from "next/form";');
  expect(src).toMatch(/<Form action="" className=/);
  expect(src).not.toMatch(/<form className=/);
});

test("export download stays a native form", () => {
  expect(read("attendance/page.tsx")).toContain('<form action="/attendance/export" method="get"');
});

test("archived search keeps its hidden input inside the Form", () => {
  expect(read("employees/page.tsx")).toMatch(/<Form action="" className="[^"]*">\s*\{archived && <input type="hidden" name="archived" value="1" \/>\}/);
});
