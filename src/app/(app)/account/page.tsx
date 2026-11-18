import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { canEdit, currentUser } from "@/app/_lib/role";
import { PageHeader } from "../_components/PageHeader";
import { AccountForm } from "./_components/AccountForm";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await currentUser();
  if (!canEdit(user.role)) forbidden();

  return (
    <>
      <PageHeader title="My account" subtitle={user.email} />
      <AccountForm name={user.name} />
    </>
  );
}
