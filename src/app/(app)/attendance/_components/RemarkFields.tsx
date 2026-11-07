import type { ActionState, Attendance } from "@/app/_lib/types";
import { FieldError } from "../../_components/FieldError";

const input = "w-full rounded border border-line px-3 py-2 text-sm";

export function RemarkFields({ state, attendance }: { state: ActionState; attendance?: Attendance }) {
  return (
    <>
      <div>
        <label htmlFor="remark" className="block text-sm font-medium mb-1">Remark</label>
        <select id="remark" name="remark" defaultValue={state?.values?.remark ?? attendance?.remark ?? ""} className={input}>
          <option value="">None</option>
          <option value="ob">Official business</option>
          <option value="leave">Leave</option>
        </select>
        <FieldError errors={state?.errors} name="remark" />
      </div>
      <div>
        <label htmlFor="remark_part" className="block text-sm font-medium mb-1">Covers</label>
        <select id="remark_part" name="remark_part" defaultValue={state?.values?.remark_part ?? attendance?.remark_part ?? "whole"} className={input}>
          <option value="whole">Whole day</option>
          <option value="am">Morning</option>
          <option value="pm">Afternoon</option>
        </select>
        <FieldError errors={state?.errors} name="remark_part" />
      </div>
    </>
  );
}

export function remarkLabel(a: Pick<Attendance, "remark" | "remark_part">): string | null {
  if (!a.remark) return null;
  const name = a.remark === "ob" ? "OB" : "Leave";
  return a.remark_part === "am" ? `${name} (AM)` : a.remark_part === "pm" ? `${name} (PM)` : name;
}
