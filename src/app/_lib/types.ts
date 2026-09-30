export type Attendance = {
  id: number;
  employee_id: number;
  work_date: string; // Y-m-d
  time_in: string | null; // HH:MM:SS
  time_out: string | null;
  notes: string | null;
  worked_minutes: number | null;
  employee?: Employee;
};

export type Employee = {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null; // Y-m-d
  status: "active" | "inactive";
  today_attendance?: Attendance | null;
};

export type User = { id: number; name: string; email: string };

export type Paginated<T> = {
  items: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export type DashboardData = {
  stats: { employees: number; active: number; clocked_in: number; completed: number; not_in: number };
  hours_today: number;
  employees: Employee[];
};

export type EmployeeDetail = {
  employee: Employee;
  attendances: Attendance[];
  total_minutes: number;
  days_present: number;
};

export type AttendanceDay = {
  attendances: Attendance[];
  total_minutes: number;
  employees: Employee[];
};

export type FieldErrors = Record<string, string[]>;

// `values` echoes submitted fields back on failure: React 19 resets uncontrolled inputs after
// every form action, so forms use `state?.values?.x ?? original` as defaultValue to keep input.
export type ActionState =
  | { message?: string; error?: string; errors?: FieldErrors; values?: Record<string, string> }
  | undefined;
