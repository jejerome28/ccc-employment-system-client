import type { Metadata } from "next";
import { apiData } from "@/app/_lib/api.server";
import { formatDate } from "@/app/_lib/format";
import type { Attendance } from "@/app/_lib/types";
import { DeleteButton } from "../../../_components/DeleteButton";
import { PageHeader } from "../../../_components/PageHeader";
import { deleteAttendance } from "../../_actions/attendance.action";
import { AttendanceEditForm } from "../../_components/AttendanceEditForm";

export const metadata: Metadata = { title: "Edit time record" };

export default async function EditAttendancePage(props: PageProps<"/attendance/[id]/edit">) {
  const { id } = await props.params;
  const { attendance } = await apiData<{ attendance: Attendance }>(`/api/attendance/${id}`);

  return (
    <>
      <PageHeader title="Edit time record" subtitle={`${attendance.employee?.full_name} · ${formatDate(attendance.work_date, "long")}`} />
      <AttendanceEditForm attendance={attendance} />
      <div className="mt-6 max-w-xl">
        <DeleteButton
          action={deleteAttendance.bind(null, attendance.id, attendance.work_date)}
          confirmText="Delete this time record?"
          label="Delete this record"
        />
      </div>
    </>
  );
}
