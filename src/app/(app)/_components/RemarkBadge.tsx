import type { Attendance } from "@/app/_lib/types";

type Remark = Pick<Attendance, "remark" | "remark_part">;

export function remarkLabel(a: Remark): string | null {
  if (!a.remark) return null;
  const name = a.remark === "ob" ? "OB" : "Leave";
  return a.remark_part === "am" ? `${name} (AM)` : a.remark_part === "pm" ? `${name} (PM)` : name;
}

export function RemarkBadge({ a }: { a: Remark | null | undefined }) {
  const label = a && remarkLabel(a);
  return label ? <span className="mr-2 rounded bg-moss/10 px-1.5 py-0.5 text-xs font-semibold text-moss">{label}</span> : null;
}
