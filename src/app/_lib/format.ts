const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

const OFFSET = "+08:00";
const OFFSET_MS = 8 * 60 * 60 * 1000;

const manila = (iso: string) => new Date(Date.parse(iso) + OFFSET_MS);

export function formatClock(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = manila(iso);
  const h = d.getUTCHours();
  return `${h % 12 || 12}:${pad(d.getUTCMinutes())} ${h < 12 ? "AM" : "PM"}`;
}

export function toClockInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = manila(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function manilaToUtcIso(ymd: string, hhmm: string): string {
  return new Date(`${ymd}T${hhmm}:00${OFFSET}`).toISOString().replace(".000Z", "Z");
}

export function formatMinutes(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${pad(minutes % 60)}m`;
}

export function formatDuration(
  a: { clock_in_at: string | null; worked_minutes: number | null } | null | undefined,
): string {
  if (!a) return "—";
  if (a.worked_minutes === null) return a.clock_in_at ? "Still in" : "—";
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
  return manila(new Date().toISOString()).toISOString().slice(0, 10);
}

export function thisMonthManila(): string {
  return todayManila().slice(0, 7);
}
