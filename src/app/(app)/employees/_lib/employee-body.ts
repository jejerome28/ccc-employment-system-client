const REQUIRED = ["employee_code", "first_name", "last_name", "status"] as const;
const OPTIONAL = ["email", "phone", "position", "department", "hire_date"] as const;

// Explicit keys only: the API rejects unknown fields, and FormData carries Next's $ACTION_* keys.
export function employeeBody(fd: FormData): Record<string, string | null> {
  const body: Record<string, string | null> = {};
  for (const k of REQUIRED) body[k] = String(fd.get(k) ?? "");
  for (const k of OPTIONAL) body[k] = String(fd.get(k) ?? "").trim() || null;
  return body;
}
