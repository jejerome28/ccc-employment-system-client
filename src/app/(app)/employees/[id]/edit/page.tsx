import { notFound } from "next/navigation";
import { apiData } from "@/app/_lib/api.server";
import { canEdit, currentUser, isAdmin } from "@/app/_lib/role";
import type { EmployeeDetail } from "@/app/_lib/types";
import { DeleteButton } from "../../../_components/DeleteButton";
import { PageHeader } from "../../../_components/PageHeader";
import { deleteEmployee } from "../../_actions/employee.action";
import { EmployeeForm } from "../../_components/EmployeeForm";

export default async function EditEmployeePage(props: PageProps<"/employees/[id]/edit">) {
  const { id } = await props.params;
  const { role } = await currentUser();
  if (!canEdit(role)) notFound();
  const { employee } = await apiData<EmployeeDetail>(`/api/employees/${id}`);

  return (
    <>
      <PageHeader title={`Edit ${employee.full_name}`} subtitle={employee.employee_code} />
      <EmployeeForm employee={employee} submitLabel="Save changes" />

      {isAdmin(role) && <div className="mt-8 max-w-3xl border border-brick/30 bg-brick/5 rounded p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brick">Archive this employee</p>
          <p className="text-xs text-muted">Hidden from the lists, and their time records are kept. An admin can restore them.</p>
        </div>
        <DeleteButton
          action={deleteEmployee.bind(null, employee.id)}
          confirmText={"Archive this employee? Their time records are kept."}
          label="Archive"
        />
      </div>}
    </>
  );
}
