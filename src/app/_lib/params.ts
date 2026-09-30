export function param(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Submitted form fields minus Next's internal $ACTION_* keys, for ActionState.values.
export function formValues(fd: FormData): Record<string, string> {
  return Object.fromEntries([...fd].filter(([k]) => !k.startsWith("$")).map(([k, v]) => [k, String(v)]));
}
