import { apiData } from "@/app/_lib/api.server";
import type { EmployeeDetail } from "@/app/_lib/types";
import { DeleteButton } from "../../../_components/DeleteButton";
import { PageHeader } from "../../../_components/PageHeader";
import { deleteEmployee } from "../../_actions/employee.action";
import { EmployeeForm } from "../../_components/EmployeeForm";

export default async function EditEmployeePage(props: PageProps<"/employees/[id]/edit">) {
  const { id } = await props.params;
  const { employee } = await apiData<EmployeeDetail>(`/api/employees/${id}`);

  return (
    <>
      <PageHeader title={`Edit ${employee.full_name}`} subtitle={employee.employee_code} />
      <EmployeeForm employee={employee} submitLabel="Save changes" />

      <div className="mt-8 max-w-3xl border border-brick/30 bg-brick/5 rounded p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brick">Delete this employee</p>
          <p className="text-xs text-muted">Their attendance history is removed too. Set the status to inactive instead if you need the records.</p>
        </div>
        <DeleteButton
          action={deleteEmployee.bind(null, employee.id)}
          confirmText={`Delete ${employee.full_name} and every attendance record for them? This cannot be undone.`}
          label="Delete"
        />
      </div>
    </>
  );
}
