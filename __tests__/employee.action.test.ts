/** @jest-environment node */
import { saveEmployee } from "@/app/(app)/employees/_actions/employee.action";
import { employeeBody } from "@/app/(app)/employees/_lib/employee-body";
import { apiFetch } from "@/app/_lib/api.server";
import { redirect } from "next/navigation";

jest.mock("@/app/_lib/api.server", () => ({ apiFetch: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

const fd = () => {
  const f = new FormData();
  f.set("employee_code", "EMP-100");
  f.set("first_name", "Maria");
  f.set("last_name", "Santos");
  f.set("email", "");
  f.set("phone", "");
  f.set("position", "HR Officer");
  f.set("department", "");
  f.set("hire_date", "");
  f.set("status", "active");
  f.set("$ACTION_ID_abc", "");
  return f;
};

beforeEach(() => jest.clearAllMocks());

it("employeeBody maps blanks to null and only known keys", () => {
  expect(employeeBody(fd())).toEqual({
    employee_code: "EMP-100",
    first_name: "Maria",
    last_name: "Santos",
    email: null,
    phone: null,
    position: "HR Officer",
    department: null,
    hire_date: null,
    status: "active",
  });
});

it("creates with POST and redirects to the new employee", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({ ok: true, status: 201, message: "Employee created.", data: { employee: { id: 42 } } });

  await expect(saveEmployee(null, undefined, fd())).rejects.toThrow("NEXT_REDIRECT");

  expect(apiFetch).toHaveBeenCalledWith("/api/employees", { method: "POST", body: employeeBody(fd()) });
  expect(redirect).toHaveBeenCalledWith("/employees/42");
});

it("updates with PUT and returns 422 field errors", async () => {
  (apiFetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 422,
    message: "The given data was invalid.",
    errors: { employee_code: ["The employee code has already been taken."] },
  });

  const state = await saveEmployee(5, undefined, fd());

  expect(apiFetch).toHaveBeenCalledWith("/api/employees/5", { method: "PUT", body: employeeBody(fd()) });
  expect(state).toEqual({
    error: "The given data was invalid.",
    errors: { employee_code: ["The employee code has already been taken."] },
    values: expect.objectContaining({ employee_code: "EMP-100", first_name: "Maria" }),
  });
  expect(state?.values).not.toHaveProperty("$ACTION_ID_abc");
});
