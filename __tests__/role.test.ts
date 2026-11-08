/** @jest-environment node */
import { canEdit, isAdmin } from "@/app/_lib/role";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/api.server", () => ({ apiData: jest.fn() }));

test("canEdit is true for admin and hr only", () => {
  expect(canEdit("admin")).toBe(true);
  expect(canEdit("hr")).toBe(true);
  expect(canEdit("viewer")).toBe(false);
});

test("isAdmin is true for admin only", () => {
  expect(isAdmin("admin")).toBe(true);
  expect(isAdmin("hr")).toBe(false);
  expect(isAdmin("viewer")).toBe(false);
});
