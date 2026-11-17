import { logout } from "../_actions/logout.action";

export function UserBlock({ name, email }: { name: string; email: string }) {
  return (
    <>
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-canvas/55 mb-2">{email}</p>
      <form action={logout}>
        <button type="submit" className="text-xs text-canvas/75 underline underline-offset-2 hover:text-white">
          Sign out
        </button>
      </form>
    </>
  );
}
