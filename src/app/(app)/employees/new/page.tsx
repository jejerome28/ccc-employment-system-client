import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canEdit, currentUser } from "@/app/_lib/role";
import { PageHeader } from "../../_components/PageHeader";
import { EmployeeForm } from "../_components/EmployeeForm";

export const metadata: Metadata = { title: "Add employee" };

export default async function NewEmployeePage() {
  if (!canEdit((await currentUser()).role)) notFound();
  return (
    <>
      <PageHeader title="Add employee" subtitle="A code, first name and last name are all that is required." />
      <EmployeeForm submitLabel="Save employee" />
    </>
  );
}
