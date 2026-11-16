import { pageLinks } from "@/app/(app)/employees/_lib/pagination";

describe("pageLinks", () => {
  it("first page", () => expect(pageLinks({ current_page: 1, last_page: 46 })).toEqual({ next: 2, last: 46 }));
  it("last page", () => expect(pageLinks({ current_page: 46, last_page: 46 })).toEqual({ first: 1, prev: 45 }));
  it("out of range", () => expect(pageLinks({ current_page: 999, last_page: 46 })).toEqual({ first: 1 }));
  it("single page", () => expect(pageLinks({ current_page: 1, last_page: 1 })).toEqual({}));
});
