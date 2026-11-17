import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { apiData } from "@/app/_lib/api.server";
import { currentUser, isAdmin } from "@/app/_lib/role";
import type { User } from "@/app/_lib/types";
import { PageHeader } from "../_components/PageHeader";
import { UserForm } from "./_components/UserForm";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  if (!isAdmin((await currentUser()).role)) forbidden();
  const { users } = await apiData<{ users: User[] }>("/api/users");

  return (
    <>
      <PageHeader title="Users" subtitle={`${users.length} accounts`} />
      <div className="space-y-3 max-w-5xl">
        {users.map((u) => <UserForm key={u.id} user={u} />)}
      </div>
      <h2 className="mt-8 mb-3 font-heading text-lg font-semibold text-navy">Add user</h2>
      <div className="max-w-5xl"><UserForm /></div>
    </>
  );
}
