import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { canEdit, currentUser } from "@/app/_lib/role";
import { PageHeader } from "../../_components/PageHeader";
import { RosterForm } from "./_components/RosterForm";

export const metadata: Metadata = { title: "Import employees" };

export default async function ImportEmployeesPage() {
  if (!canEdit((await currentUser()).role)) forbidden();
  return (
    <>
      <PageHeader title="Import employees" subtitle="Add or update many employees at once from the roster Excel file. Rows are matched by Person ID." />
      <RosterForm />
    </>
  );
}
