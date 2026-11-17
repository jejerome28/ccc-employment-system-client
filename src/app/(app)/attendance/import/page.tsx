import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { canEdit, currentUser } from "@/app/_lib/role";
import { PageHeader } from "../../_components/PageHeader";
import { ImportForm } from "./_components/ImportForm";

export const metadata: Metadata = { title: "Import biometric report" };

export default async function ImportPage() {
  if (!canEdit((await currentUser()).role)) forbidden();
  return (
    <>
      <PageHeader title="Import biometric report" subtitle="Upload the device's attendance report. Rows for the same employee and date are overwritten." />
      <ImportForm />
    </>
  );
}
