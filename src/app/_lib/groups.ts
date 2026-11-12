import type { EmploymentGroup } from "./types";

// Block order matches the CRA report.
export const GROUPS: { value: EmploymentGroup; label: string }[] = [
  { value: "permanent", label: "Permanent Teaching" },
  { value: "cos_non_teaching", label: "COS Non-Teaching" },
  { value: "permanent_non_teaching", label: "Permanent Non-Teaching" },
  { value: "cos_teaching", label: "COS Teaching" },
];

export const groupLabel = (g: EmploymentGroup | null) => GROUPS.find((x) => x.value === g)?.label ?? "Not set";
