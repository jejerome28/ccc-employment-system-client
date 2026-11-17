import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { apiData } from "@/app/_lib/api.server";
import { currentUser, isAdmin } from "@/app/_lib/role";
import type { ReportSignatory } from "@/app/_lib/types";
import { PageHeader } from "../../_components/PageHeader";
import { SignatoryForm } from "./_components/SignatoryForm";

export const metadata: Metadata = { title: "Report settings" };

export default async function ReportSettingsPage() {
  if (!isAdmin((await currentUser()).role)) forbidden();
  const { signatories } = await apiData<{ signatories: ReportSignatory[] }>("/api/report-signatories");

  return (
    <>
      <PageHeader title="Report settings" subtitle="One line per title line. Used at the bottom of every CRA block." />
      <div className="max-w-3xl">
        <SignatoryForm signatories={signatories} />
      </div>
    </>
  );
}
