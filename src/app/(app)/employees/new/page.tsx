import type { Metadata } from "next";
import { PageHeader } from "../../_components/PageHeader";
import { EmployeeForm } from "../_components/EmployeeForm";

export const metadata: Metadata = { title: "Add employee" };

export default function NewEmployeePage() {
  return (
    <>
      <PageHeader title="Add employee" subtitle="A code, first name and last name are all that is required." />
      <EmployeeForm submitLabel="Save employee" />
    </>
  );
}
