import type { FieldErrors } from "@/app/_lib/types";

export function FieldError({ errors, name }: { errors?: FieldErrors; name: string }) {
  const message = errors?.[name]?.[0];
  return message ? <p className="mt-1 text-xs text-brick">{message}</p> : null;
}
