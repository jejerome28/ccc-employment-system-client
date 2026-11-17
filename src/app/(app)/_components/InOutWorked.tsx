export function InOutWorked({ timeIn, timeOut, worked, warn = false }: { timeIn: string; timeOut: string; worked: string; warn?: boolean }) {
  const cell = (label: string, value: string, extra = "") => (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`tnum ${extra}`}>{value}</dd>
    </div>
  );
  return (
    <dl className="grid grid-cols-3 gap-2 text-sm">
      {cell("In", timeIn)}
      {cell("Out", timeOut)}
      {cell("Worked", worked, warn ? "text-clay" : "")}
    </dl>
  );
}
