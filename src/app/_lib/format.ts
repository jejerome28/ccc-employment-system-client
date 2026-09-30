const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

export function formatClock(time: string | null | undefined): string {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
}

export function formatMinutes(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${pad(minutes % 60)}m`;
}

export function formatDuration(
  a: { time_in: string | null; worked_minutes: number | null } | null | undefined,
): string {
  if (!a) return "—";
  if (a.worked_minutes === null) return a.time_in ? "Still in" : "—";
  return formatMinutes(a.worked_minutes);
}

// Parses Y-m-d by hand: new Date("2026-09-30") is UTC midnight and shows the previous day west of UTC.
export function formatDate(ymd: string, style: "long" | "short" | "medium"): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const day = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const month = MONTHS[m - 1];
  if (style === "long") return `${day}, ${pad(d)} ${month} ${y}`;
  if (style === "short") return `${day.slice(0, 3)}, ${pad(d)} ${month.slice(0, 3)}`;
  return `${pad(d)} ${month.slice(0, 3)} ${y}`;
}

export function todayManila(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
}
