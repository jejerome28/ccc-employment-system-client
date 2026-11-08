export type Attendance = {
  id: number;
  employee_id: number;
  work_date: string; // Y-m-d
  clock_in_at: string | null;
  clock_out_at: string | null;
  notes: string | null;
  remark: "ob" | "leave" | null;
  remark_part: "whole" | "am" | "pm" | null;
  worked_minutes: number | null;
  timetable: string | null;
  status: string | null;
  work_minutes: number | null;
  ot_minutes: number | null;
  attended_minutes: number | null;
  late_minutes: number | null;
  early_minutes: number | null;
  absent_minutes: number | null;
  leave_minutes: number | null;
  employee?: Employee;
};

export type Employee = {
  id: number;
  employee_code: string;
  biometric_id: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null; // Y-m-d
  status: "active" | "inactive";
  archived_at: string | null;
  today_attendance?: Attendance | null;
};

export type Role = "admin" | "hr" | "viewer";

export type User = { id: number; name: string; email: string; role: Role };

export type Paginated<T> = {
  items: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export type DashboardData = {
  date: string;
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
  date: string;
  attendances: Attendance[];
  total_minutes: number;
  employees: Employee[];
};

export type SummaryNumbers = {
  present: number;
  absent: number;
  late_count: number;
  late_minutes: number;
  undertime_minutes: number;
  ot_minutes: number;
  ob: number;
  leave: number;
  needs_check: number;
};

export type SummaryRow = SummaryNumbers & {
  employee_id: number;
  person_id: string | null;
  name: string;
  department: string | null;
};

export type Summary = {
  from: string;
  to: string;
  computed_through: string | null;
  rows: SummaryRow[];
  totals: SummaryNumbers;
  needs_check: { employee_id: number; name: string; work_date: string; punch: string }[];
};

export type FieldErrors = Record<string, string[]>;

// `values` echoes submitted fields back on failure: React 19 resets uncontrolled inputs after
// every form action, so forms use `state?.values?.x ?? original` as defaultValue to keep input.
export type ActionState =
  | { message?: string; error?: string; errors?: FieldErrors; values?: Record<string, string> }
  | undefined;

export type CalendarStatus =
  | "complete" | "late" | "undertime" | "overtime" | "absent" | "ob" | "leave"
  | "needs_check" | "off" | "holiday" | "future" | "in_progress" | "rest_day_worked";

export type CalendarDay = {
  date: string;
  day: number;
  weekday: number;
  status: CalendarStatus;
  label: string;
  flags: CalendarStatus[];
  clock_in: string | null;
  clock_out: string | null;
  remark: string | null;
  attendance_id: number | null;
  late_minutes: number;
  undertime_minutes: number;
  ot_minutes: number;
};

export type EmployeeCalendar = {
  employee: { id: number; full_name: string };
  month: string;
  prev_month: string;
  next_month: string;
  first_weekday: number;
  days: CalendarDay[];
  totals: Record<"complete" | "late" | "undertime" | "overtime" | "absent" | "ob" | "leave" | "needs_check", number> &
    Record<"late_minutes" | "undertime_minutes" | "ot_minutes", number>;
  legend: { status: CalendarStatus; label: string }[];
};
